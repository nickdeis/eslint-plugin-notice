const ESLint8 = require("eslint").ESLint,
ESLint9 = require("eslint9").ESLint,
ESLint7 = require("eslint7").ESLint;
const path = require("path");
const assert = require('assert');


const RULE_CONFIG = ["error",{ templateFile: path.join(__dirname, "./test-template.txt") }];

const LINE_ENDING_CONFIG_V8 = {
  plugins: ["self"],
  rules: {
    "self/notice": RULE_CONFIG
  }
};

const LINE_ENDING_CONFIG_V9 =  {
    "plugins":{
      "notice": require("..")
    },
    "rules":{
      "notice/notice": RULE_CONFIG, 
    }
}


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
const ESLINTS = [
  [7,ESLint7,{overrideConfig:LINE_ENDING_CONFIG_V8,useEslintrc:false}],
  [8,ESLint8,{overrideConfig:LINE_ENDING_CONFIG_V8,useEslintrc:false}],
  [9,ESLint9,{overrideConfig:LINE_ENDING_CONFIG_V9,overrideConfigFile:true}]
]

for(const [version,ESLint,config] of ESLINTS){
  describe(`Staging Version ${version}`, () => {
    describe("Line ending control character testing", () => {
      const eslint = new ESLint(config);
      it('Should work on files with CRLF and LF', async () => {
          
          const results = await eslint.lintFiles([path.join(__dirname, "./test-crlf.js"), path.join(__dirname, "./test-lf.js")]);
          const [crlfResults,lfResults] = results;
          assert.equal(lfResults.errorCount,0,"Should work on LF");
          assert.equal(crlfResults.errorCount,0,"Should work on CRLF");        
      });
      it("Should work on CRLF text", async () => {
          const report = await eslint.lintText(textCRLF);
          assert.equal(report[0].errorCount,0);    
      });
      it("Should work on LF text", async () => {
        const report = await eslint.lintText(textLF);
        assert.equal(report[0].errorCount,0);    
      });
      const eslintFix = new ESLint(Object.assign({fix:true},config));
      it("Should correctly fix CRLF", async () => {
        const report = await eslintFix.lintText(textCRLFNoHeader);
        assert.equal(report[0].errorCount,0);  
      });
      it("Should correctly fix LF", async () => {
        const report = await eslintFix.lintText(textLFNoHeader);
        assert.equal(report[0].errorCount,0);  
      });
    });
  });
}

