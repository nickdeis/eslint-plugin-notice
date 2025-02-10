/**
 * Copyright (c) 2024, Nick Deis
 */

import {
  InvalidTestCase,
  RuleTester,
  RunTests,
  ValidTestCase,
} from "@typescript-eslint/rule-tester";
import type { AnyRuleModule } from "@typescript-eslint/utils/ts-eslint";
import { RuleTester as RuleTester8 } from "eslint8";
import { omit } from "lodash";
import * as vitest from "vitest";
import { describe, it } from "vitest";

// We only need to bind for typescript-eslint
RuleTester.afterAll = vitest.afterAll;
RuleTester.it = vitest.it;
RuleTester.itOnly = vitest.it.only;
RuleTester.describe = vitest.describe;

const RULE_TESTERS = {
  "8": new RuleTester8(),
  "9": new RuleTester(),
} as const;

/**
 * Seperates the name from a test case.
 *
 * See {@link prepareTestCases} for context.
 *
 * @remarks
 * Throws an error if the test case is just a string.
 * While supported by eslint, it defeats the purpose of
 * named tests.
 *
 * @param testCase The test case to convert.
 *
 * @returns An object with the name seperated from the test case.
 */
function convertTestCase<
  T extends ValidTestCase<Options> | InvalidTestCase<never, Options>,
  Options extends unknown[]
>(testCase: T | string) {
  if (typeof testCase === "string") {
    throw new Error(`Invalid test case specified: ${testCase}`);
  }

  const name = testCase.name ?? "Unnamed test case";
  return {
    name,
    test: omit(testCase, "name"),
  };
}

/**
 * Maps test cases to a variant that can be used for older rule testers.
 *
 * @remarks
 * Older versions of {@link RuleTester} don't have a `name` property.
 * To circumvent this, without losing test names, we map each test
 * case to a version without the `name` property, and use a vitest {@link it}
 * block to specify the name.
 *
 * @param test The test case to process.
 *
 * @returns A mapped version of runtests from {@link convertTestCase}.
 */
function prepareTestCases<T extends readonly unknown[]>(
  test: RunTests<never, T>
) {
  const valid = test.valid.map(convertTestCase);
  const invalid = test.invalid.map(convertTestCase);

  return {
    valid,
    invalid,
  };
}

/**
 * Runs the tests for an eslint rule against multiple versions of eslint.
 *
 * @remarks
 * Specifically, this runs the rule against versions 6 through 9.
 *
 * The tests will run under vitest {@link it} blocks instead of being bundled
 * together in one {@link RuleTester} run. This works around the fact
 * that older versions of rule tester don't support test case naming.
 *
 * @param ruleName The name of the rule we're testing.
 * @param rule The rule itself to test.
 * @param testCase A mapping of test cases to run.
 */
export function runAll(
  ruleName: string,
  rule: AnyRuleModule,
  testCase: RunTests<never, readonly unknown[]>
) {
  const testers = Object.entries(RULE_TESTERS);
  const cases = prepareTestCases(testCase);

  for (const [version, ruleTester] of testers) {
    describe(`${ruleName} [v${version}]`, () => {
      describe("valid", () => {
        for (const { name, test } of cases.valid) {
          it(name, () => {
            // We don't bother casting `rule` to a type-safe variant as eslint-typescript is very opinionated
            ruleTester.run(ruleName, rule as never, {
              valid: [test],
              invalid: [],
            });
          });
        }
      });

      describe("invalid", () => {
        for (const { name, test } of cases.invalid) {
          it(name, () => {
            console.log(test);
            ruleTester.run(ruleName, rule as never, {
              valid: [],
              // Older test cases could have errors strings, but we can't anymore so it doesn't matter
              invalid: [test as never],
            });
          });
        }
      });
    });
  }
}
