/**
 * AI Tone Refinement Component
 */

import React from "react";
import { ToneType } from "../types";

interface AIToneRefinementProps {
  selectedTone: ToneType;
  isRefining: boolean;
  refinementResult: string;
  hasApiKey: boolean;
  onToneChange: (tone: ToneType) => void;
  onRunRefinement: () => void;
}

export const AIToneRefinement: React.FC<AIToneRefinementProps> = ({
  selectedTone,
  isRefining,
  refinementResult,
  hasApiKey,
  onToneChange,
  onRunRefinement,
}) => {
  return (
    <div
      style={{
        padding: "16px",
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: "#dbeafe",
      }}
    >
      <h2
        style={{
          fontSize: "14px",
          fontWeight: "700",
          color: "#374151",
          marginBottom: "8px",
          marginTop: "0",
        }}
      >
        ✨ AI Tone Refinement
      </h2>
      <select
        value={selectedTone}
        onChange={(e) => onToneChange(e.target.value as ToneType)}
        style={{
          width: "100%",
          padding: "8px 12px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          fontSize: "13px",
          marginBottom: "12px",
        }}
      >
        <option value="professional">Professional / Formal</option>
        <option value="casual">Casual / Friendly</option>
        <option value="academic">Academic / Technical</option>
      </select>
      <button
        onClick={onRunRefinement}
        disabled={isRefining || !hasApiKey}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: isRefining || !hasApiKey ? "#d1d5db" : "#3b82f6",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "600",
          cursor: isRefining || !hasApiKey ? "not-allowed" : "pointer",
        }}
      >
        {isRefining ? "Refining..." : "Refine Selected Field"}
      </button>
      {refinementResult && (
        <div
          style={{
            marginTop: "12px",
            padding: "12px",
            backgroundColor: "#fff",
            border: "1px solid #bfdbfe",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        >
          <strong>Refined Text:</strong>
          <div style={{ marginTop: "8px", color: "#1e40af" }}>{refinementResult}</div>
        </div>
      )}
    </div>
  );
};

