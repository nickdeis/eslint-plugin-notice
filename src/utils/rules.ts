/**
 * Copyright (c) 2024, Nick Deis
 */

import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";
import { ReportFixFunction } from "@typescript-eslint/utils/ts-eslint";

export interface NoticePluginDocs {
  description: string;
  category: string;
}

export const createRule = ESLintUtils.RuleCreator<NoticePluginDocs>(
  (_) => `https://github.com/nickdeis/eslint-plugin-notice/tree/main/README.md`,
);

/**
 * Create an eslint {@link ReportFixFunction | fixer} based on the provided arguments.
 *
 * @remarks
 * Using the provided arguments, this function determines if a fix should be made, and
 * where in the code it should be applied.
 *
 * @param hasHeaderComment - The first node of the file is a comment.
 * @param topNode - The first node of the file.
 * @param onNonMatchingHeader - Enum mode for what to do when the header doesn't match.
 * @param template - User provded template to add.
 *
 * @returns A fix callback that you can pass to eslint, or undefined if there shouldn't be a fixer
 */
export function createFixer(
  hasHeaderComment: boolean,
  topNode: TSESTree.Node | TSESTree.Token,
  onNonMatchingHeader: string,
  template: string | undefined,
): ReportFixFunction | undefined {
  if (template === undefined) return undefined;

  if (!hasHeaderComment || onNonMatchingHeader === "prepend") {
    return (fixer) => fixer.insertTextBeforeRange([0, 0], template);
  }

  if (onNonMatchingHeader === "replace") {
    return (fixer) => fixer.replaceText(topNode, template);
  }
}
