const CLIEngine = require("eslint").CLIEngine;
const path = require("path");
var cli = new CLIEngine(
    {
        useEslintrc: false,
        rules:{
            notice:["error",{"mustMatch":"[0-9]{0,4}, Nick Deis","templateFile":path.join(__dirname,"../tests/test-template.js")}]
        },
        fix:true,
        rulePaths:[path.resolve(__dirname,"..")]
    }
);

const report = cli.executeOnFiles([path.resolve(__dirname,"../staging/src")]);

console.log(JSON.stringify(report,null,2));