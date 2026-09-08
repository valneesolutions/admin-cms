"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const GSCInsightsNavItem: React.FC = () => {
  const pathname = usePathname();
  const isActive = pathname === "/gsc-insights";

  return (
    <div className="gsc-nav-item-wrapper">
      <Link
        href="/gsc-insights"
        className={`nav__link ${isActive ? "active" : ""}`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 16px",
          color: isActive ? "var(--brand-primary, #6a00ff)" : "var(--theme-elevation-800, currentColor)",
          fontWeight: isActive ? 600 : 500,
          fontSize: "14px",
          textDecoration: "none",
          borderRadius: "8px",
          transition: "all 0.2s ease",
          background: isActive ? "rgba(106, 0, 255, 0.12)" : "transparent",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        <span>GSC Insights</span>
      </Link>
    </div>
  );
};
