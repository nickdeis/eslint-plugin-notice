/**
 * @fileoverview An eslint rule that checks the top of files and --fix them too!
 * @author Nick Deis
 */

"use strict";

const fs = require("fs"),
  _ = require("lodash"),
  utils = require("./utils"),
  metriclcs = require("metric-lcs");

const { regexpizeTemplate, resolveOptions } = utils;

module.exports = {
  rules: {
    notice: {
      meta: {
        docs: {
          description: "An eslint rule that checks the top of files and --fix them too!",
          category: "Stylistic Issues"
        },
        fixable: "code"
      },
      create(context) {
        const { resolvedTemplate, mustMatch, chars, onNonMatchingHeader, nonMatchingTolerance } = resolveOptions(
          context.options[0],
          context.getFilename()
        );
        const sourceCode = context.getSourceCode();
        const text = sourceCode.getText().substring(0, chars);
        const firstComment = sourceCode.getAllComments()[0];
        return {
          Program(node) {
            let topNode;
            let hasHeaderComment = false;
            if (!firstComment) {
              topNode = node;
            } else if (firstComment.loc.start.line <= node.loc.start.line) {
              hasHeaderComment = true;
              topNode = firstComment;
            } else {
              topNode = node;
            }
            let headerMatches = false;
            if (!headerMatches && mustMatch && text) {
              headerMatches = !!String(text).match(mustMatch);
              //If the header matches, return early
              if (headerMatches) return;
            }
            //If chars doesn't match, a header comment/template exists and nonMatchingTolerance is set, try calculating string distance
            if (!headerMatches && hasHeaderComment && resolvedTemplate && _.isNumber(nonMatchingTolerance)) {
              const dist = metriclcs(resolvedTemplate, firstComment.value);
              //Return early, mark as true for future work if needed
              if (nonMatchingTolerance <= dist) {
                headerMatches = true;
                return;
              }
            }
            //Select fixer based off onNonMatchingHeader
            let fix;
            //If there is no template, then there can be no fix.
            if (!resolvedTemplate) {
              fix = undefined;
              //If it has no header comment or onNonMatchingHeader is set to prepend, prepend to the topNode
            } else if (!hasHeaderComment || (hasHeaderComment && onNonMatchingHeader === "prepend")) {
              fix = fixer => fixer.insertTextBefore(topNode, resolvedTemplate);
              //replace header comment
            } else if (hasHeaderComment && onNonMatchingHeader === "replace") {
              fix = fixer => fixer.replaceText(topNode, resolvedTemplate);
              //report and skip
            } else if (hasHeaderComment && onNonMatchingHeader === "report" && !headerMatches) {
              const report = {
                node,
                message: utils.REPORT_AND_SKIP
              };
              context.report(report);
              return;
            }
            if (!headerMatches) {
              const report = { node, message: utils.COULD_NOT_FIND, fix };
              context.report(report);
              return;
            }
          }
        };
      }
    }
  }
};
