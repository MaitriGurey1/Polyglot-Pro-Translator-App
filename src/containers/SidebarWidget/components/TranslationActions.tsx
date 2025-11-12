/**
 * Translation Actions Component (Start Button & Error Display)
 */

import React from "react";

interface TranslationActionsProps {
  isTranslating: boolean;
  hasApiKey: boolean;
  error: string;
  onStartTranslation: () => void;
}

export const TranslationActions: React.FC<TranslationActionsProps> = ({
  isTranslating,
  hasApiKey,
  error,
  onStartTranslation,
}) => {
  return (
    <div style={{ padding: "16px" }}>
      <button
        onClick={onStartTranslation}
        disabled={isTranslating || !hasApiKey}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: isTranslating || !hasApiKey ? "#d1d5db" : "#6366f1",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: isTranslating || !hasApiKey ? "not-allowed" : "pointer",
          transition: "background-color 0.2s",
        }}
      >
        {isTranslating ? "Translating..." : "Start Translation"}
      </button>

      {/* Error/Status Message */}
      {error && (
        <div
          style={{
            marginTop: "12px",
            padding: "12px",
            backgroundColor: "#fee",
            border: "1px solid #fcc",
            borderRadius: "8px",
            color: "#c33",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

