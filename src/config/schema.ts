/**
 * Copyright (c) 2024, Nick Deis
 */

import { z } from "zod";
import { withDefaults } from "../utils";

const MatchAction = z.enum(["prepend", "replace", "report", "append"]);

export const DefaultMessages = {
  whenFailedToMatch: "Missing notice header",
  reportAndSkip: "Found a header comment which did not have a notice header, skipping fix and reporting",
  whenOutsideTolerance:
    "Found a header comment which was too different from the required notice header (similarity={{ similarity }})",
} satisfies Record<string, string>;

const MessagesSchema = withDefaults(
  z.object({
    whenFailedToMatch: z.ostring().default(DefaultMessages.whenFailedToMatch),
    reportAndSkip: z.ostring().default(DefaultMessages.reportAndSkip),
    whenOutsideTolerance: z.ostring().default(DefaultMessages.whenOutsideTolerance),
  }),
);

const templateVarsSchema = withDefaults(
  z
    .object({
      YEAR: z.ostring().or(z.number()).default(new Date().getFullYear().toString()),
    })
    .passthrough(),
);

const varRegexpsSchema = withDefaults(
  z
    .object({
      YEAR: z.ostring().or(z.instanceof(RegExp)).default("20\\d{2}"),
    })
    .passthrough(),
);

export const ConfigSchema = z
  .object({
    mustMatch: z.ostring().or(z.instanceof(RegExp)),
    template: z.ostring(),
    chars: z.number().min(1).optional().default(1000),
    templateFile: z.ostring().describe("Do things and all that"),
    templateVars: templateVarsSchema,
    onNonMatchingHeader: MatchAction.default("prepend"),
    nonMatchingTolerance: z.onumber().optional(),
    varRegexps: varRegexpsSchema,
    messages: MessagesSchema,
  })
  .refine((data) => data.mustMatch || data.template || data.templateFile, {
    message: "Either mustMatch, template, or templateFile must be set",
  });

/**
 * Configuration options that can be passed into the plugin through eslint.
 */
export type Config = z.infer<typeof ConfigSchema>;
