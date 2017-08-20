const fs = require('fs');

//https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

const template = fs.readFileSync(`${__dirname}/template-issue-3.js`,"utf8");
const mustMatch = escapeRegExp(template).replace('<%= YEAR %>', '20\\d\\d');

module.exports = {template,mustMatch};