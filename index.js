/**
 * @fileoverview An eslint rule that checks the top of files and --fix them too!
 * @author Nick Deis
 */

"use strict";

const fs = require("fs"),
    _ = require("lodash");


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
                let { mustMatch, templateFile, template, templateVars, chars } = context.options[0];
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
                return {
                    Program(node) {
                        function fix(fixer) {
                            return fixer.insertTextBefore(node, resolvedTemplate);
                        }
                        if (!String(text).match(mustMatch)) {
                            const report = { node, message: `Could not find a match for the mustMatch pattern` };
                            if (resolvedTemplate) {
                                report.fix = fix;
                            }
                            context.report(report);
                            return;
                        }
                    }
                }
            }
        }
    }
}