var CLIEngine = require("eslint").CLIEngine;
var cli = new CLIEngine(
    {
        useEslintrc: false,
        plugins:["top"],
        rules:{
            top:["error",{"mustMatch":"[0-9]{0,4}, Nicholas Deis","templateFile":"../tests/test-template.js"}]
        },
        fix:true,
        rulePaths:["../lib/rules"]
    }
    );

var report = cli.executeOnFiles(["../staging/src"]);

console.log(JSON.stringify(report,null,2));