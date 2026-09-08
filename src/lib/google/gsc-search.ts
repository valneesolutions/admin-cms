if (process.env.NODE_ENV !== "test") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("server-only");
  } catch {
    // Ignore in non-Next environments
  }
}

import { google } from "googleapis";
import { getPayload } from "payload";

import config from "@/payload.config";
import { getGoogleOAuthClient } from "@/lib/google/gsc-oauth";
import type { GscConnection } from "@/payload-types";

const DEFAULT_ROW_LIMIT = 100;
const DEFAULT_SEARCH_TYPE = "web";
const SEARCH_ANALYTICS_DIMENSIONS = [
  "date",
  "query",
  "page",
  "device",
  "country",
] as const;

export type GSCSearchDimension = (typeof SEARCH_ANALYTICS_DIMENSIONS)[number];
export type GSCId = string | number;

export type GSCDimensionFilter = {
  dimension: "query" | "page" | "device" | "country";
  operator?: "equals" | "contains" | "notEquals" | "notContains";
  expression: string;
};

export type GSCSearchAnalyticsOptions = {
  userId: GSCId;
  connectionId: GSCId;
  startDate: string;
  endDate: string;
  dimensions?: GSCSearchDimension[];
  rowLimit?: number;
  startRow?: number;
  searchType?: "web" | "image" | "video" | "news";
  filters?: GSCDimensionFilter[];
};

export type GSCSearchAnalyticsRow = {
  date?: string;
  query?: string;
  page?: string;
  device?: string;
  country?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export class GSCServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GSCServiceError";
  }
}

function assertValidDate(value: string, name: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new GSCServiceError(`${name} must use YYYY-MM-DD format.`);
  }

  const date = new Date(`${value}T00:00:00Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new GSCServiceError(`${name} is not a valid calendar date.`);
  }
}

function validateQueryOptions(options: GSCSearchAnalyticsOptions) {
  if (
    options.dimensions !== undefined &&
    options.dimensions.some(
      (dimension) =>
        !SEARCH_ANALYTICS_DIMENSIONS.includes(
          dimension as (typeof SEARCH_ANALYTICS_DIMENSIONS)[number],
        ),
    )
  ) {
    throw new GSCServiceError(
      "dimensions must contain only date, query, page, device, or country.",
    );
  }

  assertValidDate(options.startDate, "startDate");
  assertValidDate(options.endDate, "endDate");
  if (options.startDate > options.endDate) {
    throw new GSCServiceError("startDate must not be after endDate.");
  }

  if (
    options.rowLimit !== undefined &&
    (!Number.isInteger(options.rowLimit) ||
      options.rowLimit < 1 ||
      options.rowLimit > 25000)
  ) {
    throw new GSCServiceError("rowLimit must be an integer from 1 to 25000.");
  }
  if (
    options.startRow !== undefined &&
    (!Number.isInteger(options.startRow) || options.startRow < 0)
  ) {
    throw new GSCServiceError("startRow must be a non-negative integer.");
  }
}

function normalizeRows(
  rows: Array<{
    keys?: string[] | null;
    clicks?: number | null;
    impressions?: number | null;
    ctr?: number | null;
    position?: number | null;
  }>,
  dimensions: GSCSearchDimension[],
): GSCSearchAnalyticsRow[] {
  return rows.map((row) => {
    const normalized: GSCSearchAnalyticsRow = {
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    };

    dimensions.forEach((dimension, index) => {
      const value = row.keys?.[index];
      if (value !== undefined) normalized[dimension] = value;
    });

    return normalized;
  });
}

export async function queryGSCSearchAnalytics(
  options: GSCSearchAnalyticsOptions,
): Promise<GSCSearchAnalyticsRow[]> {
  validateQueryOptions(options);
  const dimensions = options.dimensions ?? ["date"];
  let connection: GscConnection | undefined;

  try {
    const payload = await getPayload({ config });
    const connectionResult = await payload.find({
      collection: "gsc-connections",
      where: {
        and: [
          { id: { equals: options.connectionId } },
          { user: { equals: options.userId } },
        ],
      },
      limit: 1,
      overrideAccess: true,
    });
    connection = connectionResult.docs[0];
  } catch {
    throw new GSCServiceError("GSC connection could not be loaded.");
  }

  if (!connection) {
    throw new GSCServiceError("GSC connection was not found for this user.");
  }

  try {
    const oauthClient = getGoogleOAuthClient();
    oauthClient.setCredentials({ refresh_token: connection.refreshToken });
    const searchConsole = google.searchconsole({
      version: "v1",
      auth: oauthClient,
    });

    const dimensionFilterGroups = options.filters?.length
      ? [
          {
            filters: options.filters.map((f) => ({
              dimension: f.dimension,
              operator: f.operator || "equals",
              expression: f.expression,
            })),
          },
        ]
      : undefined;

    console.log("Querying GSC API with options:", {
      siteUrl: connection.propertyUrl,
      startDate: options.startDate,
      endDate: options.endDate,
      dimensions,
      searchType: options.searchType ?? DEFAULT_SEARCH_TYPE,
      dimensionFilterGroups,
    });

    const response = await searchConsole.searchanalytics.query({
      siteUrl: connection.propertyUrl,
      requestBody: {
        startDate: options.startDate,
        endDate: options.endDate,
        dimensions: dimensions.length > 0 ? dimensions : undefined,
        rowLimit: options.rowLimit ?? DEFAULT_ROW_LIMIT,
        startRow: options.startRow ?? 0,
        searchType: options.searchType ?? DEFAULT_SEARCH_TYPE,
        dimensionFilterGroups,
      },
    });

    console.log("GSC API Response Data:", {
      rowCount: response.data.rows?.length ?? 0,
      aggregationType: response.data.responseAggregationType,
    });

    return normalizeRows(response.data.rows ?? [], dimensions);
  } catch (err: unknown) {
    console.error("GSC Query Error:", err);
    const message = err instanceof Error ? err.message : "";
    if (
      message.includes("invalid_grant") ||
      message.includes("Token has been expired or revoked") ||
      message.includes("401") ||
      message.includes("403")
    ) {
      throw new GSCServiceError(
        "Google Search Console authorization was revoked or expired. Please reconnect.",
      );
    }
    throw new GSCServiceError("Google Search Console query failed.");
  }
}

export function fillAndSortDailyPerformance(
  rows: GSCSearchAnalyticsRow[],
  startDate: string,
  endDate: string,
): GSCSearchAnalyticsRow[] {
  const rowMap = new Map<string, GSCSearchAnalyticsRow>();
  for (const row of rows) {
    if (row.date) {
      rowMap.set(row.date, row);
    }
  }

  const result: GSCSearchAnalyticsRow[] = [];
  const curr = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  while (curr <= end) {
    const dateStr = curr.toISOString().slice(0, 10);
    const existing = rowMap.get(dateStr);
    if (existing) {
      result.push(existing);
    } else {
      result.push({
        date: dateStr,
        clicks: 0,
        impressions: 0,
        ctr: 0,
        position: 0,
      });
    }
    curr.setUTCDate(curr.getUTCDate() + 1);
  }

  result.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  return result;
}

export async function getGSCDailyPerformance(
  options: Omit<GSCSearchAnalyticsOptions, "dimensions">,
): Promise<GSCSearchAnalyticsRow[]> {
  const rows = await queryGSCSearchAnalytics({
    ...options,
    dimensions: ["date"],
    rowLimit: 1000,
  });
  return fillAndSortDailyPerformance(rows, options.startDate, options.endDate);
}

export async function getGSCOverviewSummary(
  options: Omit<GSCSearchAnalyticsOptions, "dimensions">,
): Promise<{ clicks: number; impressions: number; ctr: number; position: number }> {
  const rows = await queryGSCSearchAnalytics({ ...options, dimensions: [] });
  if (rows.length > 0) {
    return {
      clicks: rows[0].clicks,
      impressions: rows[0].impressions,
      ctr: rows[0].ctr,
      position: rows[0].position,
    };
  }
  return { clicks: 0, impressions: 0, ctr: 0, position: 0 };
}

export function getGSCTopQueries(
  options: Omit<GSCSearchAnalyticsOptions, "dimensions">,
) {
  return queryGSCSearchAnalytics({ ...options, dimensions: ["query"] });
}

export function getGSCTopPages(
  options: Omit<GSCSearchAnalyticsOptions, "dimensions">,
) {
  return queryGSCSearchAnalytics({ ...options, dimensions: ["page"] });
}

export function getGSCTopDevices(
  options: Omit<GSCSearchAnalyticsOptions, "dimensions">,
) {
  return queryGSCSearchAnalytics({ ...options, dimensions: ["device"] });
}

export function getGSCTopCountries(
  options: Omit<GSCSearchAnalyticsOptions, "dimensions">,
) {
  return queryGSCSearchAnalytics({ ...options, dimensions: ["country"] });
}

export async function getGSCStrikingDistance(
  options: Omit<GSCSearchAnalyticsOptions, "dimensions">,
): Promise<GSCSearchAnalyticsRow[]> {
  const rows = await queryGSCSearchAnalytics({
    ...options,
    dimensions: ["query", "page"],
    rowLimit: 1000,
  });

  const striking = rows.filter((r) => r.position >= 5.0 && r.position <= 20.0);
  striking.sort((a, b) => b.impressions - a.impressions);
  return striking;
}
