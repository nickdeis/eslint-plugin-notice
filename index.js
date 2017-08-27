/**
 * @fileoverview An eslint rule that checks the top of files and --fix them too!
 * @author Nick Deis
 */

"use strict";

const fs = require("fs"),
  _ = require("lodash"),
  utils = require("./utils");

const NON_MATCHING_HEADER_ACTIONS = ["prepend", "replace", "report"];
const YEAR_REGEXP = /20\d{2}/;
const { escapeRegExp } = utils;

function resolveOptions({ mustMatch, templateFile, template, templateVars, chars, onNonMatchingHeader, varRegexps }) {
  onNonMatchingHeader = onNonMatchingHeader || "prepend";
  let mustMatchTemplate = false;
  if (!mustMatch) {
    mustMatchTemplate = true;
  } else if (!(mustMatch instanceof RegExp)) {
    mustMatch = new RegExp(mustMatch);
  }

  if (!template && templateFile) {
    template = fs.readFileSync(templateFile, "utf8");
  }

  templateVars = templateVars || {};
  chars = chars || 1000;
  const YEAR = new Date().getFullYear();
  const allVars = Object.assign({}, { YEAR }, templateVars);

  if (mustMatchTemplate && template) {
    //create mustMatch from varRegexps and template
    varRegexps = varRegexps || {};
    const allRegexpVars = Object.assign({}, { YEAR: YEAR_REGEXP }, varRegexps);
    mustMatch = new RegExp(_.template(escapeRegExp(template))(allRegexpVars));
  } else if (!template && mustMatchTemplate) {
    throw new Error("Either mustMatch, template, or templateFile must be set");
  }
  const resolvedTemplate = _.template(template)(allVars);
  return { resolvedTemplate, mustMatch, chars, onNonMatchingHeader };
}

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
        const { resolvedTemplate, mustMatch, chars, onNonMatchingHeader } = resolveOptions(context.options[0]);
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
                message: utils.REPORT_AND_SKIP
              };
              context.report(report);
              return;
            }
            if (!String(text).match(mustMatch)) {
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
