// src/__tests__/season.test.js — v2.R: Car Week notices render only in season.
import { describe, it, expect } from 'vitest';
import { CAR_WEEK_SEASON, inCarWeekSeason } from '../data/season.ts';

describe('Car Week season (src/data/season.ts)', () => {
  it('is a month-day range with no year in it', () => {
    expect(CAR_WEEK_SEASON.from).toMatch(/^\d{2}-\d{2}$/);
    expect(CAR_WEEK_SEASON.to).toMatch(/^\d{2}-\d{2}$/);
  });

  it('is on from 1 July through 31 August, in any year', () => {
    for (const d of ['2026-07-01', '2026-08-16', '2026-08-31', '2027-07-01', '2031-08-15']) {
      expect(inCarWeekSeason(d), d).toBe(true);
    }
  });

  it('is off the rest of the year', () => {
    for (const d of ['2026-06-30', '2026-09-01', '2026-11-01', '2027-01-15', '2027-06-30']) {
      expect(inCarWeekSeason(d), d).toBe(false);
    }
  });
});
