const CLIEngine = require("eslint").CLIEngine;
const path = require("path");
var cli = new CLIEngine(
    {
        useEslintrc: false,
        rules:{
            notice:["error",{"mustMatch":"[0-9]{0,4}, Nicholas Deis","templateFile":path.join(__dirname,"../tests/test-template.js")}]
        },
        fix:true,
        rulePaths:[path.resolve(__dirname,"../lib/rules")]
    }
);

const report = cli.executeOnFiles([path.resolve(__dirname,"../staging/src")]);

console.log(JSON.stringify(report,null,2));