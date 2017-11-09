# eslint-plugin-notice

An eslint rule that checks the top of files and `--fix` them too!

## Usage

`npm i eslint-plugin-notice`

Throw an error when a file doesn't have copyright notice
```json
{
    "plugins":["notice"],
    "rules":{
        "notice/notice":["error",{"mustMatch":"Copyright \\(c\\) [0-9]{0,4}, Nick Deis"}]
    }
}
```

Add a template to `--fix` it
```json
{
    "notice/notice":["error",
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
    "notice/notice":["error",
        {
        "mustMatch":"Copyright \\(c\\) [0-9]{0,4}, Nick Deis",
        "templateFile":"config/copyright.js"
        }
    ]
}
```

or just use your template, eslint-plugin-notice will reverse into a pattern for `mustMatch`

```json
{
    "notice/notice":["error",
        {
        "templateFile":"config/copyright.js"
        }
    ]
}
```

Want a more expressive template? Add `templateVars` and `varRegexps`
*config/copyright.js*
```js
/**
 * Copyright (c) <%= YEAR %>, <%= NAME %>
 */
```
```js
{
    "notice/notice":["error",
        {
        templateFile:"config/copyright.js",
        //YEAR will still be added unless you add your own value
        templateVars:{NAME:"Nick Deis"},
        //The regexp for YEAR is /20\d{2}/ and is automatically added
        varRegexps:{NAME:/(Nick|Nicholas) Deis/}
        }
    ]
}
```


## Options

|Option|Description|Default/Required/Optional|Type|
|------|-----------|----------------|----|
|mustMatch|A pattern that must be present in the notice|**Required** unless `template` is set|RegExp/string|
|template|A lodash template that will be used to fix files that do not match `mustMatch` or are less than `nonMatchingTolerance`|**Optional** unless `mustMatch` is not set|string|
|templateFile|`template` will override this setting. A file which contains the `template`|**Optional**|string|
|chars|The number of characters to check for the `mustMatch` pattern|`1000`|number|
|templateVars|The variables to be used with the lodash template, always contains the variable YEAR|`{YEAR:new Date().getFullYear()}`|object|
|[onNonMatchingHeader](#onnonmatchingheader)|Action that should be taken when there is a header comment, but it does not match `mustMatch` or is less than `nonMatchingTolerance`|`"prepend"`|string|
|nonMatchingTolerance|Optional fallback for `mustMatch` compares a non-matching header comment (if it exists) to the resolved template using [Metric Longest Common Subsequence](http://heim.ifi.uio.no/~danielry/StringMetric.pdf). `1` means the strings must be exactly the same, where anything less is varying degrees of dissimiliar. `.70` seems like a good choice|**Optional**|number between 0 and 1|
|varRegexps|If `mustMatch` is not set and `template` is set, a regexp that will be replaced in the `template` to create a regexp for `mustMatch`|`{YEAR:/20\d{2}/}`|object|



### onNonMatchingHeader

* **prepend**: Prepends the fix template, if it exists, leaving the former header comment intact.
* **replace**: Replaces the former header comment with the fix template if it exists
* **report**: Does not apply fix, simply reports it based on the level assigned to the rule ("error" or "warn")

