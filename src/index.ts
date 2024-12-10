/**
 * Copyright (c) 2024, Nick Deis
 */

import { rules } from "./rules/index.js";
import { name, version } from "../package.json";
import { TSESLint } from "@typescript-eslint/utils";

const plugin = {
  configs: {
    get recommended() {
      return recommended;
    },
  },
  meta: { name, version },
  rules,
} satisfies TSESLint.FlatConfig.Plugin;

const recommended: TSESLint.FlatConfig.Config = {
  name: "recommended",
  plugins: {
    notice: plugin,
  },
};

export = plugin;
