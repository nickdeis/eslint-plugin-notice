/**
 * Copyright (c) 2024, Nick Deis
 */

import { createFixer, createRule, normalizeLineEndings } from "../utils";
import { isNumber } from "lodash";
import metriclcs from "metric-lcs";
import { ReportFixFunction } from "@typescript-eslint/utils/ts-eslint";
import { resolveOptions } from "../config";

export const noticeRule = createRule({
  meta: {
    docs: {
      description: "An eslint rule that checks the top of files and --fix them too!",
      category: "Stylistic Issues",
    },
    messages: {},
    type: "layout",
    fixable: "code",
    schema: false as never,
  },
  defaultOptions: [] as never,
  name: "notice",
  create(context) {
    const { chars, mustMatch, template, onNonMatchingHeader, nonMatchingTolerance, messages } = resolveOptions(
      context.options[0],
      context.filename,
    );

    const sourceCode = context.sourceCode;
    const text = sourceCode.text.substring(0, chars);
    const firstComment = sourceCode.getAllComments().at(0);

    return {
      Program(node) {
        /**
         * Reports a problem in the code.
         *
         * @remarks
         * Wrapper around {@link context.report} to more cleanly work-around the fact that
         * tseslint doesn't support the message field.
         *
         * @see https://github.com/typescript-eslint/typescript-eslint/issues/4917
         */
        const report = ({ message, fix, data }: { message: string; fix?: ReportFixFunction; data?: object }) =>
          context.report({ message, fix, data, node } as never);

        const hasHeaderComment = firstComment !== undefined && firstComment.loc.start.line <= node.loc.start.line;
        const topNode = hasHeaderComment ? firstComment : node;

        if (mustMatch && text) {
          // Header matches basic pattern
          if (normalizeLineEndings(text).match(mustMatch)) return;
        }

        // If a header comment/template exists and nonMatchingTolerance is set, try calculating string distance
        if (hasHeaderComment && template && isNumber(nonMatchingTolerance)) {
          const dist = metriclcs(template, firstComment!.value);

          // Header is within tolerance, so we consider it a match
          if (nonMatchingTolerance <= dist) return;

          const fix = createFixer(hasHeaderComment, topNode, onNonMatchingHeader, template);
          return report({
            message: messages.whenOutsideTolerance,
            fix,
            data: { similarity: Math.round(dist * 1000) / 1000 },
          });
        }

        // Report and skip
        if (hasHeaderComment && onNonMatchingHeader === "report") {
          return report({ message: messages.reportAndSkip });
        }

        // Select fixer based off onNonMatchingHeader
        const fix = createFixer(hasHeaderComment, topNode, onNonMatchingHeader, template);
        return report({ message: messages.whenFailedToMatch, fix });
      },
    };
  },
});
