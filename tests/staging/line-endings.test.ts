/**
 * Copyright (c) 2024, Nick Deis
 */

import { normalizeLineEndings } from "../../src/utils";
import { templateFilePath } from "../utils";
import noticePlugin from "../../src";
import { ESLint } from "@typescript-eslint/utils/ts-eslint";
import { expect, describe, it } from "vitest";
import path from "path";

const eslintOptions: ESLint.ESLintOptions = {
  overrideConfig: [
    {
      ...noticePlugin.configs.recommended,
      rules: {
        "notice/notice": ["error", { templateFile: templateFilePath("basic") }],
      },
    },
  ],
  overrideConfigFile: true,
};

const textLF = `/**
 * Copyright (c) 2020, Nick Deis
 */

function x() {
  return 1;
}
`;

const textLFNoHeader = `
function x() {
  return 1;
}
`;

const textCRLF = normalizeLineEndings(textLF, "crlf");
const textCRLFNoHeader = normalizeLineEndings(textLFNoHeader, "crlf");

describe("Line endings", () => {
  const eslint = new ESLint(eslintOptions);
  const eslintFix = new ESLint({ ...eslintOptions, fix: true });

  /**
   * Runs eslint against the specified text and throws if eslint finds any errors.
   *
   * @param text - The code to lint against.
   */
  async function lintText(text: string) {
    const report = await eslint.lintText(text);

    expect(report).to.have.a.lengthOf(1, "Should only have our rule.");
    expect(report[0].errorCount).to.equal(0);
  }

  /**
   * Runs eslint against the specified text and throws if eslint is unable to fix all the errors.
   *
   * @param text - The code to lint against.
   */
  async function fixText(text: string) {
    const report = await eslintFix.lintText(text);

    expect(report).to.have.a.lengthOf(1, "Should only have our rule.");
    expect(report[0].errorCount).to.equal(0);
  }

  it("should work on files with crlf and lf", async () => {
    const results = await eslint.lintFiles([path.join(__dirname, "/cases", "*.js")]);

    const [crlfResults, lfResults] = results;

    expect(lfResults.errorCount).to.equal(0, "Should work on LF");
    expect(crlfResults.errorCount).to.equal(0, "Should work on CRLF");
  });

  it("should work on CRLF text", async () => lintText(textCRLF));
  it("should work on LF text", async () => lintText(textLF));

  it("should correctly fix CRLF", async () => fixText(textCRLFNoHeader));
  it("should correctly fix LF", async () => fixText(textLFNoHeader));
});
