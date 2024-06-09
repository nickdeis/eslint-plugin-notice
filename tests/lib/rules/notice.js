/**
 * @fileoverview Tests for top rule
 * @author Nick Deis
 */
const RuleTester8 = require("eslint").RuleTester,
  RuleTester7 = require("eslint7").RuleTester,
  RuleTester6 = require("eslint6").RuleTester,
  RuleTester9 = require("eslint9").RuleTester,
  rule = require("../../..").rules.notice,
  fs = require("fs"),
  path = require("path"),
  utils = require("../../../utils");

const { COULD_NOT_FIND, REPORT_AND_SKIP, escapeRegExp } = utils;

const templateFile = path.join(__dirname, "../../test-template.js");

const template = fs.readFileSync(templateFile, "utf8");

const mustMatch = /Copyright \(c\) [0-9]{0,4}, Nick Deis/;

const RULE_TESTERS = [
  [8,new RuleTester8()],
  [7, new RuleTester7()],
  [6, new RuleTester6()],
  [9, new RuleTester9()]
]




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

const noStyle2 = `
function noStyle2(){
    return "I didn't read the style guide :(";
}
`;

const testCode4 = fs.readFileSync(__dirname + "/test-case-4.js", "utf8");

const testCase4 = {
  code: testCode4,
  options: [{ template: fs.readFileSync(__dirname + "/test-template-4.js", "utf8"), onNonMatchingHeader: "report" }],
  errors: [{ message: REPORT_AND_SKIP }],
  output: null
};

function createToleranceTestCase(nonMatchingTolerance) {
  return {
    code: `/* Copyright (c) 2014-present, Foo bar Inc. */`,
    options: [{ template: "/* Copyright (c) 2014-present, FooBar, Inc. */", nonMatchingTolerance, onNonMatchingHeader:"report" }]
  };
}

/**
 * Since we norm the output of templates, we need to norm the expected output of --fix
 */
function readAndNormalize(rpath){
  return fs.readFileSync(__dirname + rpath, "utf8").replace(/\r\n/g, "\n");
}

for(const [version,ruleTester] of RULE_TESTERS){
  console.log(`Running rule tester version ${version}`);
  runRuleTester(ruleTester);
}

function runRuleTester(ruleTester){
  ruleTester.run("notice", rule, {
    invalid: [
      {
        code: noStyle,
        options: [{ mustMatch, template }],
        errors: [{ message: COULD_NOT_FIND }],
        output: readAndNormalize("/fix-result-1.js")
      },
      {
        code: notExact,
        options: [{ mustMatch, template }],
        errors: [{ message: COULD_NOT_FIND }],
        output: readAndNormalize("/fix-result-2.js")
      },
      {
        code: notExact,
        options: [{ mustMatch, template, onNonMatchingHeader: "replace" }],
        errors: [{ message: COULD_NOT_FIND }],
        output: readAndNormalize("/fix-result-3.js")
      },
      {
        code: notExact,
        options: [{ mustMatch, template, onNonMatchingHeader: "report" }],
        errors: [{ message: REPORT_AND_SKIP }],
        output: null
      },
      testCase4,
      //Similarity message test
      Object.assign({}, createToleranceTestCase(0.9), {
        errors: [
          { message: "Found a header comment which was too different from the required notice header (similarity=0.87)" }
        ]
      }),
      //test configurable messages
      {
        code: noStyle,
        options: [{ mustMatch, template, messages: { whenFailedToMatch: "Custom message" } }],
        errors: [{ message: "Custom message" }],
        output: readAndNormalize("/fix-result-1.js")
      },
      /**
       * Test the case where no template file is set, should COULD_NOT_FIND error with no autofixes suggested
       */
      { code: noStyle2, options: [{ mustMatch }], errors: [{ message: COULD_NOT_FIND }], output: null }
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
        code: `
        /**
         * Copyright (c) 2017, Nick Deis
         * All rights reserved.
        */
        function stylin(){
            return "I'm a little off, but close enough";
        }`,
        options: [{ template, nonMatchingTolerance: 0.7 }]
      },
      createToleranceTestCase(0.7)
    ]
  });
}


