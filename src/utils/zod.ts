/**
 * Copyright (c) 2024, Nick Deis
 */

import { ZodObject, ZodRawShape, preprocess } from "zod";

/**
 * Wrap a zod schema in a version that uses its default values whenever they're missing.
 *
 * @remarks
 * This works around the fact that {@link ZodObject} doesn't default to being present, even
 * if all of its values have defaults.
 *
 * @param schema - The {@link ZodObject} to wrap.
 *
 * @returns A copy of the schema that will fallback to its default values when absent.
 *
 * @author daymxn
 */
export function withDefaults<T extends ZodObject<ZodRawShape>>(schema: T) {
  return preprocess((value) => (value === undefined ? schema.parse({}) : value), schema);
}
