"use client";

import { toast } from "@payloadcms/ui";
import React, { useEffect, useMemo, useState, useTransition } from "react";

type DatePreset = "7d" | "28d" | "90d" | "180d" | "365d";
type TabType = "striking" | "queries" | "pages";
type SortField = "clicks" | "impressions" | "ctr" | "position" | "name";
type SortOrder = "asc" | "desc";

interface GSCRow {
  date?: string;
  query?: string;
  page?: string;
  device?: string;
  deviceLabel?: string;
  country?: string;
  countryCode?: string;
  countryName?: string;
  flag?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface TableMeta {
  totalRows: number;
  hasMore: boolean;
  rowLimit: number;
  startRow: number;
}

interface InsightsResponse {
  connected: boolean;
  property?: string;
  googleAccountEmail?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  totalsNote?: string;
  summary?: {
    clicks: number;
    clicksChange?: number;
    impressions: number;
    impressionsChange?: number;
    ctr: number;
    ctrChange?: number;
    position: number;
    positionChange?: number;
  };
  performance?: GSCRow[];
  strikingDistance?: GSCRow[];
  topQueries?: GSCRow[];
  topPages?: GSCRow[];
  topDevices?: GSCRow[];
  topCountries?: GSCRow[];
  metadata?: {
    strikingDistance?: TableMeta;
    topQueries?: TableMeta;
    topPages?: TableMeta;
  };
  error?: string;
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

function formatCTR(ctrDecimal: number): string {
  return `${(ctrDecimal * 100).toFixed(1)}%`;
}

function formatPosition(pos: number): string {
  return pos.toFixed(1);
}

export function GSCInsightsView() {
  const [preset, setPreset] = useState<DatePreset>("28d");
  const [deviceFilter, setDeviceFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<TabType>("striking");
  const [disconnecting, setDisconnecting] = useState<boolean>(false);

  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sorting & Pagination
  const [sortField, setSortField] = useState<SortField>("impressions");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [rowsPerPage, setRowsPerPage] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const [, startTransition] = useTransition();

  const fetchInsights = (
    selectedPreset: DatePreset,
    selectedDevice: string,
    selectedCountry: string,
  ) => {
    setLoading(true);
    setError(null);

    const end = new Date();
    end.setUTCDate(end.getUTCDate() - 2);
    const start = new Date(end);
    if (selectedPreset === "7d") start.setUTCDate(start.getUTCDate() - 6);
    else if (selectedPreset === "28d") start.setUTCDate(start.getUTCDate() - 27);
    else if (selectedPreset === "90d") start.setUTCDate(start.getUTCDate() - 89);
    else if (selectedPreset === "180d") start.setUTCDate(start.getUTCDate() - 179);
    else if (selectedPreset === "365d") start.setUTCDate(start.getUTCDate() - 364);

    const startDate = start.toISOString().slice(0, 10);
    const endDate = end.toISOString().slice(0, 10);

    // rowLimit caps the total rows the server fetches from Google's API
    // (server pages through requests of 25,000 rows each).
    let url = `/api/gsc/insights?startDate=${startDate}&endDate=${endDate}&rowLimit=50000`;
    if (selectedDevice !== "all") {
      url += `&deviceFilter=${encodeURIComponent(selectedDevice)}`;
    }
    if (selectedCountry !== "all") {
      url += `&countryFilter=${encodeURIComponent(selectedCountry)}`;
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Authentication required. Please log in.");
          }
          return res.json().then((json) => {
            throw new Error(json.error || "Failed to load Search Console insights.");
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
    fetchInsights(preset, deviceFilter, countryFilter);
  }, [preset, deviceFilter, countryFilter]);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    setError(null);
    try {
      const res = await fetch("/api/gsc/google/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || "Failed to disconnect Google Search Console.");
      }
      toast.success("Google Search Console disconnected.");
      // Clear local state so the connect screen renders immediately.
      setData(null);
      setLoading(true);
      fetchInsights(preset, deviceFilter, countryFilter);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to disconnect.");
      setDisconnecting(false);
    }
  };

  // Set default sort field based on tab
  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
    setCurrentPage(1);
    setSelectedRows(new Set());
    if (newTab === "striking") {
      setSortField("impressions");
      setSortOrder("desc");
    } else {
      setSortField("clicks");
      setSortOrder("desc");
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  // Active raw dataset
  const activeDataset: GSCRow[] = useMemo(() => {
    if (activeTab === "striking") return data?.strikingDistance || [];
    if (activeTab === "queries") return data?.topQueries || [];
    if (activeTab === "pages") return data?.topPages || [];
    return [];
  }, [data, activeTab]);

  // Sorted Dataset
  const sortedDataset = useMemo(() => {
    return [...activeDataset].sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      if (sortField === "name") {
        valA = (a.query || a.page || "").toLowerCase();
        valB = (b.query || b.page || "").toLowerCase();
      } else {
        valA = a[sortField] ?? 0;
        valB = b[sortField] ?? 0;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [activeDataset, sortField, sortOrder]);

  // Paginated Rows
  const totalItems = sortedDataset.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;
  const paginatedDataset = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return sortedDataset.slice(startIdx, startIdx + rowsPerPage);
  }, [sortedDataset, currentPage, rowsPerPage]);

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allKeys = paginatedDataset.map(
        (r, idx) => r.query || r.page || String(idx),
      );
      setSelectedRows(new Set(allKeys));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (key: string) => {
    const next = new Set(selectedRows);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedRows(next);
  };

  // Export handlers
  const handleExportCSV = () => {
    if (!sortedDataset.length) return;
    let csv = "";
    if (activeTab === "striking") {
      csv = "Query,Page,Impressions,Clicks,Position\n";
      csv += sortedDataset
        .map(
          (r) =>
            `"${(r.query || "").replace(/"/g, '""')}","${(r.page || "").replace(/"/g, '""')}",${r.impressions},${r.clicks},${r.position}`,
        )
        .join("\n");
    } else if (activeTab === "queries") {
      csv = "Query,Clicks,Impressions,CTR,Position\n";
      csv += sortedDataset
        .map(
          (r) =>
            `"${(r.query || "").replace(/"/g, '""')}",${r.clicks},${r.impressions},${(r.ctr * 100).toFixed(2)}%,${r.position}`,
        )
        .join("\n");
    } else {
      csv = "Page,Clicks,Impressions,CTR,Position\n";
      csv += sortedDataset
        .map(
          (r) =>
            `"${(r.page || "").replace(/"/g, '""')}",${r.clicks},${r.impressions},${(r.ctr * 100).toFixed(2)}%,${r.position}`,
        )
        .join("\n");
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `search-performance-${activeTab}-${preset}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render Change Pill
  const renderChangePill = (val?: number, isPosition = false) => {
    if (val === undefined || val === null) return null;

    if (isPosition) {
      if (val < 0) {
        return (
          <span className="gsc-pill gsc-pill-green">
            {val.toFixed(1)}
          </span>
        );
      }
      if (val > 0) {
        return (
          <span className="gsc-pill gsc-pill-red">
            +{val.toFixed(1)}
          </span>
        );
      }
      return <span className="gsc-pill gsc-pill-gray">0.0</span>;
    }

    if (val > 0) {
      return (
        <span className="gsc-pill gsc-pill-green">
          +{val.toFixed(1)}%
        </span>
      );
    }
    if (val < 0) {
      return (
        <span className="gsc-pill gsc-pill-red">
          {val.toFixed(1)}%
        </span>
      );
    }
    return <span className="gsc-pill gsc-pill-gray">0.0%</span>;
  };

  // Render Initial Loader
  if (loading && !data) {
    return (
      <div className="gsc-dashboard-container">
        <div className="admin-loader-container">
          <div className="admin-loader-spinner-wrapper">
            <div className="admin-loader-spinner" />
          </div>
          <div className="admin-loader-text">Loading Search Performance...</div>
        </div>
      </div>
    );
  }

  // Render Connection Error
  if (error && !data) {
    return (
      <div className="gsc-dashboard-container">
        <div className="gsc-header">
          <div>
            <h1 className="gsc-header-title">Search Performance</h1>
            <p className="gsc-header-subtitle">
              See your site&apos;s clicks, impressions, CTR, and position from Google Search Console.
            </p>
          </div>
        </div>
        <div className="gsc-error-card">
          <div className="gsc-error-icon">⚠️</div>
          <h3>Unable to Load Search Console Data</h3>
          <p>{error}</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            <button
              type="button"
              className="btn--style-primary gsc-connect-btn"
              onClick={() => fetchInsights(preset, deviceFilter, countryFilter)}
            >
              Retry Connection
            </button>
            <button
              type="button"
              className="btn--style-secondary gsc-connect-btn"
              onClick={handleDisconnect}
              disabled={disconnecting}
              title="Sign out of the connected Google account and remove the stored token"
            >
              {disconnecting ? "Disconnecting…" : "Disconnect"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Unconnected State
  if (data && !data.connected) {
    return (
      <div className="gsc-dashboard-container">
        <div className="gsc-header">
          <div>
            <h1 className="gsc-header-title">Search Performance</h1>
            <p className="gsc-header-subtitle">
              See your site&apos;s clicks, impressions, CTR, and position from Google Search Console.
            </p>
          </div>
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
            Connect your Google Search Console account to view live Search Performance metrics inside Valnee Admin CMS.
          </p>

          <a
            href="/api/gsc/google/connect"
            className="btn--style-primary gsc-connect-btn"
          >
            Connect Google Search Console
          </a>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    clicks: 0,
    clicksChange: 0,
    impressions: 0,
    impressionsChange: 0,
    ctr: 0,
    ctrChange: 0,
    position: 0,
    positionChange: 0,
  };

  const strikingCount = data?.strikingDistance?.length || 0;
  const countriesList = data?.topCountries || [];

  // The server already fetched every available row (up to its cap), so this
  // pagination slices the complete dataset rather than a truncated first batch.
  const activeTableMeta =
    activeTab === "striking"
      ? data?.metadata?.strikingDistance
      : activeTab === "queries"
        ? data?.metadata?.topQueries
        : data?.metadata?.topPages;
  const tableHasMore = activeTableMeta?.hasMore ?? false;

  const startItemIdx = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endItemIdx = Math.min(currentPage * rowsPerPage, totalItems);

  return (
    <div className="gsc-dashboard-container">
      {/* Header */}
      <div className="gsc-header">
        <div>
          <h1 className="gsc-header-title">Search Performance</h1>
          <p className="gsc-header-subtitle">
            See your site&apos;s clicks, impressions, CTR, and position from Google Search Console.
          </p>
        </div>

        <div className="gsc-header-actions" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <a
            href="/api/gsc/google/connect"
            className="gsc-change-property-link"
            title="Reconnect or change Search Console property"
          >
            Change property
          </a>
          <button
            type="button"
            className="gsc-change-property-link"
            style={{ color: "var(--theme-error-500, #c0392b)" }}
            onClick={handleDisconnect}
            disabled={disconnecting}
            title={`Sign out of ${data?.googleAccountEmail || "the connected Google account"} and remove the stored token`}
          >
            {disconnecting ? "Disconnecting…" : "Disconnect"}
          </button>
        </div>
      </div>

      {/* 4 Stat Cards Grid */}
      <div className="gsc-stats-grid">
        {/* Card 1: Clicks */}
        <div className="gsc-stat-card">
          <div className="gsc-stat-label">CLICKS</div>
          <div className="gsc-stat-value-container">
            <span className="gsc-stat-number">{formatNumber(summary.clicks)}</span>
            {renderChangePill(summary.clicksChange)}
          </div>
        </div>

        {/* Card 2: Impressions */}
        <div className="gsc-stat-card">
          <div className="gsc-stat-label">IMPRESSIONS</div>
          <div className="gsc-stat-value-container">
            <span className="gsc-stat-number">{formatNumber(summary.impressions)}</span>
            {renderChangePill(summary.impressionsChange)}
          </div>
        </div>

        {/* Card 3: CTR */}
        <div className="gsc-stat-card">
          <div className="gsc-stat-label">CTR</div>
          <div className="gsc-stat-value-container">
            <span className="gsc-stat-number">{formatCTR(summary.ctr)}</span>
            {renderChangePill(summary.ctrChange)}
          </div>
        </div>

        {/* Card 4: Avg Position */}
        <div className="gsc-stat-card">
          <div className="gsc-stat-label">AVG POSITION</div>
          <div className="gsc-stat-value-container">
            <span className="gsc-stat-number">{formatPosition(summary.position)}</span>
            {renderChangePill(summary.positionChange, true)}
          </div>
        </div>
      </div>

      {/* Main Tabbed Explorer Card */}
      <div className="gsc-main-card">
        {/* Tab Controls Row */}
        <div className="gsc-tab-controls-row">
          {/* Left: Tabs */}
          <div className="gsc-tab-group">
            <button
              type="button"
              className={`gsc-tab-button ${activeTab === "striking" ? "is-active" : ""}`}
              onClick={() => handleTabChange("striking")}
            >
              Striking distance ({strikingCount})
            </button>

            <button
              type="button"
              className={`gsc-tab-button ${activeTab === "queries" ? "is-active" : ""}`}
              onClick={() => handleTabChange("queries")}
            >
              Queries
            </button>

            <button
              type="button"
              className={`gsc-tab-button ${activeTab === "pages" ? "is-active" : ""}`}
              onClick={() => handleTabChange("pages")}
            >
              Pages
            </button>
          </div>

          {/* Right: Dropdown Filters */}
          <div className="gsc-filters-group">
            {/* Device Filter */}
            <select
              className="gsc-pill-select"
              value={deviceFilter}
              onChange={(e) => {
                setDeviceFilter(e.target.value);
                setCurrentPage(1);
              }}
              disabled={loading}
              aria-label="Filter by Device"
            >
              <option value="all">All devices</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
            </select>

            {/* Country Filter */}
            <select
              className="gsc-pill-select"
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                setCurrentPage(1);
              }}
              disabled={loading}
              aria-label="Filter by Country"
            >
              <option value="all">All countries</option>
              {countriesList.map((c) => (
                <option key={c.countryCode || c.country} value={c.countryCode || c.country}>
                  {c.countryName || c.country}
                </option>
              ))}
            </select>

            {/* Date Preset */}
            <select
              className="gsc-pill-select"
              value={preset}
              onChange={(e) => {
                setPreset(e.target.value as DatePreset);
                setCurrentPage(1);
              }}
              disabled={loading}
              aria-label="Filter by Date Range"
            >
              <option value="7d">Last 7 days</option>
              <option value="28d">Last 28 days</option>
              <option value="90d">Last 3 months</option>
              <option value="180d">Last 6 months</option>
              <option value="365d">Last 12 months</option>
            </select>

            {/* Export Action */}
            <button
              type="button"
              className="gsc-export-button"
              onClick={handleExportCSV}
              title="Export all loaded table results to CSV file"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: "2px" }}
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export</span>
              <span style={{ fontSize: "10px" }}>▼</span>
            </button>
          </div>
        </div>

        {/* Tab 1 Informational Banner */}
        {activeTab === "striking" && (
          <div className="gsc-tab-info-banner">
            Queries ranking at positions 5 to 20, sorted by impressions. Improve the listed page to move them into the top results.
          </div>
        )}

        {/* Data Table */}
        {sortedDataset.length === 0 ? (
          <div className="gsc-empty-state">No performance data available for the selected filters.</div>
        ) : (
          <div className="gsc-table-container">
            <table className="gsc-table" aria-label="Search Performance Table">
              <thead>
                <tr>
                  <th className="gsc-cell-checkbox">
                    <input
                      type="checkbox"
                      className="gsc-input-checkbox"
                      onChange={handleSelectAll}
                      checked={
                        paginatedDataset.length > 0 &&
                        paginatedDataset.every((r, idx) =>
                          selectedRows.has(r.query || r.page || String(idx)),
                        )
                      }
                    />
                  </th>

                  {activeTab === "striking" && (
                    <>
                      <th
                        className="is-sortable"
                        onClick={() => handleSort("name")}
                      >
                        Query {sortField === "name" && (sortOrder === "desc" ? "↓" : "↑")}
                      </th>
                      <th className="is-sortable">Page</th>
                      <th
                        className="is-num is-sortable"
                        onClick={() => handleSort("impressions")}
                      >
                        Impressions {sortField === "impressions" && (sortOrder === "desc" ? "↓" : "↑")}
                      </th>
                      <th
                        className="is-num is-sortable"
                        onClick={() => handleSort("clicks")}
                      >
                        Clicks {sortField === "clicks" && (sortOrder === "desc" ? "↓" : "↑")}
                      </th>
                      <th
                        className="is-num is-sortable"
                        onClick={() => handleSort("position")}
                      >
                        Position {sortField === "position" && (sortOrder === "desc" ? "↓" : "↑")}
                      </th>
                    </>
                  )}

                  {activeTab === "queries" && (
                    <>
                      <th
                        className="is-sortable"
                        onClick={() => handleSort("name")}
                      >
                        Query {sortField === "name" && (sortOrder === "desc" ? "↓" : "↑")}
                      </th>
                      <th
                        className="is-num is-sortable"
                        onClick={() => handleSort("clicks")}
                      >
                        Clicks {sortField === "clicks" && (sortOrder === "desc" ? "↓" : "↑")}
                      </th>
                      <th
                        className="is-num is-sortable"
                        onClick={() => handleSort("impressions")}
                      >
                        Impressions {sortField === "impressions" && (sortOrder === "desc" ? "↓" : "↑")}
                      </th>
                      <th
                        className="is-num is-sortable"
                        onClick={() => handleSort("ctr")}
                      >
                        CTR {sortField === "ctr" && (sortOrder === "desc" ? "↓" : "↑")}
                      </th>
                      <th
                        className="is-num is-sortable"
                        onClick={() => handleSort("position")}
                      >
                        Position {sortField === "position" && (sortOrder === "desc" ? "↓" : "↑")}
                      </th>
                    </>
                  )}

                  {activeTab === "pages" && (
                    <>
                      <th
                        className="is-sortable"
                        onClick={() => handleSort("name")}
                      >
                        Page {sortField === "name" && (sortOrder === "desc" ? "↓" : "↑")}
                      </th>
                      <th
                        className="is-num is-sortable"
                        onClick={() => handleSort("clicks")}
                      >
                        Clicks {sortField === "clicks" && (sortOrder === "desc" ? "↓" : "↑")}
                      </th>
                      <th
                        className="is-num is-sortable"
                        onClick={() => handleSort("impressions")}
                      >
                        Impressions {sortField === "impressions" && (sortOrder === "desc" ? "↓" : "↑")}
                      </th>
                      <th
                        className="is-num is-sortable"
                        onClick={() => handleSort("ctr")}
                      >
                        CTR {sortField === "ctr" && (sortOrder === "desc" ? "↓" : "↑")}
                      </th>
                      <th
                        className="is-num is-sortable"
                        onClick={() => handleSort("position")}
                      >
                        Position {sortField === "position" && (sortOrder === "desc" ? "↓" : "↑")}
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedDataset.map((row, idx) => {
                  const key = row.query || row.page || String(idx);
                  const isChecked = selectedRows.has(key);

                  if (activeTab === "striking") {
                    return (
                      <tr key={key}>
                        <td className="gsc-cell-checkbox">
                          <input
                            type="checkbox"
                            className="gsc-input-checkbox"
                            checked={isChecked}
                            onChange={() => handleSelectRow(key)}
                          />
                        </td>
                        <td className="gsc-cell-query-text" title={row.query}>
                          {row.query}
                        </td>
                        <td className="gsc-cell-page-text" title={row.page}>
                          {row.page ? (
                            <a
                              href={row.page}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {row.page}
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="is-num">{formatNumber(row.impressions)}</td>
                        <td className="is-num">{formatNumber(row.clicks)}</td>
                        <td className="is-num">{formatPosition(row.position)}</td>
                      </tr>
                    );
                  }

                  if (activeTab === "queries") {
                    return (
                      <tr key={key}>
                        <td className="gsc-cell-checkbox">
                          <input
                            type="checkbox"
                            className="gsc-input-checkbox"
                            checked={isChecked}
                            onChange={() => handleSelectRow(key)}
                          />
                        </td>
                        <td className="gsc-cell-query-text" title={row.query}>
                          {row.query}
                        </td>
                        <td className="is-num">{formatNumber(row.clicks)}</td>
                        <td className="is-num">{formatNumber(row.impressions)}</td>
                        <td className="is-num">{formatCTR(row.ctr)}</td>
                        <td className="is-num">{formatPosition(row.position)}</td>
                      </tr>
                    );
                  }

                  // Pages Tab
                  return (
                    <tr key={key}>
                      <td className="gsc-cell-checkbox">
                        <input
                          type="checkbox"
                          className="gsc-input-checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectRow(key)}
                        />
                      </td>
                      <td className="gsc-cell-page-text" title={row.page}>
                        {row.page ? (
                          <a
                            href={row.page}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {row.page}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="is-num">{formatNumber(row.clicks)}</td>
                      <td className="is-num">{formatNumber(row.impressions)}</td>
                      <td className="is-num">{formatCTR(row.ctr)}</td>
                      <td className="is-num">{formatPosition(row.position)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Row / Pagination */}
        <div className="gsc-footer-row">
          <div>
            {startItemIdx}-{endItemIdx} of {totalItems}
            {tableHasMore && (
              <span style={{ marginLeft: "8px" }}>
                (loaded {totalItems} rows — more are available on the server)
              </span>
            )}
          </div>

          <div className="gsc-footer-pagination">
            <div className="gsc-footer-rows-select">
              <span>Rows per page</span>
              <select
                className="gsc-rows-dropdown"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="gsc-page-navigation">
              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                className="gsc-arrow-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                aria-label="Previous Page"
              >
                ‹
              </button>

              <button
                type="button"
                className="gsc-arrow-btn"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                aria-label="Next Page"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
