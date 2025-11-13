/**
 * Hook to fetch and manage stack locales
 */

import { useState, useEffect } from "react";
import { LocaleInfo } from "../types";
import { getLocaleDisplayInfo } from "../fieldHelpers";
import { FALLBACK_LOCALES } from "../constants";

export function useStackLocales(appSDK: any) {
  const [locales, setLocales] = useState<LocaleInfo[]>([]);

  useEffect(() => {
    const fetchStackLocales = async () => {
      try {
        if (!appSDK?.stack?.getLocales) {
          console.warn("⚠️ getLocales method not available");
          return;
        }

        // Use the official app-sdk method to get locales
        const localesData = await appSDK.stack.getLocales();

        // Access the locales array from the returned object
        const localesArray = (localesData as any)?.locales;

        if (localesArray && Array.isArray(localesArray)) {
          const processedLocales = localesArray.map((locale: any) => {
            const localeCode = locale.code;
            const localeName = locale.name;
            const displayInfo = getLocaleDisplayInfo(localeCode);

            return {
              code: localeCode,
              name: localeName || displayInfo.name,
              flag: displayInfo.flag,
              selected: false,
            };
          });

          setLocales(processedLocales);
        } else {
          console.warn("⚠️ Invalid locales data format");
        }
      } catch (error) {
        console.error("❌ Error fetching stack locales:", error);
        // Fallback to common locales if API fails
        setLocales([...FALLBACK_LOCALES]);
      }
    };

    if (appSDK?.stack) {
      fetchStackLocales();
    }
  }, [appSDK]);

  const toggleLocale = (localeCode: string) => {
    setLocales((prev) =>
      prev.map((loc) => (loc.code === localeCode ? { ...loc, selected: !loc.selected } : loc))
    );
  };

  return { locales, toggleLocale };
}

