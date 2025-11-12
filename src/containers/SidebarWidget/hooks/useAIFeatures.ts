/**
 * Hook to manage AI features (quality check and tone refinement)
 */

import { useState } from "react";
import { ToneType, FieldInfo, TranslationConfig } from "../types";
import { analyzeContentQuality, refineContentTone } from "../translationApi";
import { TONE_MAP } from "../constants";

interface UseAIFeaturesResult {
  // Quality Check
  isAnalyzing: boolean;
  analysisResult: string;
  runQualityAnalysis: (
    selectedFields: FieldInfo[],
    entryData: any,
    config: TranslationConfig
  ) => Promise<void>;

  // Tone Refinement
  selectedTone: ToneType;
  isRefining: boolean;
  refinementResult: string;
  setSelectedTone: (tone: ToneType) => void;
  runToneRefinement: (
    selectedFields: FieldInfo[],
    entryData: any,
    config: TranslationConfig
  ) => Promise<void>;
}

export function useAIFeatures(): UseAIFeaturesResult {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [refinementResult, setRefinementResult] = useState<string>("");
  const [selectedTone, setSelectedTone] = useState<ToneType>("professional");

  const runQualityAnalysis = async (
    selectedFields: FieldInfo[],
    entryData: any,
    config: TranslationConfig
  ) => {
    setIsAnalyzing(true);
    setAnalysisResult("");

    try {
      const textFields = selectedFields
        .filter((f) => f.selected && entryData[f.uid])
        .map((f) => `${f.displayName}: ${JSON.stringify(entryData[f.uid])}`)
        .join("\n");

      if (!textFields) {
        throw new Error("No content to analyze. Please select fields.");
      }

      const result = await analyzeContentQuality(textFields, config);
      setAnalysisResult(result);
    } catch (err: any) {
      throw new Error(`AI Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runToneRefinement = async (
    selectedFields: FieldInfo[],
    entryData: any,
    config: TranslationConfig
  ) => {
    setIsRefining(true);
    setRefinementResult("");

    try {
      const selectedField = selectedFields.find((f) => f.selected);
      if (!selectedField || !entryData[selectedField.uid]) {
        throw new Error("Please select a field to refine");
      }

      const originalText = entryData[selectedField.uid];
      const tone = TONE_MAP[selectedTone];

      const result = await refineContentTone(originalText, tone, config);
      setRefinementResult(result);
    } catch (err: any) {
      throw new Error(`AI Refinement failed: ${err.message}`);
    } finally {
      setIsRefining(false);
    }
  };

  return {
    isAnalyzing,
    analysisResult,
    runQualityAnalysis,
    selectedTone,
    isRefining,
    refinementResult,
    setSelectedTone,
    runToneRefinement,
  };
}

