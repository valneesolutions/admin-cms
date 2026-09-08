import assert from 'node:assert/strict';
import test from 'node:test';
import { fillAndSortDailyPerformance } from './gsc-search.js';

test('fillAndSortDailyPerformance fills gaps and sorts dates chronologically', () => {
  const inputRows = [
    { date: '2026-09-03', clicks: 10, impressions: 100, ctr: 0.1, position: 5 },
    { date: '2026-09-01', clicks: 5, impressions: 50, ctr: 0.1, position: 8 },
  ];

  const result = fillAndSortDailyPerformance(inputRows, '2026-09-01', '2026-09-04');

  assert.equal(result.length, 4);
  assert.equal(result[0].date, '2026-09-01');
  assert.equal(result[0].clicks, 5);
  assert.equal(result[1].date, '2026-09-02');
  assert.equal(result[1].clicks, 0); // Gap filled!
  assert.equal(result[2].date, '2026-09-03');
  assert.equal(result[2].clicks, 10);
  assert.equal(result[3].date, '2026-09-04');
  assert.equal(result[3].clicks, 0); // Gap filled!
});
