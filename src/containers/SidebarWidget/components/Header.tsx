/**
 * Header component for the Translation Sidebar
 */

import React from "react";

interface HeaderProps {
  currentLocaleDisplay: string;
  hasApiKey: boolean;
  hasManagementToken: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocaleDisplay,
  hasApiKey,
  hasManagementToken,
}) => {
  return (
    <>
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#f9fafb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: "18px", fontWeight: "700", margin: "0" }}>
          <span style={{ color: "#6366f1" }}>Polyglot</span> Pro
        </h1>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "600",
              color: "#6b7280",
              backgroundColor: "#e5e7eb",
              padding: "4px 12px",
              borderRadius: "9999px",
            }}
          >
            Base: {currentLocaleDisplay}
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "600",
              color: hasApiKey ? "#059669" : "#dc2626",
              backgroundColor: hasApiKey ? "#d1fae5" : "#fee2e2",
              padding: "4px 8px",
              borderRadius: "9999px",
            }}
          >
            {hasApiKey ? "✓ API" : "✗ No API"}
          </span>
        </div>
      </div>

      {/* Configuration Warning */}
      {(!hasApiKey || !hasManagementToken) && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#fef2f2",
            borderBottom: "1px solid #fecaca",
          }}
        >
          <p style={{ fontSize: "12px", color: "#991b1b", margin: "0", lineHeight: "1.5" }}>
            <strong>⚠️ Configuration Required:</strong> Go to{" "}
            <strong>Settings → Apps → Polyglot Pro → Configure</strong> to add:
            {!hasApiKey && " Gemini API key"}
            {!hasApiKey && !hasManagementToken && " and"}
            {!hasManagementToken && " Management Token"}
          </p>
        </div>
      )}
    </>
  );
};

