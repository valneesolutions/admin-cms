import assert from 'node:assert/strict';
import test from 'node:test';
import {
  fetchAllGSCRows,
  fillAndSortDailyPerformance,
  getGSCOverviewSummary,
  getGSCTopQueries,
  getGSCStrikingDistance,
  GSCQueryRequest,
  GSCSearchAnalyticsRow,
} from './gsc-search.js';

const baseOptions = {
  userId: 'user-1',
  connectionId: 'conn-1',
  startDate: '2026-08-01',
  endDate: '2026-08-28',
};

function makeRow(overrides: Partial<GSCSearchAnalyticsRow> = {}): GSCSearchAnalyticsRow {
  return {
    clicks: 1,
    impressions: 10,
    ctr: 0.1,
    position: 5,
    ...overrides,
  };
}

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

test('fetchAllGSCRows returns rows from a single short response without paging', async () => {
  const calls: GSCQueryRequest[] = [];
  const rows = [makeRow({ query: 'a' }), makeRow({ query: 'b' }), makeRow({ query: 'c' })];

  const result = await fetchAllGSCRows(baseOptions, {
    executeQuery: async (request) => {
      calls.push(request);
      return rows;
    },
  });

  assert.deepEqual(result, rows);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].startRow, 0);
});

test('fetchAllGSCRows pages with startRow=0 then startRow=pageSize and stops on a short page', async () => {
  const startRows: number[] = [];
  const pageRows: Record<number, GSCSearchAnalyticsRow[]> = {
    0: [makeRow(), makeRow()],
    2: [makeRow(), makeRow()],
    4: [makeRow()], // Short page: end of data.
  };

  const result = await fetchAllGSCRows(baseOptions, {
    pageSize: 2,
    maxTotalRows: 10,
    executeQuery: async (request) => {
      startRows.push(request.startRow);
      return pageRows[request.startRow];
    },
  });

  assert.equal(result.length, 5);
  assert.deepEqual(startRows, [0, 2, 4]);
});

test('fetchAllGSCRows stops at the configured maximum even when pages stay full', async () => {
  const calls: GSCQueryRequest[] = [];

  const result = await fetchAllGSCRows(baseOptions, {
    pageSize: 2,
    maxTotalRows: 4,
    executeQuery: async (request) => {
      calls.push(request);
      return [makeRow(), makeRow()]; // Always a full page.
    },
  });

  assert.equal(result.length, 4);
  assert.equal(calls.length, 2); // Loop guard prevents runaway pagination.
});

test('getGSCTopQueries collects multiple API pages and is not truncated to the first batch', async () => {
  const requests: GSCQueryRequest[] = [];

  const result = await getGSCTopQueries(baseOptions, {
    pageSize: 2,
    maxTotalRows: 4,
    executeQuery: async (request) => {
      requests.push(request);
      return [
        makeRow({ query: `q${request.startRow}` }),
        makeRow({ query: `q${request.startRow + 1}` }),
      ];
    },
  });

  assert.equal(result.length, 4);
  assert.equal(requests.length, 2);
  assert.deepEqual(requests[0].dimensions, ['query']);
  assert.deepEqual(result.map((r) => r.query), ['q0', 'q1', 'q2', 'q3']);
});

test('getGSCStrikingDistance filters and dedupes before applying the final limit', async () => {
  const apiRows = [
    makeRow({ query: 'top', page: '/a', position: 1, impressions: 500 }), // Out of range.
    makeRow({ query: 'deep', page: '/b', position: 25, impressions: 400 }), // Out of range.
    makeRow({ query: 'mid1', page: '/c', position: 10, impressions: 80 }),
    makeRow({ query: 'mid2', page: '/d', position: 6, impressions: 50 }),
    makeRow({ query: 'dup', page: '/e', position: 15, impressions: 60 }),
    makeRow({ query: 'dup', page: '/e', position: 15, impressions: 60 }), // Duplicate combo.
  ];

  const result = await getGSCStrikingDistance(baseOptions, {
    maxTotalRows: 100,
    finalLimit: 2,
    executeQuery: async () => apiRows,
  });

  // Filtering + dedupe happen before the limit: only 3 distinct in-range
  // rows exist, so the final limit of 2 keeps the top-2 by impressions.
  assert.equal(result.length, 2);
  assert.deepEqual(result.map((r) => r.query), ['mid1', 'dup']);
  assert.ok(result.every((r) => r.position >= 5 && r.position <= 20));
  assert.ok(result[0].impressions >= result[1].impressions);
});

test('getGSCOverviewSummary uses the no-dimension totals request instead of summing query rows', async () => {
  const requests: GSCQueryRequest[] = [];

  const result = await getGSCOverviewSummary(baseOptions, {
    executeQuery: async (request) => {
      requests.push(request);
      // Google's unfiltered totals: much larger than any query row sum.
      return [makeRow({ clicks: 9000, impressions: 90000, ctr: 0.1, position: 8.5 })];
    },
  });

  assert.equal(requests.length, 1);
  // No dimensions: the row is Google's overall total, not a dimensioned slice.
  assert.equal(requests[0].dimensions, undefined);
  assert.deepEqual(result, { clicks: 9000, impressions: 90000, ctr: 0.1, position: 8.5 });
});
