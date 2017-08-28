const { regexpizeTemplate } = require("../utils");
const assert = require("assert");

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

function testRegepizeTemplate() {
  const varRegexps = { NAME: /(Nick|Nicholas) Deis/ };
  const mustMatch = regexpizeTemplate({ template, varRegexps });
  console.log(mustMatch);
  HEADERS.forEach(header => {
    if (!header.match(mustMatch)) {
      throw new Error(`Expected ${header} to match ${mustMatch}`);
    }
  });
}

testRegepizeTemplate();
