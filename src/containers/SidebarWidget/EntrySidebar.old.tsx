import { useState, useEffect } from "react";
import "../index.css";
import "./EntrySidebar.css";
import { useAppSdk } from "../../common/hooks/useAppSdk";
import { useAppConfig } from "../../common/hooks/useAppConfig";

// Load configuration from environment variables
const DEFAULT_GEMINI_MODEL = import.meta.env.VITE_GEMINI_DEFAULT_MODEL || "gemini-2.5-flash";
const CONTENTSTACK_API_BASE_URL = import.meta.env.VITE_CONTENTSTACK_API_BASE_URL || "https://eu-api.contentstack.com";

// Locale display name mapping for common locales
const LOCALE_DISPLAY_NAMES: { [key: string]: { name: string; flag: string } } = {
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

// Helper function to get locale display info
const getLocaleDisplayInfo = (localeCode: string): { name: string; flag: string } => {
  const normalizedCode = localeCode.toLowerCase();
  
  // Try exact match first
  if (LOCALE_DISPLAY_NAMES[normalizedCode]) {
    return LOCALE_DISPLAY_NAMES[normalizedCode];
  }
  
  // Try base language code (e.g., "en-au" -> "en")
  const baseCode = normalizedCode.split('-')[0];
  if (LOCALE_DISPLAY_NAMES[baseCode]) {
    return LOCALE_DISPLAY_NAMES[baseCode];
  }
  
  // Fallback: format the locale code nicely
  return {
    name: localeCode.toUpperCase().replace('-', ' - '),
    flag: "🌐"
  };
};

interface TranslationStatus {
  code: string;
  name: string;
  status: "complete" | "in_progress" | "incomplete" | "error";
  progress: number;
}

interface FieldInfo {
  uid: string;
  displayName: string;
  dataType: string;
  selected: boolean;
  parentPath?: string; 
  isNested?: boolean;
}

const EntrySidebarExtension = () => {
  const appSDK = useAppSdk();
  const appConfig = useAppConfig();

  const [entryData, setEntryData] = useState<any>(null);
  const [currentLocale, setCurrentLocale] = useState<string>("en");
  const [currentLocaleDisplay, setCurrentLocaleDisplay] = useState<string>("English");
  const [availableLocales, setAvailableLocales] = useState<Array<{ code: string; name: string; flag: string; selected: boolean }>>([]);
  const [availableFields, setAvailableFields] = useState<FieldInfo[]>([]);
  const [translationStatuses, setTranslationStatuses] = useState<TranslationStatus[]>([]);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [refinementResult, setRefinementResult] = useState<string>("");
  const [selectedTone, setSelectedTone] = useState<string>("professional");
  
  // Get API key, model, and management token from app configuration
  // NOTE: Access via appConfig (from getConfig())
  console.log("📦 Full appConfig:", appConfig);
  console.log("📦 appConfig.value:", (appConfig as any)?.value);
  console.log("📦 appConfig keys:", Object.keys(appConfig || {}));
  
  // Try multiple access patterns to find the right one
  const apiKey = ((appConfig as any)?.value?.gemini_api_key as string) 
    || ((appConfig as any)?.gemini_api_key as string) 
    || "";
  const selectedModel = ((appConfig as any)?.value?.gemini_model as string) 
    || ((appConfig as any)?.gemini_model as string) 
    || DEFAULT_GEMINI_MODEL;
  const managementToken = ((appConfig as any)?.value?.management_token as string) 
    || ((appConfig as any)?.management_token as string) 
    || "";
  const stackApiKey = (appSDK?.stack as any)?._data?.api_key || "";
  // const stackApiKey = 'blt905d31d0c2b10bda';
  
  console.log("🔑 Gemini API Key:", apiKey ? `${apiKey.substring(0, 15)}...` : 'MISSING');
  console.log("🔑 Management Token:", managementToken ? `${managementToken.substring(0, 15)}...` : 'MISSING');
  console.log("🔑 Management Token Full Length:", managementToken?.length || 0);
  console.log("🔑 Stack API Key:", stackApiKey);
  console.log("🌍 API Base URL:", CONTENTSTACK_API_BASE_URL);

  // Fetch available locales from stack using proper app-sdk method
  useEffect(() => {
    const fetchStackLocales = async () => {
      try {
        if (!appSDK?.stack?.getLocales) {
          console.warn("⚠️ getLocales method not available");
          return;
        }

        // Use the official app-sdk method to get locales
        // Returns: { locales: Array<{code, name, fallback_locale, ...}> }
        const localesData = await appSDK.stack.getLocales();
        console.log("📍 Stack Locales from getLocales():", localesData);
        
        // Access the locales array from the returned object
        const localesArray = (localesData as any)?.locales;
        
        if (localesArray && Array.isArray(localesArray)) {
          const locales = localesArray.map((locale: any) => {
            const localeCode = locale.code;
            const localeName = locale.name; // Use the name from stack
            const displayInfo = getLocaleDisplayInfo(localeCode);
            
            return {
              code: localeCode,
              name: localeName || displayInfo.name, // Prefer stack name, fallback to our mapping
              flag: displayInfo.flag,
              selected: false // Default to not selected
            };
          });
          
          console.log("✅ Processed locales:", locales);
          setAvailableLocales(locales);
        } else {
          console.warn("⚠️ Invalid locales data format");
        }
      } catch (error) {
        console.error("❌ Error fetching stack locales:", error);
        // Fallback to common locales if API fails
        setAvailableLocales([
          { code: "en-us", name: "English (US)", flag: "🇺🇸", selected: false },
          { code: "fr-fr", name: "French (France)", flag: "🇫🇷", selected: false },
        ]);
      }
    };

    if (appSDK?.stack) {
      fetchStackLocales();
    }
  }, [appSDK]);

  // Helper function to toggle locale selection
  const toggleLocale = (localeCode: string) => {
    setAvailableLocales((prev) =>
      prev.map((loc) =>
        loc.code === localeCode ? { ...loc, selected: !loc.selected } : loc
      )
    );
  };

  // Get entry data and content type schema on mount
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
        
        // Get locale from entry.locale (e.g., "en-us")
        const localeCode = (entry as any).locale || "en";
        setCurrentLocale(localeCode);
        
        // Get display name for current locale
        const displayInfo = getLocaleDisplayInfo(localeCode);
        setCurrentLocaleDisplay(displayInfo.name);
        
        console.log("🌍 Current Entry Locale:", localeCode, "->", displayInfo.name);
        
        const contentType = (entry as any).content_type;
        
        if (contentType && contentType.schema) {
          const TRANSLATABLE_DATA_TYPES = [
            "text",           // Single line text
            "multi_line",     // Multi line text
            "markdown",       // Markdown
            "html",           // HTML RTE
            "json",           // JSON RTE / Custom field
          ];
          
          const SYSTEM_FIELDS = [
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
            "_in_progress"
          ];
          
          const extractTranslatableFields = (
            schema: any[], 
            parentPath: string = "", 
            parentDisplayName: string = ""
          ): FieldInfo[] => {
            const fields: FieldInfo[] = [];
            
            for (const field of schema) {
              if (SYSTEM_FIELDS.includes(field.uid)) {
                continue;
              }
              
              const currentPath = parentPath ? `${parentPath}.${field.uid}` : field.uid;
              const currentDisplayName = parentDisplayName 
                ? `${parentDisplayName} > ${field.display_name || field.uid}`
                : field.display_name || field.uid;
              
              if (TRANSLATABLE_DATA_TYPES.includes(field.data_type)) {
                fields.push({
                  uid: field.uid,
                  displayName: currentDisplayName,
                  dataType: field.data_type,
                  selected: ["title", "description", "body", "content", "text"].some((f) => 
                    field.uid.toLowerCase().includes(f)
                  ),
                  parentPath: parentPath || undefined,
                  isNested: !!parentPath,
                });
              }
              
              if (field.data_type === "global_field" && field.schema) {
                const nestedFields = extractTranslatableFields(
                  field.schema,
                  currentPath,
                  currentDisplayName
                );
                fields.push(...nestedFields);
              }
              
              // Handle Modular Blocks
              if (field.data_type === "blocks" && field.blocks) {
                for (const block of field.blocks) {
                  if (block.schema) {
                    const blockDisplayName = `${currentDisplayName} > ${block.title || block.uid}`;
                    const nestedFields = extractTranslatableFields(
                      block.schema,
                      `${currentPath}.[blocks]`,
                      blockDisplayName
                    );
                    fields.push(...nestedFields);
                  }
                }
              }
              
              // Handle Group fields
              if (field.data_type === "group" && field.schema) {
                const nestedFields = extractTranslatableFields(
                  field.schema,
                  currentPath,
                  currentDisplayName
                );
                fields.push(...nestedFields);
              }
            }
            
            return fields;
          };
          
          const translatableFields = extractTranslatableFields(contentType.schema);
          
          console.log("✅ Loaded translatable fields from schema (including nested):", translatableFields);
          setAvailableFields(translatableFields);
        } else {
          console.warn("⚠️ Could not access content type schema, using fallback method");
          if (data) {
            const fields: FieldInfo[] = Object.keys(data)
              .filter((key) => {
                const value = data[key];
                return typeof value === "string" && value.length > 0;
              })
              .map((key) => ({
                uid: key,
                displayName: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
                dataType: "text",
                selected: ["title", "description", "body", "content"].some((f) => key.toLowerCase().includes(f)),
              }));
            setAvailableFields(fields);
          }
        }
      } catch (error) {
        console.error("Error loading entry data and schema:", error);
        setError("Failed to load entry data");
      }
    };
    
    loadEntryAndSchema();
  }, [appSDK]);

  const callGeminiAPI = async (prompt: string, systemInstruction?: string, useSearch: boolean = false) => {
    if (!apiKey) {
      throw new Error("API key not configured");
    }

    const payload: any = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    if (useSearch) {
      payload.tools = [{ google_search: {} }];
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

    for (let i = 0; i < 3; i++) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
          throw new Error("Empty response from Gemini");
        }

        return text;
      } catch (error: any) {
        if (i === 2) {
          throw error;
        }
        const delay = Math.pow(2, i) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  // AI Quality Check Feature
  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResult("");
    setError("");

    try {
      const textFields = availableFields
        .filter((f) => f.selected && entryData[f.uid])
        .map((f) => `${f.displayName}: ${JSON.stringify(entryData[f.uid])}`)
        .join("\n");

      if (!textFields) {
        throw new Error("No content to analyze. Please select fields.");
      }

      const prompt = `Analyze the tone, complexity, and SEO readability of this content for a B2B audience. Provide specific suggestions for improvement.\n\nContent:\n${textFields}`;

      const systemInstruction =
        "You are a Chief Editor for a B2B publication. Provide analysis in bullet points with concrete suggestions. Be concise.";

      const result = await callGeminiAPI(prompt, systemInstruction, true);
      setAnalysisResult(result);
    } catch (err: any) {
      setError(`AI Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // AI Tone Refinement Feature
  const runAIToneRefinement = async () => {
    setIsRefining(true);
    setRefinementResult("");
    setError("");

    try {
      const selectedField = availableFields.find((f) => f.selected);
      if (!selectedField || !entryData[selectedField.uid]) {
        throw new Error("Please select a field to refine");
      }

      const originalText = entryData[selectedField.uid];
      const toneMap: any = {
        professional: "Professional / Formal",
        casual: "Casual / Friendly",
        academic: "Academic / Technical",
      };

      const prompt = `Rewrite the following text to have a ${toneMap[selectedTone]} tone. Keep it concise and in the same language.\n\nOriginal: ${originalText}`;

      const systemInstruction = `You are an expert copywriter. Return only the revised text, nothing else.`;

      const result = await callGeminiAPI(prompt, systemInstruction);
      setRefinementResult(result);
    } catch (err: any) {
      setError(`AI Refinement failed: ${err.message}`);
    } finally {
      setIsRefining(false);
    }
  };

  // Translate field using Gemini
  const translateField = async (text: string, targetLang: string): Promise<string> => {
    if (!text) {
      return text;
    }

    const langName = availableLocales.find((l: any) => l.code === targetLang)?.name || targetLang;
    
    const prompt = `You are a professional translator. Translate the following text from English to ${langName}. 
    
IMPORTANT: You must translate ALL text, including short phrases, technical terms, and test content. Even if it looks like a proper noun or code, provide the ${langName} translation.

Text to translate: "${text}"

Respond with ONLY the ${langName} translation, nothing else.`;

    try {
      const systemInstruction = `You are a professional translator specializing in accurate translations. Always translate all content, even if it appears to be technical terms, proper nouns, or test data. Provide natural-sounding translations in the target language.`;
      
      const translated = await callGeminiAPI(prompt, systemInstruction);
      const cleanedTranslation = translated.trim().replace(/^["']|["']$/g, '');
      
      return cleanedTranslation;
    } catch (err) {
      return text;
    }
  };


  // Update localized entry with translated fields
  const updateLocalizedEntry = async (
    entryUid: string, 
    contentTypeUid: string, 
    targetLocale: string, 
    translatedFields: any
  ): Promise<boolean> => {
    try {
      const url = `${CONTENTSTACK_API_BASE_URL}/v3/content_types/${contentTypeUid}/entries/${entryUid}?locale=${targetLocale}`;
      
      // Log full request details for debugging
      console.log(`\n🔗 === UPDATE ENTRY REQUEST ===`);
      console.log(`URL: ${url}`);
      console.log(`Method: PUT`);
      console.log(`Headers:`, {
        'api_key': stackApiKey,
        'authorization': managementToken ? `${managementToken.substring(0, 20)}...${managementToken.substring(managementToken.length - 5)}` : 'MISSING',
        'Content-Type': 'application/json'
      });
      console.log(`Token Full Length: ${managementToken?.length || 0} chars (expected 40+)`);
      console.log(`Token Starts With: ${managementToken?.substring(0, 3) || 'N/A'} (should be 'cs')`);
      console.log(`Body:`, JSON.stringify({ entry: translatedFields }, null, 2));
      console.log(`=== END REQUEST ===\n`);
      
      const requestHeaders = {
        'api_key': stackApiKey,
        'authorization': managementToken,
        'Content-Type': 'application/json'
      };
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: requestHeaders,
        body: JSON.stringify({
          entry: translatedFields
        })
      });

      console.log(`📊 Update response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            console.error(`❌ Update Error (JSON):`, error);
            errorMessage = error.error_message || error.message || JSON.stringify(error);
          } else {
            const textError = await response.text();
            console.error(`❌ Update Error (Text):`, textError.substring(0, 500));
            errorMessage = textError.substring(0, 200);
          }
        } catch (parseError) {
          console.error(`❌ Could not parse update error response:`, parseError);
        }
        
        console.error(`Failed to update localized entry in ${targetLocale}: ${errorMessage}`);
        return false;
      }

      console.log(`✅ Entry updated in ${targetLocale}`);
      return true;
    } catch (error) {
      console.error(`❌ Error updating localized entry:`, error);
      return false;
    }
  };

  const getNestedValue = (data: any, path: string, fieldUid: string): any => {
    if (!path) {
      return data[fieldUid];
    }
    
    const pathParts = path.split('.');
    let current = data;
    
    for (const part of pathParts) {
      if (part === '[blocks]') {
        continue;
      }
      if (current && typeof current === 'object') {
        current = current[part];
      } else {
        return null;
      }
    }
    
    if (current && typeof current === 'object') {
      return current[fieldUid];
    }
    
    return null;
  };

  const updateNestedField = async (field: FieldInfo, translatedValue: string) => {
    const entry = appSDK?.location?.SidebarWidget?.entry;
    if (!entry) return false;

    try {
      if (!field.parentPath) {
        // Top-level field
        const fieldObj = entry.getField(field.uid);
        if (fieldObj && fieldObj.setData) {
          await fieldObj.setData(translatedValue);
          return true;
        }
      } else {
        const pathParts = field.parentPath.split('.');
        const isModularBlock = field.parentPath.includes('[blocks]');
        
        if (isModularBlock) {
          const blockFieldUid = pathParts[0];
          const blockFieldObj = entry.getField(blockFieldUid);
          
          if (blockFieldObj) {
            const blocksData = entryData[blockFieldUid];
            
            if (Array.isArray(blocksData)) {
              const updatedBlocks = blocksData.map((block: any) => {
                if (block && typeof block === 'object' && field.uid in block) {
                  return {
                    ...block,
                    [field.uid]: translatedValue
                  };
                }
                return block;
              });
              
              await blockFieldObj.setData(updatedBlocks);
              return true;
            }
          }
        } else {
          const topLevelFieldUid = pathParts[0];
          const topLevelFieldObj = entry.getField(topLevelFieldUid);
          
          if (topLevelFieldObj) {
            const currentData = entryData[topLevelFieldUid];
            
            if (currentData && typeof currentData === 'object') {
              const updateNestedData = (data: any, parts: string[], fieldUid: string, value: string): any => {
                if (parts.length === 0) {
                  return { ...data, [fieldUid]: value };
                }
                
                const [current, ...rest] = parts;
                if (data && typeof data === 'object' && current in data) {
                  return {
                    ...data,
                    [current]: updateNestedData(data[current], rest, fieldUid, value)
                  };
                }
                
                return data;
              };
              
              const remainingParts = pathParts.slice(1);
              const updatedData = updateNestedData(currentData, remainingParts, field.uid, translatedValue);
              
              await topLevelFieldObj.setData(updatedData);
              return true;
            }
          }
        }
      }
    } catch (error) {
      console.error(`Failed to update nested field:`, error);
      return false;
    }
    
    return false;
  };

  const startTranslation = async () => {
    if (!apiKey) {
      setError("⚠️ API key not configured. Please go to Settings → Apps → Polyglot Pro → Configure.");
      return;
    }

    if (!managementToken) {
      setError("⚠️ Management Token not configured. Required for automatic entry localization.");
      return;
    }

    const selectedLocales = availableLocales.filter((loc) => loc.selected);
    if (selectedLocales.length === 0) {
      setError("Please select at least one target language");
      return;
    }

    const selectedFields = availableFields.filter((f) => f.selected);
    if (selectedFields.length === 0) {
      setError("Please select at least one field to translate");
      return;
    }

    setIsTranslating(true);
    setError("");

    const entry = appSDK?.location?.SidebarWidget?.entry._data;
    const entryUid = (entry as any)?.uid;
    const contentTypeUid = appSDK?.location?.SidebarWidget?.entry?.content_type?.uid;
    console.log("🔑 Entry UID:", entryUid);
    console.log("🔑 Content Type UID:", contentTypeUid);
    console.log("🔑 Entry:", entry);

    if (!entryUid || !contentTypeUid) {
      setError("Unable to get entry information");
      setIsTranslating(false);
      return;
    }

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
        
        console.log(`\n🌍 Processing locale: ${targetLocale.name} (${targetLocale.code})`);
        
        // Step 1: Translate all selected fields
        const translatedFields: any = {};
        
        for (let fieldIndex = 0; fieldIndex < selectedFields.length; fieldIndex++) {
          const field = selectedFields[fieldIndex];
          const originalValue = getNestedValue(entryData, field.parentPath || "", field.uid);

          if (typeof originalValue === "string" && originalValue.trim().length > 0) {
            console.log(`  Translating field "${field.uid}" to ${targetLocale.code}...`);
            const translatedValue = await translateField(originalValue, targetLocale.code);
            
            // Build the translated fields object (only top-level fields for now)
            if (!field.parentPath) {
              translatedFields[field.uid] = translatedValue;
            } else {
              // For nested fields, store with full path for now
              translatedFields[field.uid] = translatedValue;
            }
            
            console.log(`  ✅ Translated: "${originalValue.substring(0, 50)}..." → "${translatedValue.substring(0, 50)}..."`);
          }

          // Update progress
          const fieldProgress = ((fieldIndex + 1) / selectedFields.length) * 100;
          const overallProgress = ((localeIndex * 100) + fieldProgress) / selectedLocales.length;
          
          setTranslationStatuses((prev) =>
            prev.map((s) =>
              s.code === targetLocale.code
                ? { ...s, progress: Math.round(overallProgress) }
                : s
            )
          );
        }

        // Step 2: Save translated fields (creates localized entry if it doesn't exist)
        console.log(`💾 Saving translated fields to ${targetLocale.code}...`);
        const updated = await updateLocalizedEntry(
          entryUid,
          contentTypeUid,
          targetLocale.code,
          translatedFields
        );

        // Update final status
        setTranslationStatuses((prev) =>
          prev.map((s) =>
            s.code === targetLocale.code
              ? { ...s, status: updated ? "complete" : "error", progress: updated ? 100 : 0 }
              : s
          )
        );

        console.log(`${updated ? "✅ Success" : "❌ Failed"}: ${targetLocale.name}\n`);
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
      setError(`Translation failed: ${err.message}`);
      setTranslationStatuses((prev) => prev.map((s) => ({ ...s, status: "error", progress: 0 })));
    } finally {
      setIsTranslating(false);
    }
  };

  const toggleField = (uid: string, parentPath?: string) => {
    setAvailableFields((prev) =>
      prev.map((f) => {
        const matches = f.uid === uid && (f.parentPath || '') === (parentPath || '');
        return matches ? { ...f, selected: !f.selected } : f;
      })
    );
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "complete":
        return { text: "Complete", bg: "bg-green-100", color: "text-green-700", icon: "✅" };
      case "in_progress":
        return { text: "Processing", bg: "bg-yellow-100", color: "text-yellow-700", icon: "⏳" };
      case "incomplete":
        return { text: "Not Started", bg: "bg-gray-100", color: "text-gray-600", icon: "⚪" };
      case "error":
        return { text: "Error", bg: "bg-red-100", color: "text-red-700", icon: "❌" };
      default:
        return { text: "Unknown", bg: "bg-gray-100", color: "text-gray-600", icon: "?" };
    }
  };

  return (
    <div className="layout-container" style={{ padding: "0", margin: "0", fontFamily: "Inter, sans-serif", height: "100%", overflow: "auto" }}>
      <div style={{ padding: "16px", backgroundColor: "#f7f9fb" }}>
        {/* Header */}
        <div style={{ backgroundColor: "#fff", borderRadius: "12px", overflow: "hidden", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 style={{ fontSize: "18px", fontWeight: "700", margin: "0" }}>
              <span style={{ color: "#6366f1" }}>Polyglot</span> Pro
            </h1>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280", backgroundColor: "#e5e7eb", padding: "4px 12px", borderRadius: "9999px" }}>
                Base: {currentLocaleDisplay}
              </span>
              <span style={{ fontSize: "11px", fontWeight: "600", color: apiKey ? "#059669" : "#dc2626", backgroundColor: apiKey ? "#d1fae5" : "#fee2e2", padding: "4px 8px", borderRadius: "9999px" }}>
                {apiKey ? "✓ API" : "✗ No API"}
              </span>
            </div>
          </div>

          {/* Configuration Warning */}
          {(!apiKey || !managementToken) && (
            <div style={{ padding: "12px 16px", backgroundColor: "#fef2f2", borderBottom: "1px solid #fecaca" }}>
              <p style={{ fontSize: "12px", color: "#991b1b", margin: "0", lineHeight: "1.5" }}>
                <strong>⚠️ Configuration Required:</strong> Go to{" "}
                <strong>Settings → Apps → Polyglot Pro → Configure</strong> to add:
                {!apiKey && " Gemini API key"}
                {!apiKey && !managementToken && " and"}
                {!managementToken && " Management Token"}
              </p>
            </div>
          )}

          {/* Translation Status Dashboard */}
          {translationStatuses.length > 0 && (
            <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb" }}>
              <h2 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "12px", marginTop: "0" }}>
                Translation Status
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {translationStatuses.map((status) => {
                  const styles = getStatusStyles(status.status);
                  return (
                    <div key={status.code}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                        <div style={{ fontWeight: "500", color: "#111827" }}>{status.name} ({status.code.toUpperCase()})</div>
                        <div style={{ fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "9999px" }} className={`${styles.bg} ${styles.color}`}>
                          {styles.icon} {styles.text} {status.status === "in_progress" && `(${status.progress}%)`}
                        </div>
                      </div>
                      {status.status === "in_progress" && (
                        <div style={{ width: "100%", backgroundColor: "#e5e7eb", borderRadius: "9999px", height: "6px", marginTop: "4px" }}>
                          <div style={{ width: `${status.progress}%`, backgroundColor: "#6366f1", height: "6px", borderRadius: "9999px", transition: "width 0.3s" }}></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Quality Check */}
          <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb", backgroundColor: "#fef3c7" }}>
            <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#374151", marginBottom: "8px", marginTop: "0" }}>
              ✨ AI Quality Check (Base: {currentLocaleDisplay})
            </h2>
            <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "12px" }}>
              Analyze source content for tone, clarity, and SEO readiness before translating.
            </p>
            <button
              onClick={runAIAnalysis}
              disabled={isAnalyzing || !apiKey}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: isAnalyzing || !apiKey ? "#d1d5db" : "#eab308",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: isAnalyzing || !apiKey ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isAnalyzing ? "Analyzing..." : "Run AI Quality Check"}
            </button>
            {analysisResult && (
              <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "#fff", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "12px", whiteSpace: "pre-wrap" }}>
                {analysisResult}
              </div>
            )}
          </div>

          {/* AI Tone Refinement */}
          <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb", backgroundColor: "#dbeafe" }}>
            <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#374151", marginBottom: "8px", marginTop: "0" }}>
              ✨ AI Tone Refinement
            </h2>
            <select
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", marginBottom: "12px" }}
            >
              <option value="professional">Professional / Formal</option>
              <option value="casual">Casual / Friendly</option>
              <option value="academic">Academic / Technical</option>
            </select>
            <button
              onClick={runAIToneRefinement}
              disabled={isRefining || !apiKey}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: isRefining || !apiKey ? "#d1d5db" : "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: isRefining || !apiKey ? "not-allowed" : "pointer",
              }}
            >
              {isRefining ? "Refining..." : "Refine Selected Field"}
            </button>
            {refinementResult && (
              <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "#fff", border: "1px solid #bfdbfe", borderRadius: "8px", fontSize: "12px" }}>
                <strong>Refined Text:</strong>
                <div style={{ marginTop: "8px", color: "#1e40af" }}>{refinementResult}</div>
              </div>
            )}
          </div>

          {/* Target Languages Selection */}
          <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb" }}>
            <h2 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "12px", marginTop: "0" }}>
              🌍 Select Target Languages ({availableLocales.filter((l) => l.selected).length} selected)
            </h2>
            <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: "8px", backgroundColor: "#f9fafb" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {availableLocales.map((locale, index) => (
                  <div
                    key={locale.code}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "10px 12px",
                      borderBottom: index < availableLocales.length - 1 ? "1px solid #e5e7eb" : "none",
                      backgroundColor: locale.code === currentLocale ? "#f3f4f6" : "#fff",
                      cursor: locale.code === currentLocale ? "not-allowed" : "pointer",
                      opacity: locale.code === currentLocale ? 0.6 : 1,
                      transition: "background-color 0.2s"
                    }}
                    onClick={() => locale.code !== currentLocale && toggleLocale(locale.code)}
                    onMouseEnter={(e) => locale.code !== currentLocale && (e.currentTarget.style.backgroundColor = "#f9fafb")}
                    onMouseLeave={(e) => locale.code !== currentLocale && (e.currentTarget.style.backgroundColor = locale.code === currentLocale ? "#f3f4f6" : "#fff")}
                  >
                    <input
                      type="checkbox"
                      checked={locale.selected}
                      disabled={locale.code === currentLocale}
                      onChange={() => toggleLocale(locale.code)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ 
                        width: "16px", 
                        height: "16px", 
                        cursor: locale.code === currentLocale ? "not-allowed" : "pointer", 
                        marginRight: "10px",
                        flexShrink: 0
                      }}
                    />
                    <span style={{ fontSize: "16px", marginRight: "8px" }}>{locale.flag}</span>
                    <span style={{ fontSize: "14px", fontWeight: "500", color: "#111827", flex: 1 }}>
                      {locale.name}
                    </span>
                    {locale.code === currentLocale && (
                      <span style={{
                        fontSize: "10px",
                        fontWeight: "600",
                        color: "#6b7280",
                        backgroundColor: "#e5e7eb",
                        padding: "2px 8px",
                        borderRadius: "9999px"
                      }}>
                        CURRENT
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {availableLocales.length === 0 && (
              <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "8px", marginBottom: "0" }}>
                Loading available locales from stack...
              </p>
            )}
          </div>

          {/* Fields Selection */}
          <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb" }}>
            <h2 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "12px", marginTop: "0" }}>
              📝 Fields to Translate ({availableFields.filter((f) => f.selected).length} selected)
            </h2>
            <div style={{ maxHeight: "250px", overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: "8px", backgroundColor: "#f9fafb" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {availableFields.map((field, index) => {
                 
                  const nestingLevel = field.parentPath ? field.parentPath.split('.').length : 0;
                  const indent = nestingLevel * 20;
                  
                  let icon = "📄";
                  if (field.parentPath) {
                    if (field.parentPath.includes('[blocks]')) {
                      icon = "📦"; 
                    } else if (field.parentPath.includes('global')) {
                      icon = "🔗"; 
                    } else {
                      icon = "📁"; 
                    }
                  }
                  
                  return (
                    <div 
                      key={`${field.parentPath || 'root'}-${field.uid}-${index}`} 
                      style={{ 
                        display: "flex", 
                        alignItems: "flex-start", 
                        padding: "10px 12px",
                        borderBottom: index < availableFields.length - 1 ? "1px solid #e5e7eb" : "none",
                        backgroundColor: field.isNested ? "#fefce8" : "#fff",
                        marginLeft: `${indent}px`,
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = field.isNested ? "#fef3c7" : "#f9fafb"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = field.isNested ? "#fefce8" : "#fff"}
                    >
                      <input
                        type="checkbox"
                        id={`field-${field.parentPath || 'root'}-${field.uid}-${index}`}
                        checked={field.selected}
                        onChange={() => toggleField(field.uid, field.parentPath)}
                        style={{ width: "16px", height: "16px", cursor: "pointer", marginTop: "2px", flexShrink: 0 }}
                      />
                      <label 
                        htmlFor={`field-${field.parentPath || 'root'}-${field.uid}-${index}`}
                        style={{ 
                          marginLeft: "10px", 
                          flex: 1, 
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "14px" }}>{icon}</span>
                          <span style={{ fontSize: "13px", fontWeight: field.isNested ? "500" : "600", color: "#111827" }}>
                            {field.displayName}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ 
                            fontSize: "10px", 
                            fontFamily: "monospace", 
                            padding: "2px 6px", 
                            backgroundColor: field.isNested ? "#fde047" : "#e5e7eb", 
                            borderRadius: "4px",
                            color: "#374151"
                          }}>
                            {field.uid}
                          </span>
                          <span style={{ 
                            fontSize: "10px", 
                            color: "#6b7280",
                            padding: "2px 6px",
                            backgroundColor: "#f3f4f6",
                            borderRadius: "4px"
                          }}>
                            {field.dataType}
                          </span>
                          {field.isNested && (
                            <span style={{ 
                              fontSize: "10px", 
                              color: "#92400e",
                              padding: "2px 6px",
                              backgroundColor: "#fef3c7",
                              borderRadius: "4px",
                              fontWeight: "600"
                            }}>
                              NESTED
                            </span>
                          )}
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
            {availableFields.length === 0 && (
              <p style={{ fontSize: "12px", color: "#6b7280", textAlign: "center", padding: "20px", margin: "0" }}>
                No translatable fields found in this content type.
              </p>
            )}
          </div>

          {/* Action Button */}
          <div style={{ padding: "16px" }}>
            <button
              onClick={startTranslation}
              disabled={isTranslating || !apiKey}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: isTranslating || !apiKey ? "#d1d5db" : "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: isTranslating || !apiKey ? "not-allowed" : "pointer",
                transition: "background-color 0.2s",
              }}
            >
              {isTranslating ? "Translating..." : "Start Translation"}
            </button>

            {/* Error/Status Message */}
            {error && (
              <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "#fee", border: "1px solid #fcc", borderRadius: "8px", color: "#c33", fontSize: "13px" }}>
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntrySidebarExtension;
