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

const textLF = `/**
 * Copyright (c) 2020, Nick Deis
 */

function x(){
    return 1;
}
`;

//TODO: Test fix

const textLFNoHeader = `
function x(){
  return 1;
}
`;

const textCRLF = textLF.replace(/\n/g,"\r\n");
const textCRLFNoHeader = textLFNoHeader.replace(/\n/g,"\r\n");

describe("Staging", () => {
  describe("Line ending control character testing", () => {
    const cli = new CLIEngine(LINE_ENDING_CONFIG);
    it('Should work on files with CRLF and LF', () => {
        
        const {results} = cli.executeOnFiles([path.join(__dirname, "./test-crlf.js"), path.join(__dirname, "./test-lf.js")]);
        const [crlfResults,lfResults] = results;
        assert.equal(lfResults.errorCount,0,"Should work on LF");
        assert.equal(crlfResults.errorCount,0,"Should work on CRLF");        
    });
    it("Should work on CRLF text", () => {
        const report = cli.executeOnText(textCRLF);
        assert.equal(report.errorCount,0);    
    });
    it("Should work on LF text", () => {
      const report = cli.executeOnText(textLF);
      assert.equal(report.errorCount,0);    
    });
    const clifix = new CLIEngine(Object.assign({},LINE_ENDING_CONFIG,{fix:true}));
    it("Should correctly fix CRLF",() => {
      const report = clifix.executeOnText(textCRLFNoHeader);
      assert.equal(report.errorCount,0);  
    });
    it("Should correctly fix LF",() => {
      const report = clifix.executeOnText(textLFNoHeader);
      assert.equal(report.errorCount,0);  
    });
  });
});
