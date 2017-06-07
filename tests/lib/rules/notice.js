/**
 * @fileoverview Tests for top rule
 * @author Nicholas Deis
 */
const RuleTester = require("eslint/lib/testers/rule-tester"),
rule = require("../../../lib/rules/notice"),
fs = require("fs"),
path = require("path");

const templateFile = path.join(__dirname,"../../test-template.js");

const template = fs.readFileSync(templateFile,"utf8");

const mustMatch = "[0-9]{0,4}, Nicholas Deis";


const ruleTester = new RuleTester();

const notExact = `
/**
 * Not exactly what I was looking for
 */
function leastYouTried(){
    return false;
}
`;

const noStyle = `
function noStyle(){
    return "I didn't read the style guide :(";
}
`;



ruleTester.run("notice",rule,{
    invalid:[
        {
            code:noStyle,
            options:[{mustMatch,template}],
            errors: [{ message: `Could not find a match for the mustMatch pattern`}]
        },
        {
            code:notExact,
            options:[{mustMatch,template}],
            errors:[{message:`Could not find a match for the mustMatch pattern`}]
        }
    ],
    valid:[{
        code:`
        /**
         * Copyright (c) 2017, Nicholas Deis
         * All rights reserved.
        */
        function stylin(){
            return "I read the style guide, or eslint handled it for me";
        }
        `,
        options:[{mustMatch,template}]
    }]
});