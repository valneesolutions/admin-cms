"use client";

import React, { useEffect, useState, useTransition } from "react";

type DatePreset = "7d" | "28d" | "90d";
type MetricType = "clicks" | "impressions" | "ctr" | "position";

interface GSCRow {
  date?: string;
  query?: string;
  page?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface InsightsResponse {
  connected: boolean;
  property?: string;
  googleAccountEmail?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  summary?: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  performance?: GSCRow[];
  topQueries?: GSCRow[];
  topPages?: GSCRow[];
  error?: string;
}

function calculateDatesForPreset(preset: DatePreset): {
  startDate: string;
  endDate: string;
} {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 2); // 2 days ago for Search Console data freshness
  const start = new Date(end);

  if (preset === "7d") {
    start.setUTCDate(start.getUTCDate() - 6);
  } else if (preset === "28d") {
    start.setUTCDate(start.getUTCDate() - 27);
  } else if (preset === "90d") {
    start.setUTCDate(start.getUTCDate() - 89);
  }

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

function formatCTR(ctrDecimal: number): string {
  return `${(ctrDecimal * 100).toFixed(2)}%`;
}

function formatPosition(pos: number): string {
  return pos.toFixed(2);
}

function formatMetricValue(value: number, metric: MetricType): string {
  if (metric === "ctr") return formatCTR(value);
  if (metric === "position") return formatPosition(value);
  return formatNumber(value);
}

const METRIC_CONFIG: Record<
  MetricType,
  { label: string; color: string; fill: string }
> = {
  clicks: {
    label: "Clicks",
    color: "#6a00ff",
    fill: "rgba(106, 0, 255, 0.15)",
  },
  impressions: {
    label: "Impressions",
    color: "#00b4d8",
    fill: "rgba(0, 180, 216, 0.15)",
  },
  ctr: {
    label: "CTR",
    color: "#10b981",
    fill: "rgba(16, 185, 129, 0.15)",
  },
  position: {
    label: "Avg Position",
    color: "#f59e0b",
    fill: "rgba(245, 158, 11, 0.15)",
  },
};

export function GSCInsightsView() {
  const [preset, setPreset] = useState<DatePreset>("28d");
  const [activeMetric, setActiveMetric] = useState<MetricType>("clicks");
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    value: number;
    x: number;
    y: number;
  } | null>(null);
  const [, startTransition] = useTransition();

  const fetchInsights = (selectedPreset: DatePreset) => {
    setLoading(true);
    setError(null);

    const { startDate, endDate } = calculateDatesForPreset(selectedPreset);
    const url = `/api/gsc/insights?startDate=${startDate}&endDate=${endDate}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Authentication required. Please log in.");
          }
          return res.json().then((json) => {
            throw new Error(json.error || "Failed to load GSC insights.");
          });
        }
        return res.json();
      })
      .then((json: InsightsResponse) => {
        startTransition(() => {
          setData(json);
          setLoading(false);
        });
      })
      .catch((err: Error) => {
        startTransition(() => {
          setError(err.message);
          setLoading(false);
        });
      });
  };

  useEffect(() => {
    fetchInsights(preset);
  }, [preset]);

  const handlePresetChange = (newPreset: DatePreset) => {
    if (newPreset !== preset) {
      setPreset(newPreset);
    }
  };

  // Render Loader
  if (loading && !data) {
    return (
      <div className="gsc-dashboard-container">
        <div className="admin-loader-container">
          <div className="admin-loader-spinner-wrapper">
            <div className="admin-loader-spinner" />
          </div>
          <div className="admin-loader-text">Loading GSC Insights...</div>
        </div>
      </div>
    );
  }

  // Render Connection Error
  if (error && !data) {
    return (
      <div className="gsc-dashboard-container">
        <div className="gsc-header">
          <h1>GSC Insights</h1>
        </div>
        <div className="gsc-error-card">
          <div className="gsc-error-icon">⚠️</div>
          <h3>Unable to Load Search Console Data</h3>
          <p>{error}</p>
          <button
            type="button"
            className="btn--style-primary gsc-btn"
            onClick={() => fetchInsights(preset)}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render No Connection State (Part 4)
  if (data && !data.connected) {
    return (
      <div className="gsc-dashboard-container">
        <div className="gsc-header">
          <h1>GSC Insights</h1>
        </div>

        <div className="gsc-unconnected-card">
          <div className="gsc-unconnected-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </div>

          <h2>Connect Google Search Console</h2>
          <p className="gsc-unconnected-desc">
            Connect your Google Search Console account to view detailed SEO search analytics right inside Payload CMS, including:
          </p>

          <ul className="gsc-features-list">
            <li>
              <span>✓</span> Total Clicks & Impressions
            </li>
            <li>
              <span>✓</span> Click-Through Rate (CTR) & Average Position
            </li>
            <li>
              <span>✓</span> Daily Search Performance Trends
            </li>
            <li>
              <span>✓</span> Top Search Queries & Highest Performing Pages
            </li>
          </ul>

          <a
            href="/api/gsc/google/connect"
            className="btn--style-primary gsc-connect-btn"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ marginRight: "8px" }}
            >
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2.231,12.545,2.231 c-5.39,0-9.762,4.372-9.762,9.761s4.372,9.762,9.762,9.762c5.635,0,9.364-3.964,9.364-9.529c0-0.641-0.069-1.26-0.198-1.854 H12.545z" />
            </svg>
            Connect Google Search Console
          </a>
        </div>
      </div>
    );
  }

  // Connected Dashboard State (Part 5 - 9)
  const summary = data?.summary || {
    clicks: 0,
    impressions: 0,
    ctr: 0,
    position: 0,
  };
  const performance = data?.performance || [];
  const topQueries = data?.topQueries || [];
  const topPages = data?.topPages || [];

  // Chart Rendering Math
  const chartWidth = 800;
  const chartHeight = 220;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const metricValues = performance.map((p) => p[activeMetric] ?? 0);
  const minVal = Math.min(...(metricValues.length ? metricValues : [0]));
  const maxVal = Math.max(...(metricValues.length ? metricValues : [1]));

  const valRange = maxVal === minVal ? (maxVal === 0 ? 1 : maxVal) : maxVal - minVal;

  const getX = (index: number) => {
    if (performance.length <= 1) return paddingLeft + innerWidth / 2;
    return paddingLeft + (index / (performance.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    const ratio = (val - minVal) / valRange;
    return paddingTop + innerHeight - ratio * innerHeight;
  };

  const pointsString = performance
    .map((p, i) => `${getX(i)},${getY(p[activeMetric] ?? 0)}`)
    .join(" ");

  const areaString = performance.length
    ? `${getX(0)},${paddingTop + innerHeight} ${pointsString} ${getX(performance.length - 1)},${paddingTop + innerHeight}`
    : "";

  return (
    <div className="gsc-dashboard-container">
      {/* Header & Property Info */}
      <div className="gsc-header">
        <div>
          <h1>GSC Insights</h1>
          {data?.property && (
            <p className="gsc-property-tag">
              <span className="gsc-property-label">Property:</span>{" "}
              <code>{data.property}</code>
              {data.googleAccountEmail && (
                <span className="gsc-account-tag">
                  ({data.googleAccountEmail})
                </span>
              )}
            </p>
          )}
        </div>

        {/* Date Range Selector (Part 7) */}
        <div className="gsc-date-selector">
          <button
            type="button"
            className={`gsc-date-btn ${preset === "7d" ? "active" : ""}`}
            onClick={() => handlePresetChange("7d")}
            disabled={loading}
          >
            Last 7 days
          </button>
          <button
            type="button"
            className={`gsc-date-btn ${preset === "28d" ? "active" : ""}`}
            onClick={() => handlePresetChange("28d")}
            disabled={loading}
          >
            Last 28 days
          </button>
          <button
            type="button"
            className={`gsc-date-btn ${preset === "90d" ? "active" : ""}`}
            onClick={() => handlePresetChange("90d")}
            disabled={loading}
          >
            Last 3 months
          </button>
        </div>
      </div>

      {loading && (
        <div className="gsc-refreshing-bar">
          <span>Refreshing data...</span>
        </div>
      )}

      {/* Summary Cards (Part 5) */}
      <div className="gsc-cards-grid">
        <div
          className={`gsc-card ${activeMetric === "clicks" ? "active" : ""}`}
          onClick={() => setActiveMetric("clicks")}
        >
          <span className="gsc-card-label">Clicks</span>
          <span className="gsc-card-val" style={{ color: METRIC_CONFIG.clicks.color }}>
            {formatNumber(summary.clicks)}
          </span>
          <span className="gsc-card-sub">Total search clicks</span>
        </div>

        <div
          className={`gsc-card ${activeMetric === "impressions" ? "active" : ""}`}
          onClick={() => setActiveMetric("impressions")}
        >
          <span className="gsc-card-label">Impressions</span>
          <span
            className="gsc-card-val"
            style={{ color: METRIC_CONFIG.impressions.color }}
          >
            {formatNumber(summary.impressions)}
          </span>
          <span className="gsc-card-sub">Total search impressions</span>
        </div>

        <div
          className={`gsc-card ${activeMetric === "ctr" ? "active" : ""}`}
          onClick={() => setActiveMetric("ctr")}
        >
          <span className="gsc-card-label">CTR</span>
          <span className="gsc-card-val" style={{ color: METRIC_CONFIG.ctr.color }}>
            {formatCTR(summary.ctr)}
          </span>
          <span className="gsc-card-sub">Average click-through rate</span>
        </div>

        <div
          className={`gsc-card ${activeMetric === "position" ? "active" : ""}`}
          onClick={() => setActiveMetric("position")}
        >
          <span className="gsc-card-label">Average Position</span>
          <span
            className="gsc-card-val"
            style={{ color: METRIC_CONFIG.position.color }}
          >
            {formatPosition(summary.position)}
          </span>
          <span className="gsc-card-sub">Average search rank</span>
        </div>
      </div>

      {/* Performance Chart (Part 6) */}
      <div className="gsc-section-card">
        <div className="gsc-section-header">
          <h2>Performance Over Time</h2>
          <div className="gsc-metric-toggles">
            {(["clicks", "impressions", "ctr", "position"] as MetricType[]).map(
              (m) => (
                <button
                  key={m}
                  type="button"
                  className={`gsc-toggle-btn ${activeMetric === m ? "active" : ""}`}
                  style={{
                    borderColor:
                      activeMetric === m
                        ? METRIC_CONFIG[m].color
                        : "transparent",
                    color:
                      activeMetric === m ? METRIC_CONFIG[m].color : "inherit",
                  }}
                  onClick={() => setActiveMetric(m)}
                >
                  {METRIC_CONFIG[m].label}
                </button>
              ),
            )}
          </div>
        </div>

        {performance.length === 0 ? (
          <div className="gsc-empty-state">
            No daily performance data available for the selected date range.
          </div>
        ) : (
          <div className="gsc-chart-container">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="gsc-chart-svg"
            >
              {/* Horizontal Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = paddingTop + innerHeight * ratio;
                const val = maxVal - ratio * valRange;
                return (
                  <g key={ratio}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={chartWidth - paddingRight}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingLeft - 10}
                      y={y + 4}
                      fill="rgba(255, 255, 255, 0.4)"
                      fontSize="11"
                      textAnchor="end"
                    >
                      {formatMetricValue(val, activeMetric)}
                    </text>
                  </g>
                );
              })}

              {/* Filled Area */}
              {areaString && (
                <polygon
                  points={areaString}
                  fill={METRIC_CONFIG[activeMetric].fill}
                />
              )}

              {/* Trend Line */}
              {pointsString && (
                <polyline
                  fill="none"
                  stroke={METRIC_CONFIG[activeMetric].color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pointsString}
                />
              )}

              {/* Data Points */}
              {performance.map((p, i) => {
                const val = p[activeMetric] ?? 0;
                const x = getX(i);
                const y = getY(val);
                const isHovered = hoveredPoint?.date === p.date;

                return (
                  <circle
                    key={p.date || i}
                    cx={x}
                    cy={y}
                    r={isHovered ? 6 : 3.5}
                    fill={METRIC_CONFIG[activeMetric].color}
                    stroke="#111222"
                    strokeWidth="2"
                    style={{ cursor: "pointer", transition: "all 0.15s ease" }}
                    onMouseEnter={() =>
                      setHoveredPoint({
                        date: p.date || "",
                        value: val,
                        x,
                        y,
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}

              {/* X-axis Date Labels */}
              {performance.map((p, i) => {
                const step = Math.ceil(performance.length / 7);
                if (i % step !== 0 && i !== performance.length - 1) return null;
                const x = getX(i);
                const dateLabel = p.date ? p.date.slice(5) : "";
                return (
                  <text
                    key={`label-${p.date || i}`}
                    x={x}
                    y={chartHeight - 12}
                    fill="rgba(255, 255, 255, 0.4)"
                    fontSize="11"
                    textAnchor="middle"
                  >
                    {dateLabel}
                  </text>
                );
              })}
            </svg>

            {/* Hover Tooltip */}
            {hoveredPoint && (
              <div
                className="gsc-tooltip"
                style={{
                  left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                  top: `${(hoveredPoint.y / chartHeight) * 100}%`,
                }}
              >
                <div className="gsc-tooltip-date">{hoveredPoint.date}</div>
                <div className="gsc-tooltip-val">
                  {METRIC_CONFIG[activeMetric].label}:{" "}
                  <strong>
                    {formatMetricValue(hoveredPoint.value, activeMetric)}
                  </strong>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Top Queries & Top Pages Grid */}
      <div className="gsc-tables-grid">
        {/* Top Queries Table (Part 8) */}
        <div className="gsc-section-card">
          <div className="gsc-section-header">
            <h2>Top Queries</h2>
            <span className="gsc-table-count">{topQueries.length} items</span>
          </div>

          {topQueries.length === 0 ? (
            <div className="gsc-empty-state">No query data available.</div>
          ) : (
            <div className="gsc-table-wrap">
              <table className="gsc-table">
                aria-label="Top Queries Table"
                <thead>
                  <tr>
                    <th>Query</th>
                    <th className="num">Clicks</th>
                    <th className="num">Impressions</th>
                    <th className="num">CTR</th>
                    <th className="num">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {topQueries.map((q, idx) => (
                    <tr key={q.query || idx}>
                      <td className="query-cell" title={q.query}>
                        {q.query}
                      </td>
                      <td className="num">{formatNumber(q.clicks)}</td>
                      <td className="num">{formatNumber(q.impressions)}</td>
                      <td className="num">{formatCTR(q.ctr)}</td>
                      <td className="num">{formatPosition(q.position)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Pages Table (Part 9) */}
        <div className="gsc-section-card">
          <div className="gsc-section-header">
            <h2>Top Pages</h2>
            <span className="gsc-table-count">{topPages.length} items</span>
          </div>

          {topPages.length === 0 ? (
            <div className="gsc-empty-state">No page data available.</div>
          ) : (
            <div className="gsc-table-wrap">
              <table className="gsc-table">
                aria-label="Top Pages Table"
                <thead>
                  <tr>
                    <th>Page</th>
                    <th className="num">Clicks</th>
                    <th className="num">Impressions</th>
                    <th className="num">CTR</th>
                    <th className="num">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {topPages.map((p, idx) => {
                    const cleanPath = p.page
                      ? p.page.replace(/^https?:\/\/[^/]+/, "") || "/"
                      : "";
                    return (
                      <tr key={p.page || idx}>
                        <td className="page-cell" title={p.page}>
                          <span className="page-path">{cleanPath}</span>
                        </td>
                        <td className="num">{formatNumber(p.clicks)}</td>
                        <td className="num">{formatNumber(p.impressions)}</td>
                        <td className="num">{formatCTR(p.ctr)}</td>
                        <td className="num">{formatPosition(p.position)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
