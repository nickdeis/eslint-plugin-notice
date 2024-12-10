/**
 * Copyright (c) 2024, Nick Deis
 */

import { describe, expect, it } from "vitest";
import { templateToRegex } from "../src/config";

const template = `
/**
 * Copyright (c) <%= YEAR %>, <%= NAME %>
 */
`;

const header1 = `
/**
 * Copyright (c) 2017, Nick Deis
 */
`;

const header2 = `
/**
 * Copyright (c) 2016, Nicholas Deis
 */
`;

const HEADERS = [header1, header2];

describe("templateToRegex", () => {
  const varRegexps = { NAME: /(Nick|Nicholas) Deis/, YEAR: "20\\d{2}" };
  const mustMatch = templateToRegex(template, varRegexps);

  it("should work", () => {
    for (const header of HEADERS) {
      expect(header).to.match(mustMatch);
    }
  });
});
