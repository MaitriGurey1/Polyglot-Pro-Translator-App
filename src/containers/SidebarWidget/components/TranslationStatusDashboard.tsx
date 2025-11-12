/**
 * Translation Status Dashboard Component
 */

import React from "react";
import { TranslationStatus } from "../types";
import { STATUS_STYLES } from "../constants";

interface TranslationStatusDashboardProps {
  statuses: TranslationStatus[];
}

export const TranslationStatusDashboard: React.FC<TranslationStatusDashboardProps> = ({
  statuses,
}) => {
  if (statuses.length === 0) {
    return null;
  }

  return (
    <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb" }}>
      <h2
        style={{
          fontSize: "14px",
          fontWeight: "600",
          color: "#374151",
          marginBottom: "12px",
          marginTop: "0",
        }}
      >
        Translation Status
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {statuses.map((status) => {
          const styles = STATUS_STYLES[status.status] || STATUS_STYLES.incomplete;
          return (
            <div key={status.code}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "13px",
                }}
              >
                <div style={{ fontWeight: "500", color: "#111827" }}>
                  {status.name} ({status.code.toUpperCase()})
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                  }}
                  className={`${styles.bg} ${styles.color}`}
                >
                  {styles.icon} {styles.text}{" "}
                  {status.status === "in_progress" && `(${status.progress}%)`}
                </div>
              </div>
              {status.status === "in_progress" && (
                <div
                  style={{
                    width: "100%",
                    backgroundColor: "#e5e7eb",
                    borderRadius: "9999px",
                    height: "6px",
                    marginTop: "4px",
                  }}
                >
                  <div
                    style={{
                      width: `${status.progress}%`,
                      backgroundColor: "#6366f1",
                      height: "6px",
                      borderRadius: "9999px",
                      transition: "width 0.3s",
                    }}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

