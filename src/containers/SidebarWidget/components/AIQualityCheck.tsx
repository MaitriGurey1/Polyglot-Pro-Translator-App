/**
 * AI Quality Check Component
 */

import React from "react";

interface AIQualityCheckProps {
  currentLocaleDisplay: string;
  isAnalyzing: boolean;
  analysisResult: string;
  hasApiKey: boolean;
  onRunAnalysis: () => void;
}

export const AIQualityCheck: React.FC<AIQualityCheckProps> = ({
  currentLocaleDisplay,
  isAnalyzing,
  analysisResult,
  hasApiKey,
  onRunAnalysis,
}) => {
  return (
    <div
      style={{
        padding: "16px",
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: "#fef3c7",
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
        ✨ AI Quality Check (Base: {currentLocaleDisplay})
      </h2>
      <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "12px" }}>
        Analyze source content for tone, clarity, and SEO readiness before translating.
      </p>
      <button
        onClick={onRunAnalysis}
        disabled={isAnalyzing || !hasApiKey}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: isAnalyzing || !hasApiKey ? "#d1d5db" : "#eab308",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "600",
          cursor: isAnalyzing || !hasApiKey ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isAnalyzing ? "Analyzing..." : "Run AI Quality Check"}
      </button>
      {analysisResult && (
        <div
          style={{
            marginTop: "12px",
            padding: "12px",
            backgroundColor: "#fff",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "12px",
            whiteSpace: "pre-wrap",
          }}
        >
          {analysisResult}
        </div>
      )}
    </div>
  );
};

