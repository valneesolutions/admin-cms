import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getPayload } from "payload";

import config from "@/payload.config";
import {
  getGSCDailyPerformance,
  getGSCTopPages,
  getGSCTopQueries,
  GSCServiceError,
} from "@/lib/google/gsc-search";

function isValidDateFormat(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(`${dateStr}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === dateStr;
}

function getDefaultDateRange(): { startDate: string; endDate: string } {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 2); // 2 days ago for GSC data freshness
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 27); // 28 days inclusive

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config });
    const authResult = await payload.auth({ headers: await headers() });

    if (!authResult.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const userId = authResult.user.id;

    // Find connection owned by this authenticated user
    const connectionResult = await payload.find({
      collection: "gsc-connections",
      where: {
        user: { equals: userId },
      },
      limit: 1,
      overrideAccess: true,
    });

    const connection = connectionResult.docs[0];

    if (!connection) {
      return NextResponse.json({
        connected: false,
      });
    }

    // Parse date parameters
    const url = new URL(request.url);
    let startDate = url.searchParams.get("startDate");
    let endDate = url.searchParams.get("endDate");

    if (!startDate || !endDate) {
      const defaultDates = getDefaultDateRange();
      startDate = startDate || defaultDates.startDate;
      endDate = endDate || defaultDates.endDate;
    }

    if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
      return NextResponse.json(
        { error: "Invalid date format. Expected YYYY-MM-DD." },
        { status: 400 },
      );
    }

    if (startDate > endDate) {
      return NextResponse.json(
        { error: "startDate must not be after endDate." },
        { status: 400 },
      );
    }

    const queryOpts = {
      userId,
      connectionId: connection.id,
      startDate,
      endDate,
    };

    const [dailyRows, topQueriesRows, topPagesRows] = await Promise.all([
      getGSCDailyPerformance(queryOpts),
      getGSCTopQueries({ ...queryOpts, rowLimit: 20 }),
      getGSCTopPages({ ...queryOpts, rowLimit: 20 }),
    ]);

    console.log("GSC Insights Query Result:", {
      property: connection.propertyUrl,
      startDate,
      endDate,
      dailyRowsCount: dailyRows.length,
      topQueriesCount: topQueriesRows.length,
      topPagesCount: topPagesRows.length,
    });

    // Calculate aggregate metrics
    let totalClicks = 0;
    let totalImpressions = 0;
    let weightedPositionSum = 0;

    for (const row of dailyRows) {
      totalClicks += row.clicks;
      totalImpressions += row.impressions;
      weightedPositionSum += row.position * row.impressions;
    }

    const ctr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
    const position =
      totalImpressions > 0 ? weightedPositionSum / totalImpressions : 0;

    return NextResponse.json({
      connected: true,
      property: connection.propertyUrl,
      googleAccountEmail: connection.googleAccountEmail,
      dateRange: {
        startDate,
        endDate,
      },
      summary: {
        clicks: totalClicks,
        impressions: totalImpressions,
        ctr, // decimal e.g. 0.0526
        position, // float e.g. 8.42
      },
      performance: dailyRows,
      topQueries: topQueriesRows,
      topPages: topPagesRows,
    });
  } catch (err: unknown) {
    if (err instanceof GSCServiceError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to fetch Search Console insights." },
      { status: 500 },
    );
  }
}
