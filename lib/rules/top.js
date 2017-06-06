"use strict";

const fs = require("fs"),
_ = require("lodash");



module.exports = {
    meta: {
        docs: {
            description: "An eslint rule that checks the top comment and fixes it too!",
            category: "Stylistic Issues"
        },
        fixable: "code"
    },
    create(context) {
        let {mustMatch,templateFile,template,templateVars,chars} = context.options[0];
        if(!(mustMatch instanceof RegExp)){
            mustMatch = new RegExp(mustMatch);
        }

        if(!template && templateFile){
            template = fs.readFileSync(templateFile,"utf8");
        }
        templateVars = templateVars || {};
        if(typeof chars !== "number"){
            chars=1000;
        }
        const YEAR = new Date().getFullYear();
        const allVars = Object.assign({},{YEAR},templateVars);
        const resolvedTemplate = _.template(template)(allVars);
        const sourceCode = context.getSourceCode();
        const text = sourceCode.getText().substring(0,chars);
        return {
            Program(node){
                function fix(fixer){
                    return fixer.insertTextBefore(node,resolvedTemplate);
                }
                if(!text){
                    const report = {node,message:`Found no text, and therefore there is no top comment`};
                    if(resolvedTemplate){
                        report.fix = fix;
                    }
                    context.report(report);
                    return;
                }
                if(!text.match(mustMatch)){
                    const report = {node,message:`Could not find a match for the mustMatch pattern in the top comment`};
                    if(resolvedTemplate){
                        report.fix = fix;
                    }
                    context.report(report);
                    return;
                }
            }
        }
    }
};