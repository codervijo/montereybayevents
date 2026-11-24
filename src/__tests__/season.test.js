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

describe('holiday season (v2.S)', () => {
  it('wraps the year: Nov 1 to Jan 4 inclusive', async () => {
    const { inHolidaySeason } = await import('../data/season.ts');
    expect(inHolidaySeason('2026-10-31')).toBe(false);
    expect(inHolidaySeason('2026-11-01')).toBe(true);
    expect(inHolidaySeason('2026-12-31')).toBe(true);
    expect(inHolidaySeason('2027-01-04')).toBe(true);
    expect(inHolidaySeason('2027-01-05')).toBe(false);
    expect(inHolidaySeason('2027-07-15')).toBe(false);
  });

  it('points Holidays at the lights map all season', async () => {
    const { holidayNavItem } = await import('../data/season.ts');
    expect(holidayNavItem('2026-11-24')).toEqual({ to: '/holiday-lights/', label: 'Holidays' });
    expect(holidayNavItem('2026-11-29')).toEqual({ to: '/holiday-lights/', label: 'Holidays' });
    expect(holidayNavItem('2026-11-30')).toEqual({ to: '/holiday-lights/', label: 'Holidays' });
    expect(holidayNavItem('2027-01-05')).toBeUndefined();
  });
});
