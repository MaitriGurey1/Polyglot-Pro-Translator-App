/**
 * Type definitions for the Translation Sidebar Widget
 */

export interface LocaleInfo {
  code: string;
  name: string;
  flag: string;
  selected: boolean;
}

export interface FieldInfo {
  uid: string;
  displayName: string;
  dataType: string;
  selected: boolean;
  parentPath?: string;
  isNested?: boolean;
}

export type TranslationStatusType = "complete" | "in_progress" | "incomplete" | "error";

export interface TranslationStatus {
  code: string;
  name: string;
  status: TranslationStatusType;
  progress: number;
}

export interface LocaleDisplayInfo {
  name: string;
  flag: string;
}

export type ToneType = "professional" | "casual" | "academic";

export interface GeminiPayload {
  contents: Array<{
    parts: Array<{ text: string }>;
  }>;
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
  tools?: Array<{ google_search: Record<string, never> }>;
}

export interface TranslationConfig {
  apiKey: string;
  managementToken: string;
  stackApiKey: string;
  selectedModel: string;
  apiBaseUrl: string;
}

export interface StatusStyles {
  text: string;
  bg: string;
  color: string;
  icon: string;
}

