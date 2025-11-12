/**
 * Hook to load and manage entry data and fields
 */

import { useState, useEffect } from "react";
import { FieldInfo } from "../types";
import { extractTranslatableFields, extractFallbackFields, getLocaleDisplayInfo } from "../fieldHelpers";

interface UseEntryFieldsResult {
  entryData: any;
  currentLocale: string;
  currentLocaleDisplay: string;
  availableFields: FieldInfo[];
  toggleField: (uid: string, parentPath?: string) => void;
}

export function useEntryFields(appSDK: any): UseEntryFieldsResult {
  const [entryData, setEntryData] = useState<any>(null);
  const [currentLocale, setCurrentLocale] = useState<string>("en");
  const [currentLocaleDisplay, setCurrentLocaleDisplay] = useState<string>("English");
  const [availableFields, setAvailableFields] = useState<FieldInfo[]>([]);

  useEffect(() => {
    if (!appSDK?.location?.SidebarWidget?.entry) {
      return;
    }

    const loadEntryAndSchema = async () => {
      try {
        const entry = appSDK?.location?.SidebarWidget?.entry;
        if (!entry) return;

        const data = entry.getData();
        setEntryData(data);

        // Get locale from entry
        const localeCode = (entry as any).locale || "en";
        setCurrentLocale(localeCode);

        // Get display name for current locale
        const displayInfo = getLocaleDisplayInfo(localeCode);
        setCurrentLocaleDisplay(displayInfo.name);

        console.log("🌍 Current Entry Locale:", localeCode, "->", displayInfo.name);

        const contentType = (entry as any).content_type;

        if (contentType && contentType.schema) {
          const translatableFields = extractTranslatableFields(contentType.schema);
          console.log("✅ Loaded translatable fields from schema (including nested):", translatableFields);
          setAvailableFields(translatableFields);
        } else {
          console.warn("⚠️ Could not access content type schema, using fallback method");
          if (data) {
            const fields = extractFallbackFields(data);
            setAvailableFields(fields);
          }
        }
      } catch (error) {
        console.error("Error loading entry data and schema:", error);
      }
    };

    loadEntryAndSchema();
  }, [appSDK]);

  const toggleField = (uid: string, parentPath?: string) => {
    setAvailableFields((prev) =>
      prev.map((f) => {
        const matches = f.uid === uid && (f.parentPath || "") === (parentPath || "");
        return matches ? { ...f, selected: !f.selected } : f;
      })
    );
  };

  return {
    entryData,
    currentLocale,
    currentLocaleDisplay,
    availableFields,
    toggleField,
  };
}

