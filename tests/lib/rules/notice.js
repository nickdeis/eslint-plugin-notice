/**
 * @fileoverview Tests for top rule
 * @author Nick Deis
 */
const RuleTester = require("eslint/lib/testers/rule-tester"),
  rule = require("../../..").rules.notice,
  fs = require("fs"),
  path = require("path");

const templateFile = path.join(__dirname, "../../test-template.js");

const template = fs.readFileSync(templateFile, "utf8");

const mustMatch = /Copyright \(c\) [0-9]{0,4}, Nick Deis/;

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

const COULD_NOT_FIND = `Could not find a match for the mustMatch pattern`;
const REPORT_AND_SKIP = `Found a header comment which did not match the mustMatch pattern, skipping fix and reporting`;

ruleTester.run("notice", rule, {
  invalid: [
    {
      code: noStyle,
      options: [{ mustMatch, template }],
      errors: [{ message: COULD_NOT_FIND }],
      output: fs.readFileSync(__dirname + "/fix-result-1.js", "utf8")
    },
    {
      code: notExact,
      options: [{ mustMatch, template }],
      errors: [{ message: COULD_NOT_FIND }],
      output: fs.readFileSync(__dirname + "/fix-result-2.js", "utf8")
    },
    {
      code: notExact,
      options: [{ mustMatch, template, onNonMatchingHeader: "replace" }],
      errors: [{ message: COULD_NOT_FIND }],
      output: fs.readFileSync(__dirname + "/fix-result-3.js", "utf8")
    },
    {
      code: notExact,
      options: [{ mustMatch, template, onNonMatchingHeader: "report" }],
      errors: [{ message: REPORT_AND_SKIP }]
    }
  ],
  valid: [
    {
      code: `
        /**
         * Copyright (c) 2017, Nick Deis
         * All rights reserved.
        */
        function stylin(){
            return "I read the style guide, or eslint handled it for me";
        }
        `,
      options: [{ mustMatch, template }]
    }
  ]
});
