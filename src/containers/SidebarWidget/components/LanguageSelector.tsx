/**
 * Language Selector Component
 */

import React from "react";
import { LocaleInfo } from "../types";

interface LanguageSelectorProps {
  locales: LocaleInfo[];
  currentLocale: string;
  onToggleLocale: (localeCode: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  locales,
  currentLocale,
  onToggleLocale,
}) => {
  const selectedCount = locales.filter((l) => l.selected).length;

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
        🌍 Select Target Languages ({selectedCount} selected)
      </h2>
      <div
        style={{
          maxHeight: "200px",
          overflowY: "auto",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          backgroundColor: "#f9fafb",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {locales.map((locale, index) => {
            const isCurrentLocale = locale.code === currentLocale;
            const isDisabled = isCurrentLocale;

            return (
              <div
                key={locale.code}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 12px",
                  borderBottom:
                    index < locales.length - 1 ? "1px solid #e5e7eb" : "none",
                  backgroundColor: isCurrentLocale ? "#f3f4f6" : "#fff",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  opacity: isDisabled ? 0.6 : 1,
                  transition: "background-color 0.2s",
                }}
                onClick={() => !isDisabled && onToggleLocale(locale.code)}
                onMouseEnter={(e) =>
                  !isDisabled && (e.currentTarget.style.backgroundColor = "#f9fafb")
                }
                onMouseLeave={(e) =>
                  !isDisabled &&
                  (e.currentTarget.style.backgroundColor = isCurrentLocale ? "#f3f4f6" : "#fff")
                }
              >
                <input
                  type="checkbox"
                  checked={locale.selected}
                  disabled={isDisabled}
                  onChange={() => onToggleLocale(locale.code)}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: "16px",
                    height: "16px",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    marginRight: "10px",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "16px", marginRight: "8px" }}>{locale.flag}</span>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#111827", flex: 1 }}>
                  {locale.name}
                </span>
                {isCurrentLocale && (
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "600",
                      color: "#6b7280",
                      backgroundColor: "#e5e7eb",
                      padding: "2px 8px",
                      borderRadius: "9999px",
                    }}
                  >
                    CURRENT
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {locales.length === 0 && (
        <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "8px", marginBottom: "0" }}>
          Loading available locales from stack...
        </p>
      )}
    </div>
  );
};

