/**
 * Shared lib between rule and tests
 */

const COULD_NOT_FIND = `Could not find a match for the mustMatch pattern`;
const REPORT_AND_SKIP = `Found a header comment which did not match the mustMatch pattern, skipping fix and reporting`;

const ESCAPE = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;

function escapeRegExp(str) {
  return String(str).replace(ESCAPE, "\\$&");
}

module.exports = { escapeRegExp, COULD_NOT_FIND, REPORT_AND_SKIP };
