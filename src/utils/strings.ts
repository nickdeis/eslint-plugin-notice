/**
 * Copyright (c) 2024, Nick Deis
 */

/**
 * Convert all the line endings in a string to a specific format.
 *
 * @param str - The string to convert.
 * @param mode - The line ending mode to convert to. Defaults to `lf`.
 *
 * @returns The original string, with all the line endings converted.
 *
 * @author daymxn
 */
export function normalizeLineEndings(str: string, mode: "crlf" | "lf" = "lf") {
  return mode === "lf" ? str.replaceAll(/\r\n/g, "\n") : str.replaceAll(/\n/g, "\r\n");
}
