/**
 * Shared lib between rule and tests
 */

const _ = require("lodash");

const COULD_NOT_FIND = `Could not find a match for the mustMatch pattern`;
const REPORT_AND_SKIP = `Found a header comment which did not match the mustMatch pattern, skipping fix and reporting`;

const ESCAPE = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;
const YEAR_REGEXP = /20\d{2}/;

function escapeRegExp(str) {
  return String(str).replace(ESCAPE, "\\$&");
}

function stringifyRegexp(regexp) {
  return regexp instanceof RegExp ? regexp.source : String(regexp);
}

function regexpizeTemplate({ template, varRegexps }) {
  const allRegexpVars = Object.assign({}, { YEAR: YEAR_REGEXP }, varRegexps);
  const allPatternVars = _.mapValues(allRegexpVars, stringifyRegexp);
  return new RegExp(_.template(escapeRegExp(template))(allPatternVars));
}

module.exports = { regexpizeTemplate, COULD_NOT_FIND, REPORT_AND_SKIP };
