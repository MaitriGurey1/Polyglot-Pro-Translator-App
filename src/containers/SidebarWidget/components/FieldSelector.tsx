/**
 * Field Selector Component
 */

import React from "react";
import { FieldInfo } from "../types";
import { getFieldIcon, getFieldNestingLevel } from "../fieldHelpers";

interface FieldSelectorProps {
  fields: FieldInfo[];
  onToggleField: (uid: string, parentPath?: string) => void;
}

export const FieldSelector: React.FC<FieldSelectorProps> = ({ fields, onToggleField }) => {
  const selectedCount = fields.filter((f) => f.selected).length;

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
        📝 Fields to Translate ({selectedCount} selected)
      </h2>
      <div
        style={{
          maxHeight: "250px",
          overflowY: "auto",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          backgroundColor: "#f9fafb",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {fields.map((field, index) => {
            const nestingLevel = getFieldNestingLevel(field);
            const indent = nestingLevel * 20;
            const icon = getFieldIcon(field);

            return (
              <div
                key={`${field.parentPath || "root"}-${field.uid}-${index}`}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  padding: "10px 12px",
                  borderBottom: index < fields.length - 1 ? "1px solid #e5e7eb" : "none",
                  backgroundColor: field.isNested ? "#fefce8" : "#fff",
                  marginLeft: `${indent}px`,
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = field.isNested ? "#fef3c7" : "#f9fafb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = field.isNested ? "#fefce8" : "#fff")
                }
              >
                <input
                  type="checkbox"
                  id={`field-${field.parentPath || "root"}-${field.uid}-${index}`}
                  checked={field.selected}
                  onChange={() => onToggleField(field.uid, field.parentPath)}
                  style={{
                    width: "16px",
                    height: "16px",
                    cursor: "pointer",
                    marginTop: "2px",
                    flexShrink: 0,
                  }}
                />
                <label
                  htmlFor={`field-${field.parentPath || "root"}-${field.uid}-${index}`}
                  style={{
                    marginLeft: "10px",
                    flex: 1,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "14px" }}>{icon}</span>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: field.isNested ? "500" : "600",
                        color: "#111827",
                      }}
                    >
                      {field.displayName}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "10px",
                        fontFamily: "monospace",
                        padding: "2px 6px",
                        backgroundColor: field.isNested ? "#fde047" : "#e5e7eb",
                        borderRadius: "4px",
                        color: "#374151",
                      }}
                    >
                      {field.uid}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#6b7280",
                        padding: "2px 6px",
                        backgroundColor: "#f3f4f6",
                        borderRadius: "4px",
                      }}
                    >
                      {field.dataType}
                    </span>
                    {field.isNested && (
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#92400e",
                          padding: "2px 6px",
                          backgroundColor: "#fef3c7",
                          borderRadius: "4px",
                          fontWeight: "600",
                        }}
                      >
                        NESTED
                      </span>
                    )}
                  </div>
                </label>
              </div>
            );
          })}
        </div>
      </div>
      {fields.length === 0 && (
        <p
          style={{
            fontSize: "12px",
            color: "#6b7280",
            textAlign: "center",
            padding: "20px",
            margin: "0",
          }}
        >
          No translatable fields found in this content type.
        </p>
      )}
    </div>
  );
};

