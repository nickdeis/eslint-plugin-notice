const CLIEngine = require("eslint").CLIEngine;
const path = require("path");
const assert = require('assert');

const LINE_ENDING_CONFIG = {
  plugins: ["self"],
  rules: {
    "self/notice": ["error",{ templateFile: path.join(__dirname, "./test-template.txt") }]
  },
  useEslintrc:false
};

describe("Staging", () => {
  describe("Line ending control character testing", () => {
    it('Should work on files with CRLF and LF', () => {
        const cli = new CLIEngine(LINE_ENDING_CONFIG);
        const {results} = cli.executeOnFiles([path.join(__dirname, "./test-crlf.js"), path.join(__dirname, "./test-lf.js")]);
        const [crlfResults,lfResults] = results;
        assert.equal(lfResults.errorCount,0,"Should work on LF");
        assert.equal(crlfResults.errorCount,0,"Should work on CRLF");        
    });

  });
});
