import { RuleTester as RuleTester6 } from "eslint6";
import { RuleTester as RuleTester7 } from "eslint7";
import { RuleTester as RuleTester8 } from "eslint8";
import { Rule, RuleTester as RuleTester } from "eslint";
import type { RuleTester as TRuleTester6, Rule as Rule6 } from "eslint-types6";
import type { RuleTester as TRuleTester7, Rule as Rule7 } from "eslint-types7";
import type { RuleTester as TRuleTester8, Rule as Rule8 } from "eslint-types8";
import { RunTests } from "@typescript-eslint/rule-tester";

const RULE_TESTERS: Record<
  "6" | "7" | "8" | "9",
  TRuleTester6 | TRuleTester7 | TRuleTester8 | RuleTester
> = {
  "6": new RuleTester6() as TRuleTester6,
  "7": new RuleTester7() as TRuleTester7,
  "8": new RuleTester8() as TRuleTester8,
  "9": new RuleTester(),
};

export function runAll(
  ruleName: string,
  rule:
    | Rule.RuleModule
    | Rule6.RuleModule
    | Rule7.RuleModule
    | Rule8.RuleModule,
  test: RunTests<never, readonly unknown[]>
) {
  const testers = Object.entries(RULE_TESTERS);
  for (const [version, ruleTester] of testers) {
    ruleTester.run(ruleName, rule, test);
  }
}
