# eslint-plugin-notice

An eslint rule that checks the top of files and `--fix` them too!

## Usage

`npm i eslint-plugin-notice`

Throw an error when a file doesn't have copyright notice
```json
{
    "plugins":["notice"],
    "rules":{
        "notice":["error",{"mustMatch":"Copyright \\(c\\) [0-9]{0,4}, Nick Deis"}]
    }
}
```

Add a template to `--fix` it
```json
{
    "notice":["error",
        {
        "mustMatch":"Copyright \\(c\\) [0-9]{0,4}, Nick Deis",
        "template":"/** Copyright (c) <%= YEAR %>, Nick Deis **/"
        }
    ]
}
```

or use a file

*config/copyright.js*
```js
/**
 * Copyright (c) <%= YEAR %>, Nick Deis
 */
```
```json
{
    "notice":["error",
        {
        "mustMatch":"Copyright \\(c\\) [0-9]{0,4}, Nick Deis",
        "templateFile":"config/copyright.js"
        }
    ]
}
```


## Options

|Option|Description|Default/Required/Optional|Type|
|------|-----------|----------------|----|
|mustMatch|A pattern that must be present in the notice|**Required**|RegExp/string|
|chars|The number of characters to check for the mustMatch pattern|1000|number|
|template|A lodash template that will be used to fix files they don't contain mustMatch |**Optional**|string|
|templateFile|template will override this setting. A file which contains the template|**Optional**|string|
|templateVars|The variables to be used with the lodash template, always contains the variable YEAR|{YEAR}|object|

