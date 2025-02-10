/**
 * Copyright (c) 2024, Nick Deis
 */

import { readFileSync } from "fs";

/**
 * Cast an error to a NodeJS error.
 *
 * @remarks
 * Works around the fact that NodeJS errors are not properly typed against the
 * global `Error` type, and for catches that use `unknown` instead of `any`.
 *
 * If the specified `value` is _not_ an {@link Error}, then the cast fails.
 *
 * @param value - The error to check against.
 *
 * @author daymxn
 */
export function instanceOfNodeError(value: unknown): value is NodeJS.ErrnoException {
  return value instanceof Error;
}

/**
 * Safe version of {@link readFileSync} that catches non existent files.
 *
 * @remarks
 * We use this instead of `existsSync` as to avoid any race conditions.
 *
 * @param path - A path to a file to read from.
 *
 * @returns The contents of the file, decoded to a string.
 *
 * @author daymxn
 */
export function readFileSafe(path: string): string | undefined {
  try {
    return readFileSync(path, "utf8");
  } catch (e) {
    if (instanceOfNodeError(e) && e.code === "ENOENT") return undefined;

    throw new Error(`Failed to read file at path: ${path}`, {
      cause: e,
    });
  }
}
