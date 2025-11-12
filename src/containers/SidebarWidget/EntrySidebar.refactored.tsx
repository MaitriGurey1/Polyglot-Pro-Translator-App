/**
 * Entry Sidebar Extension - Refactored
 * Main component for the translation sidebar widget
 */

import { useState } from "react";
import "../index.css";
import "./EntrySidebar.css";
import { useAppSdk } from "../../common/hooks/useAppSdk";
import { useAppConfig } from "../../common/hooks/useAppConfig";

// Custom hooks
import {
  useTranslationConfig,
  useStackLocales,
  useEntryFields,
  useTranslation,
  useAIFeatures,
} from "./hooks";

// UI Components
import {
  Header,
  TranslationStatusDashboard,
  AIQualityCheck,
  AIToneRefinement,
  LanguageSelector,
  FieldSelector,
  TranslationActions,
} from "./components";

const EntrySidebarExtension = () => {
  const appSDK = useAppSdk();
  const appConfig = useAppConfig();

  // Error state
  const [error, setError] = useState<string>("");

  // Extract configuration
  const config = useTranslationConfig(appSDK, appConfig);

  // Load stack locales
  const { locales, toggleLocale } = useStackLocales(appSDK);

  // Load entry data and fields
  const { entryData, currentLocale, currentLocaleDisplay, availableFields, toggleField } =
    useEntryFields(appSDK);

  // Translation logic
  const { isTranslating, translationStatuses, startTranslation } = useTranslation();

  // AI features
  const {
    isAnalyzing,
    analysisResult,
    runQualityAnalysis,
    selectedTone,
    isRefining,
    refinementResult,
    setSelectedTone,
    runToneRefinement,
  } = useAIFeatures();

  // Handlers
  const handleStartTranslation = async () => {
    if (!config.apiKey) {
      setError("⚠️ API key not configured. Please go to Settings → Apps → Polyglot Pro → Configure.");
      return;
    }

    if (!config.managementToken) {
      setError("⚠️ Management Token not configured. Required for automatic entry localization.");
      return;
    }

    const selectedLocales = locales.filter((loc) => loc.selected);
    if (selectedLocales.length === 0) {
      setError("Please select at least one target language");
      return;
    }

    const selectedFields = availableFields.filter((f) => f.selected);
    if (selectedFields.length === 0) {
      setError("Please select at least one field to translate");
      return;
    }

    setError("");

    const entry = appSDK?.location?.SidebarWidget?.entry._data;
    const entryUid = (entry as any)?.uid;
    const contentTypeUid = appSDK?.location?.SidebarWidget?.entry?.content_type?.uid;

    console.log("🔑 Entry UID:", entryUid);
    console.log("🔑 Content Type UID:", contentTypeUid);

    if (!entryUid || !contentTypeUid) {
      setError("Unable to get entry information");
      return;
    }

    try {
      await startTranslation(
        selectedLocales,
        selectedFields,
        entryData,
        entryUid,
        contentTypeUid,
        config,
        appSDK
      );
    } catch (err: any) {
      setError(`Translation failed: ${err.message}`);
    }
  };

  const handleRunQualityAnalysis = async () => {
    setError("");
    try {
      await runQualityAnalysis(availableFields, entryData, config);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRunToneRefinement = async () => {
    setError("");
    try {
      await runToneRefinement(availableFields, entryData, config);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div
      className="layout-container"
      style={{
        padding: "0",
        margin: "0",
        fontFamily: "Inter, sans-serif",
        height: "100%",
        overflow: "auto",
      }}
    >
      <div style={{ padding: "16px", backgroundColor: "#f7f9fb" }}>
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          {/* Header */}
          <Header
            currentLocaleDisplay={currentLocaleDisplay}
            hasApiKey={!!config.apiKey}
            hasManagementToken={!!config.managementToken}
          />

          {/* Translation Status Dashboard */}
          <TranslationStatusDashboard statuses={translationStatuses} />

          {/* AI Quality Check */}
          <AIQualityCheck
            currentLocaleDisplay={currentLocaleDisplay}
            isAnalyzing={isAnalyzing}
            analysisResult={analysisResult}
            hasApiKey={!!config.apiKey}
            onRunAnalysis={handleRunQualityAnalysis}
          />

          {/* AI Tone Refinement */}
          <AIToneRefinement
            selectedTone={selectedTone}
            isRefining={isRefining}
            refinementResult={refinementResult}
            hasApiKey={!!config.apiKey}
            onToneChange={setSelectedTone}
            onRunRefinement={handleRunToneRefinement}
          />

          {/* Target Languages Selection */}
          <LanguageSelector
            locales={locales}
            currentLocale={currentLocale}
            onToggleLocale={toggleLocale}
          />

          {/* Fields Selection */}
          <FieldSelector fields={availableFields} onToggleField={toggleField} />

          {/* Action Button & Error Display */}
          <TranslationActions
            isTranslating={isTranslating}
            hasApiKey={!!config.apiKey}
            error={error}
            onStartTranslation={handleStartTranslation}
          />
        </div>
      </div>
    </div>
  );
};

export default EntrySidebarExtension;

