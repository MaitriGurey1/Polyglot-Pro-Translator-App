/**
 * Constants for the Translation Sidebar Widget
 */

import { LocaleDisplayInfo, StatusStyles } from "./types";

// Helper to clean environment variables (removes quotes and semicolons)
const cleanEnvValue = (value: string | undefined): string => {
  if (!value) return "";
  return value.trim().replace(/^["']|["'];?$/g, "");
};

// Environment configuration
export const DEFAULT_GEMINI_MODEL =
  cleanEnvValue(import.meta.env.VITE_GEMINI_DEFAULT_MODEL) || "gemini-2.5-flash";
export const CONTENTSTACK_API_BASE_URL =
  cleanEnvValue(import.meta.env.VITE_CONTENTSTACK_API_BASE_URL) || "https://eu-api.contentstack.com";

// Locale display name mapping for common locales
export const LOCALE_DISPLAY_NAMES: Record<string, LocaleDisplayInfo> = {
  "en-us": { name: "English (US)", flag: "🇺🇸" },
  "en-gb": { name: "English (UK)", flag: "🇬🇧" },
  "en": { name: "English", flag: "🇬🇧" },
  "es": { name: "Spanish", flag: "🇪🇸" },
  "es-es": { name: "Spanish (Spain)", flag: "🇪🇸" },
  "es-mx": { name: "Spanish (Mexico)", flag: "🇲🇽" },
  "fr": { name: "French", flag: "🇫🇷" },
  "fr-fr": { name: "French (France)", flag: "🇫🇷" },
  "fr-ca": { name: "French (Canada)", flag: "🇨🇦" },
  "de": { name: "German", flag: "🇩🇪" },
  "de-de": { name: "German", flag: "🇩🇪" },
  "it": { name: "Italian", flag: "🇮🇹" },
  "it-it": { name: "Italian", flag: "🇮🇹" },
  "pt": { name: "Portuguese", flag: "🇵🇹" },
  "pt-br": { name: "Portuguese (Brazil)", flag: "🇧🇷" },
  "pt-pt": { name: "Portuguese (Portugal)", flag: "🇵🇹" },
  "nl": { name: "Dutch", flag: "🇳🇱" },
  "nl-nl": { name: "Dutch", flag: "🇳🇱" },
  "pl": { name: "Polish", flag: "🇵🇱" },
  "pl-pl": { name: "Polish", flag: "🇵🇱" },
  "ru": { name: "Russian", flag: "🇷🇺" },
  "ru-ru": { name: "Russian", flag: "🇷🇺" },
  "ja": { name: "Japanese", flag: "🇯🇵" },
  "ja-jp": { name: "Japanese", flag: "🇯🇵" },
  "ko": { name: "Korean", flag: "🇰🇷" },
  "ko-kr": { name: "Korean", flag: "🇰🇷" },
  "zh": { name: "Chinese", flag: "🇨🇳" },
  "zh-cn": { name: "Chinese (Simplified)", flag: "🇨🇳" },
  "zh-tw": { name: "Chinese (Traditional)", flag: "🇹🇼" },
  "ar": { name: "Arabic", flag: "🇸🇦" },
  "ar-sa": { name: "Arabic (Saudi Arabia)", flag: "🇸🇦" },
  "hi": { name: "Hindi", flag: "🇮🇳" },
  "hi-in": { name: "Hindi", flag: "🇮🇳" },
  "tr": { name: "Turkish", flag: "🇹🇷" },
  "tr-tr": { name: "Turkish", flag: "🇹🇷" },
  "sv": { name: "Swedish", flag: "🇸🇪" },
  "sv-se": { name: "Swedish", flag: "🇸🇪" },
  "da": { name: "Danish", flag: "🇩🇰" },
  "da-dk": { name: "Danish", flag: "🇩🇰" },
  "fi": { name: "Finnish", flag: "🇫🇮" },
  "fi-fi": { name: "Finnish", flag: "🇫🇮" },
  "no": { name: "Norwegian", flag: "🇳🇴" },
  "nb-no": { name: "Norwegian (Bokmål)", flag: "🇳🇴" },
};

// Translatable field data types
export const TRANSLATABLE_DATA_TYPES = [
  "text",
  "multi_line",
  "markdown",
  "html",
  "json",
] as const;

// System fields that should not be translated
export const SYSTEM_FIELDS = [
  "uid",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by",
  "ACL",
  "locale",
  "publish_details",
  "_version",
  "tags",
  "_in_progress",
] as const;

// Common field names that are typically translatable
export const COMMON_TRANSLATABLE_FIELDS = [
  "title",
  "description",
  "body",
  "content",
  "text",
] as const;

// Tone mapping for AI refinement
export const TONE_MAP = {
  professional: "Professional / Formal",
  casual: "Casual / Friendly",
  academic: "Academic / Technical",
} as const;

// Status styles for translation progress
export const STATUS_STYLES: Record<string, StatusStyles> = {
  complete: {
    text: "Complete",
    bg: "bg-green-100",
    color: "text-green-700",
    icon: "✅",
  },
  in_progress: {
    text: "Processing",
    bg: "bg-yellow-100",
    color: "text-yellow-700",
    icon: "⏳",
  },
  incomplete: {
    text: "Not Started",
    bg: "bg-gray-100",
    color: "text-gray-600",
    icon: "⚪",
  },
  error: {
    text: "Error",
    bg: "bg-red-100",
    color: "text-red-700",
    icon: "❌",
  },
};

// Fallback locales if API fails
export const FALLBACK_LOCALES = [
  { code: "en-us", name: "English (US)", flag: "🇺🇸", selected: false },
  { code: "fr-fr", name: "French (France)", flag: "🇫🇷", selected: false },
] as const;

