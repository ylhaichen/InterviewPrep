import { parseJsonArray, parseJsonObject } from "@/lib/utils/json";

export function parseStringArray(value: string | null): string[] {
  return parseJsonArray(value ?? "[]");
}

export function parseUnknownObject<T extends object>(value: string | null, fallback: T): T {
  return parseJsonObject<T>(value ?? "{}", fallback);
}
