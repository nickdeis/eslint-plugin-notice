import type { ESLint, Rule } from "eslint";

declare const eslintPluginNotice: ESLint.Plugin & {
  rules: {
    notice: Rule.RuleModule;
  };
};

export = eslintPluginNotice;
