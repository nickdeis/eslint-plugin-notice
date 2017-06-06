/**
 * @fileoverview Tests for top rule
 * @author Nicholas Deis
 */
const RuleTester = require("eslint/lib/testers/rule-tester"),
rule = require("../../../lib/rules/top"),
fs = require("fs");

const templateFile = "../../test-template.js";

const template = fs.readFileSync(templateFile,"utf8");

const mustMatch = "[0-9]{0,4}, Nicholas Deis";


const ruleTester = new RuleTester();

ruleTester.run("top",rule,{
    invalid:[
        {
            code:`
            function noStyle(){
                return "I didn't read the style guide :(";
            }
            `,
            options:[{mustMatch,template}],
            errors: [{ message: `Found no text, and therefore there is no top comment`}]
        },
        {
            code:`
                /**
                 * Not exactly what I was looking for
                 */
                function leastYouTried(){
                    return false;
                }
            `,
            options:[{mustMatch,template}],
            errors:[{message:`Could not find a match for the mustMatch pattern in the top comment`}]
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