/**
 * Helper utilities for field extraction and nested field handling
 */

import { FieldInfo, LocaleDisplayInfo } from "./types";
import {
  LOCALE_DISPLAY_NAMES,
  TRANSLATABLE_DATA_TYPES,
  SYSTEM_FIELDS,
  COMMON_TRANSLATABLE_FIELDS,
} from "./constants";

/**
 * Get locale display information from locale code
 */
export function getLocaleDisplayInfo(localeCode: string): LocaleDisplayInfo {
  const normalizedCode = localeCode.toLowerCase();

  // Try exact match first
  if (LOCALE_DISPLAY_NAMES[normalizedCode]) {
    return LOCALE_DISPLAY_NAMES[normalizedCode];
  }

  // Try base language code (e.g., "en-au" -> "en")
  const baseCode = normalizedCode.split("-")[0];
  if (LOCALE_DISPLAY_NAMES[baseCode]) {
    return LOCALE_DISPLAY_NAMES[baseCode];
  }

  // Fallback: format the locale code nicely
  return {
    name: localeCode.toUpperCase().replace("-", " - "),
    flag: "🌐",
  };
}

/**
 * Extract translatable fields from content type schema
 */
export function extractTranslatableFields(
  schema: any[],
  parentPath: string = "",
  parentDisplayName: string = ""
): FieldInfo[] {
  const fields: FieldInfo[] = [];

  for (const field of schema) {
    // Skip system fields
    if (SYSTEM_FIELDS.includes(field.uid as any)) {
      continue;
    }

    const currentPath = parentPath ? `${parentPath}.${field.uid}` : field.uid;
    const currentDisplayName = parentDisplayName
      ? `${parentDisplayName} > ${field.display_name || field.uid}`
      : field.display_name || field.uid;

    // Check if field is translatable
    if (TRANSLATABLE_DATA_TYPES.includes(field.data_type as any)) {
      fields.push({
        uid: field.uid,
        displayName: currentDisplayName,
        dataType: field.data_type,
        selected: isCommonTranslatableField(field.uid),
        parentPath: parentPath || undefined,
        isNested: !!parentPath,
      });
    }

    // Handle Global Field
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
}

/**
 * Check if a field is a common translatable field
 */
function isCommonTranslatableField(fieldUid: string): boolean {
  const lowerUid = fieldUid.toLowerCase();
  return COMMON_TRANSLATABLE_FIELDS.some((commonField) => lowerUid.includes(commonField));
}

/**
 * Get value from nested field path
 */
export function getNestedValue(data: any, path: string, fieldUid: string): any {
  if (!path) {
    return data[fieldUid];
  }

  const pathParts = path.split(".");
  let current = data;

  for (const part of pathParts) {
    if (part === "[blocks]") {
      continue;
    }
    if (current && typeof current === "object") {
      current = current[part];
    } else {
      return null;
    }
  }

  if (current && typeof current === "object") {
    return current[fieldUid];
  }

  return null;
}

/**
 * Update nested field data
 */
export async function updateNestedField(
  field: FieldInfo,
  translatedValue: string,
  entryData: any,
  entry: any
): Promise<boolean> {
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
      const pathParts = field.parentPath.split(".");
      const isModularBlock = field.parentPath.includes("[blocks]");

      if (isModularBlock) {
        return await updateModularBlockField(field, translatedValue, entryData, entry, pathParts);
      } else {
        return await updateGroupField(field, translatedValue, entryData, entry, pathParts);
      }
    }
  } catch (error) {
    console.error(`Failed to update nested field:`, error);
    return false;
  }

  return false;
}

/**
 * Update field in modular block
 */
async function updateModularBlockField(
  field: FieldInfo,
  translatedValue: string,
  entryData: any,
  entry: any,
  pathParts: string[]
): Promise<boolean> {
  const blockFieldUid = pathParts[0];
  const blockFieldObj = entry.getField(blockFieldUid);

  if (blockFieldObj) {
    const blocksData = entryData[blockFieldUid];

    if (Array.isArray(blocksData)) {
      const updatedBlocks = blocksData.map((block: any) => {
        if (block && typeof block === "object" && field.uid in block) {
          return {
            ...block,
            [field.uid]: translatedValue,
          };
        }
        return block;
      });

      await blockFieldObj.setData(updatedBlocks);
      return true;
    }
  }

  return false;
}

/**
 * Update field in group
 */
async function updateGroupField(
  field: FieldInfo,
  translatedValue: string,
  entryData: any,
  entry: any,
  pathParts: string[]
): Promise<boolean> {
  const topLevelFieldUid = pathParts[0];
  const topLevelFieldObj = entry.getField(topLevelFieldUid);

  if (topLevelFieldObj) {
    const currentData = entryData[topLevelFieldUid];

    if (currentData && typeof currentData === "object") {
      const remainingParts = pathParts.slice(1);
      const updatedData = updateNestedData(currentData, remainingParts, field.uid, translatedValue);

      await topLevelFieldObj.setData(updatedData);
      return true;
    }
  }

  return false;
}

/**
 * Recursively update nested data
 */
function updateNestedData(
  data: any,
  parts: string[],
  fieldUid: string,
  value: string
): any {
  if (parts.length === 0) {
    return { ...data, [fieldUid]: value };
  }

  const [current, ...rest] = parts;
  if (data && typeof data === "object" && current in data) {
    return {
      ...data,
      [current]: updateNestedData(data[current], rest, fieldUid, value),
    };
  }

  return data;
}

/**
 * Extract fallback fields from entry data when schema is unavailable
 */
export function extractFallbackFields(data: any): FieldInfo[] {
  return Object.keys(data)
    .filter((key) => {
      const value = data[key];
      return typeof value === "string" && value.length > 0;
    })
    .map((key) => ({
      uid: key,
      displayName: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      dataType: "text",
      selected: isCommonTranslatableField(key),
    }));
}

/**
 * Get icon for field type
 */
export function getFieldIcon(field: FieldInfo): string {
  if (!field.parentPath) {
    return "📄";
  }

  if (field.parentPath.includes("[blocks]")) {
    return "📦";
  }

  if (field.parentPath.includes("global")) {
    return "🔗";
  }

  return "📁";
}

/**
 * Calculate nesting level for field
 */
export function getFieldNestingLevel(field: FieldInfo): number {
  return field.parentPath ? field.parentPath.split(".").length : 0;
}

