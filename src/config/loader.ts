/**
 * Copyright (c) 2024, Nick Deis
 */

import findRoot from "find-root";
import { ConfigSchema } from "../config";
import * as fs from "node:fs";
import path from "node:path";
import { mapValues, template as templ } from "lodash";
import { normalizeLineEndings, readFileSafe } from "../utils";

/**
 * Regexp pattern for matching regexp symbols.
 */
const REGEXP_ESCAPE = /[-[\]/{}()*+?.\\^$|]/g;

/**
 * Converts a value to a string and safely escapes any regexp symbols.
 *
 * @remarks
 * While this doesn't cover edge cases like `-0`, `Symbol`, and nullish values- it's a simple
 * (and performant) alternative to the lodash implementation.
 *
 * This implementation should cover _most_ use-cases.
 *
 * @param value - The value to convert to a string
 *
 * @returns The value as a string, with any regexp symbols escaped.
 */
function escapeRegExp(value: unknown): string {
  return String(value).replace(REGEXP_ESCAPE, "\\$&");
}

/**
 * Gets the source content of a {@link RegExp}.
 *
 * @remarks
 * If the value isn't a regexp, then it's converted to a string directly instead.
 *
 * @param maybeRegex - The value to get a string of.
 *
 * @returns The source content of the regexp, or a string of the value if it wasn't a regexp.
 */
function stringifyRegex(maybeRegex: unknown): string {
  return maybeRegex instanceof RegExp ? maybeRegex.source : String(maybeRegex);
}

/**
 * Converts a template to a {@link RegExp} pattern that matches against itself.
 *
 * @remarks
 * The `patterns` argument will have all its values converted to strings, and they'll be
 * properly filled into the template according to their name in the `patterns`
 * map.
 *
 * @param template - The template to convert to a pattern.
 * @param patterns - A mapping of esm variables to their respective regexp pattern.
 *
 * @returns An instance of {@link RegExp} that matches the template.
 */
export function templateToRegex(template: string, patterns: Record<string, unknown>): RegExp {
  const stringPatterns = mapValues(patterns, stringifyRegex);
  const escapedTemplate = escapeRegExp(template);
  const formattedTemplate = templ(escapedTemplate)(stringPatterns);

  return new RegExp(formattedTemplate);
}

/**
 * Resolves and reads the configured template file.
 *
 * @remarks
 * A `template` takes priority above all else.
 *
 * When a `templateFile` is provided, if it can't be found locally,
 * then the function looks for the nearest `package.json`, and attempts
 * to resolve the template relative to that. An error will be thrown
 * if it still can't find the template file.
 *
 * @param fileName - The virtual file path of the current file eslint is running against.
 * @param templateFile - The user configured path to a template file.
 * @param template - The user configured raw string template.
 *
 * @returns The contents of the resolved template file, or undefined if there's not a template configured.
 */
function resolveTemplate(fileName: string, templateFile?: string, template?: string): string | undefined {
  if (template) return normalizeLineEndings(template);
  if (!templateFile) return undefined;

  const templateFileContents = readFileSafe(templateFile);
  if (templateFileContents) return templateFileContents;

  if (!fs.existsSync(fileName)) {
    throw new Error(`Could not find a file at path: ${fileName}. This is necessary to find the root`);
  }

  const root = findRoot(fileName);
  const rootTemplateFile = path.resolve(root, templateFile);

  const rootTemplateContents = readFileSafe(rootTemplateFile);
  if (rootTemplateContents) return rootTemplateContents;

  throw new Error(`Could not find a template file at path: ${rootTemplateFile}`);
}

/**
 * Parse the plugin configuration for a given file.
 *
 * @remarks
 * Will properly resolve the template (if any), and update
 * `mustMatch` accordingly.
 *
 * @param options - The user specified configuration.
 * @param fileName - The virtual file path of the current file eslint is running against.
 *
 * @returns The parsed and populated Config instance.
 */
export function resolveOptions(options: unknown, fileName: string) {
  const result = ConfigSchema.safeParse(options);
  if (!result.success) {
    throw new Error(result.error.message, {
      cause: result.error,
    });
  }

  const config = result.data;
  const template = resolveTemplate(fileName, config.templateFile, config.template);

  // Convert the template to regex if mustMatch isn't provided
  config.mustMatch = config.mustMatch ? new RegExp(config.mustMatch) : templateToRegex(template!, config.varRegexps);

  // Populate template with configured template variables
  config.template = normalizeLineEndings(templ(template)(config.templateVars));

  return config;
}
