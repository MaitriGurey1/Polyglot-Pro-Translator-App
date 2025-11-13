/**
 * Hook to manage translation operations
 */

import { useState } from "react";
import { TranslationStatus, LocaleInfo, FieldInfo, TranslationConfig } from "../types";
import { translateText, updateLocalizedEntry } from "../translationApi";
import { getNestedValue } from "../fieldHelpers";

interface UseTranslationResult {
  isTranslating: boolean;
  translationStatuses: TranslationStatus[];
  startTranslation: (
    selectedLocales: LocaleInfo[],
    selectedFields: FieldInfo[],
    entryData: any,
    entryUid: string,
    contentTypeUid: string,
    config: TranslationConfig,
    appSDK: any
  ) => Promise<void>;
}

export function useTranslation(): UseTranslationResult {
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translationStatuses, setTranslationStatuses] = useState<TranslationStatus[]>([]);

  const startTranslation = async (
    selectedLocales: LocaleInfo[],
    selectedFields: FieldInfo[],
    entryData: any,
    entryUid: string,
    contentTypeUid: string,
    config: TranslationConfig,
    appSDK: any
  ) => {
    setIsTranslating(true);

    // Initialize statuses for all selected locales
    const statuses: TranslationStatus[] = selectedLocales.map((loc) => ({
      code: loc.code,
      name: loc.name,
      status: "in_progress",
      progress: 0,
    }));
    setTranslationStatuses(statuses);

    try {
      // Process each selected locale
      for (let localeIndex = 0; localeIndex < selectedLocales.length; localeIndex++) {
        const targetLocale = selectedLocales[localeIndex];

        // Step 1: Translate all selected fields
        const translatedFields: Record<string, any> = {};

        for (let fieldIndex = 0; fieldIndex < selectedFields.length; fieldIndex++) {
          const field = selectedFields[fieldIndex];
          const originalValue = getNestedValue(entryData, field.parentPath || "", field.uid);

          if (typeof originalValue === "string" && originalValue.trim().length > 0) {
            const translatedValue = await translateText(originalValue, targetLocale, config);

            // Build the translated fields object (only top-level fields for now)
            if (!field.parentPath) {
              translatedFields[field.uid] = translatedValue;
            } else {
              // For nested fields, store with field uid
              translatedFields[field.uid] = translatedValue;
            }
          }

          // Update progress
          const fieldProgress = ((fieldIndex + 1) / selectedFields.length) * 100;
          const overallProgress = (localeIndex * 100 + fieldProgress) / selectedLocales.length;

          setTranslationStatuses((prev) =>
            prev.map((s) =>
              s.code === targetLocale.code ? { ...s, progress: Math.round(overallProgress) } : s
            )
          );
        }

        // Step 2: Save translated fields
        const updated = await updateLocalizedEntry(
          entryUid,
          contentTypeUid,
          targetLocale.code,
          translatedFields,
          config
        );

        // Update final status
        setTranslationStatuses((prev) =>
          prev.map((s) =>
            s.code === targetLocale.code
              ? { ...s, status: updated ? "complete" : "error", progress: updated ? 100 : 0 }
              : s
          )
        );
      }

      // Show success notification
      if (appSDK?.stack) {
        try {
          (appSDK.stack as any).showSuccessNotification?.(
            `Translation completed for ${selectedLocales.length} language(s)!`
          );
        } catch (e) {
          // Notification not available
        }
      }
    } catch (err: any) {
      console.error("Translation failed:", err);
      setTranslationStatuses((prev) =>
        prev.map((s) => ({ ...s, status: "error", progress: 0 }))
      );
      throw err;
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    isTranslating,
    translationStatuses,
    startTranslation,
  };
}

