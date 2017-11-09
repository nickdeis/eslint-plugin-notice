/**
 * @fileoverview Tests for top rule
 * @author Nick Deis
 */
const RuleTester = require("eslint/lib/testers/rule-tester"),
  rule = require("../../..").rules.notice,
  fs = require("fs"),
  path = require("path"),
  utils = require("../../../utils");

const { COULD_NOT_FIND, REPORT_AND_SKIP, escapeRegExp } = utils;

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

const testCode4 = fs.readFileSync(__dirname + "/test-case-4.js", "utf8");

const testCase4 = {
  code: testCode4,
  options: [{ template: fs.readFileSync(__dirname + "/test-template-4.js","utf8"), onNonMatchingHeader: "report" }],
  errors: [{ message: REPORT_AND_SKIP }],
  output: testCode4
};

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
      errors: [{ message: REPORT_AND_SKIP }],
      output: notExact
    },
    testCase4
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
    },
    {
      code:`
      /**
       * Copyright (c) 2017, Nick Deis
       * All rights reserved.
      */
      function stylin(){
          return "I'm a little off, but close enough";
      }`,
      options: [{ template,nonMatchingTolerance:.70 }]
    },
    {
      code:`/* Copyright (c) 2014-present, Foo bar Inc. */`,
      options:[{template:"/* Copyright (c) 2014-present, FooBar, Inc. */",nonMatchingTolerance:.70}]
    }


  ]
});
