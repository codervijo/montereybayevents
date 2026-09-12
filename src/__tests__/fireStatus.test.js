// Guards for the build-time fire feed reader, src/lib/fireStatus.ts.
//
// These do NOT hit the network. The point of this file is the parsing and the
// sanity bounds, because an auto-injected figure has no human between it and
// the reader — refusing to believe nonsense is the only guard left.
//
// Context: between 25 and 28 August 2026 the hand-typed acreage on /traffic/
// went 46% wrong while the site rebuilt cleanly every morning, and the page
// asserted Highway 1 was open for three days after a 40-mile stretch closed.
// fireStatus.ts exists to close both gaps; these tests keep it honest.

import { describe, it, expect } from 'vitest';
import {
  formatAcres,
  formatUpdated,
  detectMontereyWildfireClosure,
} from '../lib/fireStatus.ts';
import { timberFire } from '../data/traffic.ts';

// The shape CAL FIRE actually returns, trimmed to the fields we read.
// Values are the real 2026-08-28 reading.
const REAL = {
  Name: 'Timber Fire ',
  County: 'Monterey',
  AcresBurned: 23343.0,
  PercentContained: 21.0,
  IsActive: true,
  Updated: '2026-08-28T19:24:19Z',
};

describe('formatAcres', () => {
  it('separates thousands and does not round away detail', () => {
    expect(formatAcres(23343)).toBe('23,343 acres');
    expect(formatAcres(2774)).toBe('2,774 acres');
    expect(formatAcres(999)).toBe('999 acres');
  });

  it('rounds a fractional reading rather than printing it', () => {
    // The API really does return 12615.5.
    expect(formatAcres(12615.5)).toBe('12,616 acres');
  });
});

describe('formatUpdated', () => {
  it('renders the CAL FIRE stamp in Pacific time, not UTC', () => {
    // 19:24Z on 2026-08-28 is 12:24pm PDT the same day.
    expect(formatUpdated('2026-08-28T19:24:19Z')).toBe(
      'Friday, 28 August 2026 at 12:24pm',
    );
  });

  it('does not roll the date forward for an evening Pacific reading', () => {
    // 01:20Z on the 23rd is 6:20pm PDT on the 22nd. Printing "23 August" here
    // would age the figures a day early, which is how a UTC bug would surface.
    expect(formatUpdated('2026-08-23T01:20:42Z')).toBe(
      'Saturday, 22 August 2026 at 6:20pm',
    );
  });
});

// The bounds live inside the module's private toLiveIncident(), so they are
// exercised here through the same predicates the module applies. If these
// rules change in fireStatus.ts they must change here too — that coupling is
// deliberate, because these are the values that would otherwise reach a reader
// unchecked.
describe('sanity bounds a live reading must satisfy', () => {
  const MAX_PLAUSIBLE_ACRES = 2_000_000;
  const plausible = (r) =>
    String(r.County ?? '') === 'Monterey' &&
    r.IsActive === true &&
    Boolean(String(r.Name ?? '').trim()) &&
    Number.isFinite(Number(r.AcresBurned)) &&
    Number(r.AcresBurned) > 0 &&
    Number(r.AcresBurned) <= MAX_PLAUSIBLE_ACRES &&
    Number.isFinite(Number(r.PercentContained)) &&
    Number(r.PercentContained) >= 0 &&
    Number(r.PercentContained) <= 100 &&
    !Number.isNaN(Date.parse(String(r.Updated ?? '')));

  it('accepts the real 2026-08-28 reading', () => {
    expect(plausible(REAL)).toBe(true);
  });

  it('rejects a unit change dressed as acreage', () => {
    // Square feet instead of acres is the failure that would publish a number
    // 43,560x too large without anyone noticing.
    expect(plausible({ ...REAL, AcresBurned: 23343 * 43560 })).toBe(false);
  });

  it('rejects impossible containment', () => {
    expect(plausible({ ...REAL, PercentContained: 140 })).toBe(false);
    expect(plausible({ ...REAL, PercentContained: -1 })).toBe(false);
  });

  it('rejects a missing or unparseable timestamp', () => {
    expect(plausible({ ...REAL, Updated: '' })).toBe(false);
    expect(plausible({ ...REAL, Updated: 'sometime tuesday' })).toBe(false);
  });

  it('rejects zero acres and non-numeric acreage', () => {
    expect(plausible({ ...REAL, AcresBurned: 0 })).toBe(false);
    expect(plausible({ ...REAL, AcresBurned: null })).toBe(false);
  });

  it('rejects other counties and inactive incidents', () => {
    expect(plausible({ ...REAL, County: 'Santa Cruz' })).toBe(false);
    expect(plausible({ ...REAL, IsActive: false })).toBe(false);
  });
});

// The Caltrans feed is plain text with hard line wraps, so the detector
// normalises whitespace before matching. These fixtures are the real wording.
//
// THE DETECTOR IS IMPORTED, NOT RE-IMPLEMENTED. It used to be copied into this
// file as a local regex, which meant these tests passed for two weeks while the
// shipped detector was returning the wrong answer on the live feed. A test that
// re-states the implementation tests nothing.
describe('Highway 1 wildfire-closure detection', () => {
  const detect = detectMontereyWildfireClosure;

  it('fires on the real 2026-08-28 closure, across its line wraps', () => {
    const real =
      '[IN THE CENTRAL CALIFORNIA AREA]\n' +
      'Is closed from 11.7 mi north of Ragged Point to 3.6 mi north of Big Sur\n' +
      '(Monterey Co) - Due to a wildfire - Motorists are advisedto use an alternate\n' +
      'route\n';
    expect(detect(real)).toBe(true);
  });

  it('does not fire on the roadworks-only state of 2026-08-25', () => {
    const real =
      '[IN THE CENTRAL CALIFORNIA AREA]\n' +
      '1-way controlled traffic 15.7 mi south of Monterey /at Rocky Creek Bridge/\n' +
      '(Monterey Co) 24 hrs a day 7 days a week thru 0600 hrs on 8/31/26 - Due to\n' +
      'construction\n';
    expect(detect(real)).toBe(false);
  });

  it('does not pair one entry\'s closure with another entry\'s wildfire', () => {
    // A closure in Monterey for construction, and a wildfire entry in a
    // different area, must not combine into a false positive. The section
    // bracket bounds the match.
    const mixed =
      'Is closed from A to B (Monterey Co) - Due to construction\n' +
      '[IN THE NORTHERN CALIFORNIA AREA]\n' +
      'Is closed from C to D (Mendocino Co) - Due to a wildfire\n';
    expect(detect(mixed)).toBe(false);
  });

  it('fires on a segment located off the county LINE, with no parenthetical', () => {
    // The exact live wording on 2026-09-11 that the previous pattern missed.
    // It requires no "(Monterey Co)" anywhere, which is why this regressed.
    const real =
      '[IN THE CENTRAL CALIFORNIA AREA] Is closed to from 11.1 mi north of the\n' +
      'San Luis Obispo/Monterey Co Line /at Los Burros/ to 19 mi north of the\n' +
      'San Luis Obispo/Monterey Co Line /at Kirk Creek Camp/ - Due to a wildfire -\n' +
      'Motorists are advised to use an alternate route\n';
    expect(detect(real)).toBe(true);
  });

  it('does not fire when the only Monterey closure is for construction', () => {
    // The rest of the same 2026-09-11 feed. A Monterey entry and a wildfire
    // entry both exist; neither is a Monterey wildfire closure.
    const real =
      'Is closed at various locations (Marin Co) - Due to a wildfire - blah ' +
      '1-way controlled traffic 15.7 mi south of Monterey /at Rocky Creek Bridge/ ' +
      '(Monterey Co) 24 hrs a day 7 days a week thru 0600 hrs on 11/30/26 - Due to construction';
    expect(detect(real)).toBe(false);
  });

  it('matches every form Caltrans uses to name the county', () => {
    for (const where of ['(Monterey Co)', 'Monterey Co Line', 'in Monterey County']) {
      expect(detect(`Is closed from A to B ${where} - Due to a wildfire - x`), where).toBe(true);
    }
  });

  it('ignores a wildfire closure in another county', () => {
    expect(detect('Is closed from A to B (Mendocino Co) - Due to a wildfire - x')).toBe(false);
  });
});

describe('the incident data still declares what the build checks', () => {
  it('carries a roadClaim the Caltrans detector can be compared against', () => {
    expect(['open', 'closed']).toContain(timberFire.roadClaim);
  });

  it('keeps hand-checked fallback figures for when the feed cannot be read', () => {
    for (const field of ['size', 'containment', 'asOf']) {
      expect(typeof timberFire[field], field).toBe('string');
      expect(timberFire[field].length, field).toBeGreaterThan(10);
    }
  });
});
