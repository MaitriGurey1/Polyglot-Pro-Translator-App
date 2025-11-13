/**
 * Hook to extract and manage translation configuration
 */

import { useMemo } from "react";
import { TranslationConfig } from "../types";
import { DEFAULT_GEMINI_MODEL, CONTENTSTACK_API_BASE_URL } from "../constants";

export function useTranslationConfig(appSDK: any, appConfig: any): TranslationConfig {
  return useMemo(() => {

    // Try multiple access patterns to find the configuration
    const apiKey =
      ((appConfig as any)?.value?.gemini_api_key as string) ||
      ((appConfig as any)?.gemini_api_key as string) ||
      "";

    const selectedModel =
      ((appConfig as any)?.value?.gemini_model as string) ||
      ((appConfig as any)?.gemini_model as string) ||
      DEFAULT_GEMINI_MODEL;

    const managementToken =
      ((appConfig as any)?.value?.management_token as string) ||
      ((appConfig as any)?.management_token as string) ||
      "";

    const stackApiKey = (appSDK?.stack as any)?._data?.api_key || "";
    return {
      apiKey,
      managementToken,
      stackApiKey,
      selectedModel,
      apiBaseUrl: CONTENTSTACK_API_BASE_URL,
    };
  }, [appSDK, appConfig]);
}

