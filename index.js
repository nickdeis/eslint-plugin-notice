/**
 * @fileoverview An eslint rule that checks the top of files and --fix them too!
 * @author Nick Deis
 */

"use strict";

const fs = require("fs"),
  _ = require("lodash");

const NON_MATCHING_HEADER_ACTIONS = ["prepend","replace","report"]; 

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
        let { mustMatch, templateFile, template, templateVars, chars, onNonMatchingHeader } = context.options[0];
        onNonMatchingHeader = onNonMatchingHeader || "prepend";
        if (!(mustMatch instanceof RegExp)) {
          mustMatch = new RegExp(mustMatch);
        }

        if (!template && templateFile) {
          template = fs.readFileSync(templateFile, "utf8");
        }
        templateVars = templateVars || {};
        chars = chars || 1000;
        const YEAR = new Date().getFullYear();
        const allVars = Object.assign({}, { YEAR }, templateVars);
        const resolvedTemplate = _.template(template)(allVars);
        const sourceCode = context.getSourceCode();
        const text = sourceCode.getText().substring(0, chars);
        const firstComment = sourceCode.getAllComments()[0];
        return {
          Program(node) {
            let topNode;
            let hasHeaderComment = false;
            let applyFix = true;
            if (!firstComment) {
              topNode = node;
            } else if (firstComment.loc.start.line <= node.loc.start.line) {
              hasHeaderComment = true;
              topNode = firstComment;
            } else {
              topNode = node;
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
            } else if (hasHeaderComment && onNonMatchingHeader === "report") {
              const report = {
                node,
                message: `Found a header comment which did not match the mustMatch pattern, skipping fix and reporting`
              };
              context.report(report);
              return;
            }
            if (!String(text).match(mustMatch)) {
              const report = { node, message: `Could not find a match for the mustMatch pattern`, fix };
              context.report(report);
              return;
            }
          }
        };
      }
    }
  }
};
