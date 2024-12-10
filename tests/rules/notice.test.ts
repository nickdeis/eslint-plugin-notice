/**
 * Copyright (c) 2024, Nick Deis
 */

import { RuleTester, TestCaseError } from "@typescript-eslint/rule-tester";
import * as vitest from "vitest";
import { noticeRule } from "../../src/rules/notice.js";
import { DefaultMessages } from "../../src/config/index.js";
import { readAndNormalize, templateFile } from "../utils/files.js";

const notExact = `
/**
 * Not exactly what I was looking for
 */
function leastYouTried() {
  return false;
}
`;

const noStyle = `
function noStyle() {
  return "I didn't read the style guide :(";
}
`;

/**
 * Creates a test case for {@link Config.nonMatchingTolerance | nonMatchingTolerance}.
 *
 * @remarks
 * Prefills with simple default data.
 *
 * @param nonMatchingTolerance - The value to pass for tolerance.
 *
 * @returns A test case to use with {@link RuleTester}.
 */
function createToleranceTestCase(nonMatchingTolerance: number) {
  return {
    code: `/* Copyright (c) 2014-present, Foo bar Inc. */`,
    options: [
      {
        template: "/* Copyright (c) 2014-present, FooBar, Inc. */",
        nonMatchingTolerance,
        onNonMatchingHeader: "report",
      },
    ] as const,
  };
}

/**
 * Reads and normalizes a file from the results sub directory.
 *
 * @param name - Name of the file to read, without the suffix.
 *
 * @returns Normalized text content of the file.
 */
function resultFile(name: string) {
  return readAndNormalize(`/results/${name}.js`, __dirname);
}

/**
 * Creates a test case error for a given message.
 *
 * Works around the fact that tseslint doesn't support the message field.
 *
 * @remarks
 * If the {@link message} is a key of {@link DefaultMessages}, then it uses the
 * relevant default message. Otherwise it uses the user provided message.
 *
 * @param message - The message that the rule should fail with
 *
 * @returns A test case error array that can be passed directly to `error` in your test.
 *
 * @see https://github.com/typescript-eslint/typescript-eslint/issues/4917
 */
function expectMessage(message: string | keyof typeof DefaultMessages): TestCaseError<never>[] {
  return [
    {
      message: DefaultMessages[message as keyof typeof DefaultMessages] ?? message,
    },
  ] as never;
}

// Map vitest to RuleTester
RuleTester.afterAll = vitest.afterAll;
RuleTester.it = vitest.it;
RuleTester.itOnly = vitest.it.only;
RuleTester.describe = vitest.describe;

const ruleTester = new RuleTester();

const template = templateFile("basic");
const mustMatch = /Copyright \(c\) [0-9]{0,4}, Nick Deis/;

ruleTester.run("notice", noticeRule, {
  invalid: [
    {
      name: "Prepends the template before any code",
      code: noStyle,
      options: [{ mustMatch, template }],
      errors: expectMessage("whenFailedToMatch"),
      output: resultFile("fix-result-1"),
    },
    {
      name: "Prepends the template before any existing comments",
      code: notExact,
      options: [{ mustMatch, template }],
      errors: expectMessage("whenFailedToMatch"),
      output: resultFile("fix-result-2"),
    },
    {
      name: "Replaces existing comments",
      code: notExact,
      options: [{ mustMatch, template, onNonMatchingHeader: "replace" }],
      errors: expectMessage("whenFailedToMatch"),
      output: resultFile("fix-result-3"),
    },
    {
      name: "Works with user provided template variables",
      code: notExact,
      options: [
        {
          template: templateFile("basic-with-name"),
          templateVars: { NAME: "Daymon Reyes" },
          varRegexps: { NAME: "Daymon Reyes" },
        },
      ],
      errors: expectMessage("whenFailedToMatch"),
      output: resultFile("fix-result-5"),
    },
    {
      name: "Allows the year to be overriden",
      code: notExact,
      options: [
        {
          template,
          templateVars: { YEAR: 2000 },
        },
      ],
      errors: expectMessage("whenFailedToMatch"),
      output: resultFile("fix-result-6"),
    },
    {
      name: "Reports the error when report is set",
      // The code for the test case is long, so we load it from a file instead of inlining it
      code: readAndNormalize("/cases/test-case-4.js", __dirname),
      options: [
        {
          template: templateFile("apache"),
          onNonMatchingHeader: "report",
        },
      ],
      errors: expectMessage("reportAndSkip"),
      output: null,
    },
    {
      ...createToleranceTestCase(0.9),
      name: "Matches templates according to tolerance",
      errors: expectMessage(
        "Found a header comment which was too different from the required notice header (similarity=0.87)",
      ),
    },
    {
      name: "Uses user provided messages",
      code: noStyle,
      options: [{ mustMatch, template, messages: { whenFailedToMatch: "Custom message" } }],
      errors: expectMessage("Custom message"),
      output: resultFile("fix-result-1"),
    },
    {
      name: "Errors when the match fails without a template, and without providing any autofixes",
      code: noStyle,
      options: [{ mustMatch }],
      errors: expectMessage("whenFailedToMatch"),
      output: null,
    },
  ],
  valid: [
    {
      name: "Matches against a valid 1:1 template",
      code: `
        /**
         * Copyright (c) 2017, Nick Deis
         * All rights reserved.
        */
        function stylin(){
            return "I read the style guide, or eslint handled it for me";
        }
        `,
      options: [{ mustMatch, template }],
    },
    {
      name: "Matches when the tolerance is close enough",
      code: `
      /**
       * Copyright (c) 2017, Nick Deis
       * All rights reserved.
      */
      function stylin(){
          return "I'm a little off, but close enough";
      }`,
      options: [{ template, nonMatchingTolerance: 0.7 }],
    },
    {
      ...createToleranceTestCase(0.7),
      name: "Matches when the tolerance is close enough, without any extra code",
    },
  ],
});
