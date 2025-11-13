/**
 * API utilities for translation operations
 */

import { GeminiPayload, TranslationConfig, LocaleInfo } from "./types";

/**
 * Call Gemini API with retry logic
 */
export async function callGeminiAPI(
  prompt: string,
  apiKey: string,
  selectedModel: string,
  systemInstruction?: string,
  useSearch: boolean = false
): Promise<string> {
  if (!apiKey) {
    throw new Error("API key not configured");
  }

  const payload: GeminiPayload = {
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

  // Retry logic (3 attempts)
  for (let attempt = 0; attempt < 3; attempt++) {
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
      if (attempt === 2) {
        throw error;
      }
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Failed after 3 attempts");
}

/**
 * Translate text using Gemini AI
 */
export async function translateText(
  text: string,
  targetLocale: LocaleInfo,
  config: TranslationConfig
): Promise<string> {
  if (!text) {
    return text;
  }

  const prompt = `You are a professional translator. Translate the following text from English to ${targetLocale.name}. 
    
IMPORTANT: You must translate ALL text, including short phrases, technical terms, and test content. Even if it looks like a proper noun or code, provide the ${targetLocale.name} translation.

Text to translate: "${text}"

Respond with ONLY the ${targetLocale.name} translation, nothing else.`;

  const systemInstruction = `You are a professional translator specializing in accurate translations. Always translate all content, even if it appears to be technical terms, proper nouns, or test data. Provide natural-sounding translations in the target language.`;

  const translated = await callGeminiAPI(
    prompt,
    config.apiKey,
    config.selectedModel,
    systemInstruction
  );

  // Clean up the translation
  return translated.trim().replace(/^["']|["']$/g, "");
}

/**
 * Update localized entry in Contentstack
 */
export async function updateLocalizedEntry(
  entryUid: string,
  contentTypeUid: string,
  targetLocale: string,
  translatedFields: Record<string, any>,
  config: TranslationConfig
): Promise<boolean> {
  try {
    const url = `${config.apiBaseUrl}/v3/content_types/${contentTypeUid}/entries/${entryUid}?locale=${targetLocale}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        api_key: config.stackApiKey,
        authorization: config.managementToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        entry: translatedFields,
      }),
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        if (contentType && contentType.includes("application/json")) {
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
    return true;
  } catch (error) {
    console.error(`❌ Error updating localized entry:`, error);
    return false;
  }
}

/**
 * Run AI quality analysis on content
 */
export async function analyzeContentQuality(
  content: string,
  config: TranslationConfig
): Promise<string> {
  const prompt = `Analyze the tone, complexity, and SEO readability of this content for a B2B audience. Provide specific suggestions for improvement.\n\nContent:\n${content}`;

  const systemInstruction =
    "You are a Chief Editor for a B2B publication. Provide analysis in bullet points with concrete suggestions. Be concise.";

  return await callGeminiAPI(prompt, config.apiKey, config.selectedModel, systemInstruction, true);
}

/**
 * Refine content tone using AI
 */
export async function refineContentTone(
  text: string,
  tone: string,
  config: TranslationConfig
): Promise<string> {
  const prompt = `Rewrite the following text to have a ${tone} tone. Keep it concise and in the same language.\n\nOriginal: ${text}`;

  const systemInstruction = `You are an expert copywriter. Return only the revised text, nothing else.`;

  return await callGeminiAPI(prompt, config.apiKey, config.selectedModel, systemInstruction);
}

