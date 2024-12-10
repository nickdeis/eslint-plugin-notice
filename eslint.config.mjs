/**
 * Copyright (c) 2024, Nick Deis
 */

import tseslint from "typescript-eslint";
import noticePlugin from "./lib/index.js";
import eslint from '@eslint/js';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    plugins: {
      notice: noticePlugin
    },
    rules: {
      "notice/notice": [
        "error", {
          mustMatch: "[0-9]{0,4}, Nick Deis",
          chars: 100,
          templateFile: "./tests/utils/templates/basic.js",
        }
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_"
        }
      ]
    },
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        projectService: {
          allowDefaultProject: ["*.ts", "*.mjs"],
        },
      },
    },
  },
  { ignores: ["lib", "node_modules", "**/*.js"] }
)
