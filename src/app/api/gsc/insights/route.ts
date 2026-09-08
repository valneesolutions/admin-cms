import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getPayload } from "payload";

import config from "@/payload.config";
import {
  getGSCDailyPerformance,
  getGSCOverviewSummary,
  getGSCStrikingDistance,
  getGSCTopCountries,
  getGSCTopDevices,
  getGSCTopPages,
  getGSCTopQueries,
  GSCDimensionFilter,
  GSCServiceError,
} from "@/lib/google/gsc-search";

const COUNTRY_NAMES: Record<string, { name: string; flag: string }> = {
  usa: { name: "United States", flag: "🇺🇸" },
  ind: { name: "India", flag: "🇮🇳" },
  gbr: { name: "United Kingdom", flag: "🇬🇧" },
  can: { name: "Canada", flag: "🇨🇦" },
  deu: { name: "Germany", flag: "🇩🇪" },
  fra: { name: "France", flag: "🇫🇷" },
  aus: { name: "Australia", flag: "🇦🇺" },
  sgp: { name: "Singapore", flag: "🇸🇬" },
  jpn: { name: "Japan", flag: "🇯🇵" },
  bra: { name: "Brazil", flag: "🇧🇷" },
  esp: { name: "Spain", flag: "🇪🇸" },
  ita: { name: "Italy", flag: "🇮🇹" },
  nld: { name: "Netherlands", flag: "🇳🇱" },
  swe: { name: "Sweden", flag: "🇸🇪" },
  che: { name: "Switzerland", flag: "🇨🇭" },
  are: { name: "United Arab Emirates", flag: "🇦🇪" },
  aae: { name: "United Arab Emirates", flag: "🇦🇪" },
  zaf: { name: "South Africa", flag: "🇿🇦" },
  nzl: { name: "New Zealand", flag: "🇳🇿" },
  mex: { name: "Mexico", flag: "🇲🇽" },
  phl: { name: "Philippines", flag: "🇵🇭" },
  idn: { name: "Indonesia", flag: "🇮🇩" },
  mys: { name: "Malaysia", flag: "🇲🇾" },
  vnm: { name: "Vietnam", flag: "🇻🇳" },
  pak: { name: "Pakistan", flag: "🇵🇰" },
  bgd: { name: "Bangladesh", flag: "🇧🇩" },
  lka: { name: "Sri Lanka", flag: "🇱🇰" },
  irl: { name: "Ireland", flag: "🇮🇪" },
  pol: { name: "Poland", flag: "🇵🇱" },
  ukr: { name: "Ukraine", flag: "🇺🇦" },
  nor: { name: "Norway", flag: "🇳🇴" },
  fin: { name: "Finland", flag: "🇫🇮" },
  dnk: { name: "Denmark", flag: "🇩🇰" },
  aut: { name: "Austria", flag: "🇦🇹" },
  bel: { name: "Belgium", flag: "🇧🇪" },
};

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

function getPreviousDateRange(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const durationMs = end.getTime() - start.getTime() + 86400000;

  const prevEnd = new Date(start.getTime() - 86400000);
  const prevStart = new Date(prevEnd.getTime() - durationMs + 86400000);

  return {
    startDate: prevStart.toISOString().slice(0, 10),
    endDate: prevEnd.toISOString().slice(0, 10),
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

    // Parse parameters
    const url = new URL(request.url);
    let startDate = url.searchParams.get("startDate");
    let endDate = url.searchParams.get("endDate");
    const rowLimitParam = url.searchParams.get("rowLimit");
    const searchTypeParam = url.searchParams.get("searchType");
    const deviceFilterParam = url.searchParams.get("deviceFilter");
    const countryFilterParam = url.searchParams.get("countryFilter");
    const pageFilterParam = url.searchParams.get("pageFilter");
    const queryFilterParam = url.searchParams.get("queryFilter");

    const rowLimit = rowLimitParam
      ? Math.max(10, Math.min(25000, parseInt(rowLimitParam, 10) || 100))
      : 100;

    const validSearchTypes = ["web", "image", "video", "news"] as const;
    const searchType = validSearchTypes.includes(searchTypeParam as (typeof validSearchTypes)[number])
      ? (searchTypeParam as (typeof validSearchTypes)[number])
      : "web";

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

    const filters: GSCDimensionFilter[] = [];
    if (deviceFilterParam && deviceFilterParam.trim() && deviceFilterParam !== "all") {
      filters.push({
        dimension: "device",
        operator: "equals",
        expression: deviceFilterParam.trim().toLowerCase(),
      });
    }
    if (countryFilterParam && countryFilterParam.trim() && countryFilterParam !== "all") {
      filters.push({
        dimension: "country",
        operator: "equals",
        expression: countryFilterParam.trim().toLowerCase(),
      });
    }
    if (pageFilterParam && pageFilterParam.trim()) {
      filters.push({
        dimension: "page",
        operator: "equals",
        expression: pageFilterParam.trim(),
      });
    }
    if (queryFilterParam && queryFilterParam.trim()) {
      filters.push({
        dimension: "query",
        operator: "contains",
        expression: queryFilterParam.trim(),
      });
    }

    const queryOpts = {
      userId,
      connectionId: connection.id,
      startDate,
      endDate,
      searchType,
      filters: filters.length > 0 ? filters : undefined,
    };

    // Calculate previous period equal date range for comparison %
    const prevDateRange = getPreviousDateRange(startDate, endDate);
    const prevQueryOpts = {
      ...queryOpts,
      startDate: prevDateRange.startDate,
      endDate: prevDateRange.endDate,
    };

    const [
      overviewSummary,
      prevOverviewSummary,
      dailyRows,
      topQueriesRows,
      topPagesRows,
      strikingDistanceRows,
      topDevicesRows,
      topCountriesRows,
    ] = await Promise.all([
      getGSCOverviewSummary(queryOpts),
      getGSCOverviewSummary(prevQueryOpts).catch(() => ({ clicks: 0, impressions: 0, ctr: 0, position: 0 })),
      getGSCDailyPerformance(queryOpts),
      getGSCTopQueries({ ...queryOpts, rowLimit }),
      getGSCTopPages({ ...queryOpts, rowLimit }),
      getGSCStrikingDistance({ ...queryOpts, rowLimit: 500 }),
      getGSCTopDevices(queryOpts),
      getGSCTopCountries({ ...queryOpts, rowLimit: 100 }),
    ]);

    // Fallback if overview summary was empty but daily rows exist
    let summary = overviewSummary;
    if (
      summary.clicks === 0 &&
      summary.impressions === 0 &&
      dailyRows.length > 0
    ) {
      let totalClicks = 0;
      let totalImpressions = 0;
      let weightedPositionSum = 0;

      for (const row of dailyRows) {
        totalClicks += row.clicks;
        totalImpressions += row.impressions;
        weightedPositionSum += row.position * row.impressions;
      }

      summary = {
        clicks: totalClicks,
        impressions: totalImpressions,
        ctr: totalImpressions > 0 ? totalClicks / totalImpressions : 0,
        position:
          totalImpressions > 0 ? weightedPositionSum / totalImpressions : 0,
      };
    }

    // Compute period-over-period percentage changes
    const prevClicks = prevOverviewSummary.clicks || 0;
    const prevImpressions = prevOverviewSummary.impressions || 0;
    const prevCtr = prevOverviewSummary.ctr || 0;
    const prevPosition = prevOverviewSummary.position || 0;

    const clicksChange = prevClicks > 0
      ? ((summary.clicks - prevClicks) / prevClicks) * 100
      : (summary.clicks > 0 ? 100 : 0);

    const impressionsChange = prevImpressions > 0
      ? ((summary.impressions - prevImpressions) / prevImpressions) * 100
      : (summary.impressions > 0 ? 100 : 0);

    const ctrChange = prevCtr > 0
      ? ((summary.ctr - prevCtr) / prevCtr) * 100
      : (summary.ctr > 0 ? 100 : 0);

    const positionChange = prevPosition > 0
      ? Number((summary.position - prevPosition).toFixed(1))
      : 0;

    // Format Countries with friendly names & flags
    const formattedCountries = topCountriesRows.map((c) => {
      const code = (c.country || "unknown").toLowerCase();
      const meta = COUNTRY_NAMES[code] || {
        name: code.toUpperCase(),
        flag: "🌐",
      };
      return {
        ...c,
        countryCode: code,
        countryName: meta.name,
        flag: meta.flag,
      };
    });

    // Format Devices with friendly labels
    const formattedDevices = topDevicesRows.map((d) => {
      const deviceRaw = (d.device || "desktop").toLowerCase();
      let label = "Desktop";
      if (deviceRaw === "mobile") label = "Mobile";
      else if (deviceRaw === "tablet") label = "Tablet";
      return {
        ...d,
        deviceLabel: label,
      };
    });

    return NextResponse.json({
      connected: true,
      property: connection.propertyUrl,
      googleAccountEmail: connection.googleAccountEmail,
      dateRange: {
        startDate,
        endDate,
      },
      searchType,
      summary: {
        ...summary,
        clicksChange: Number(clicksChange.toFixed(1)),
        impressionsChange: Number(impressionsChange.toFixed(1)),
        ctrChange: Number(ctrChange.toFixed(1)),
        positionChange,
      },
      performance: dailyRows,
      strikingDistance: strikingDistanceRows,
      topQueries: topQueriesRows,
      topPages: topPagesRows,
      topDevices: formattedDevices,
      topCountries: formattedCountries,
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
