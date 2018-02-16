/**
 * Shared lib between rule and tests
 */

const _ = require("lodash"),
  fs = require("fs"),
  findRoot = require("find-root"),
  path = require("path");

const COULD_NOT_FIND = `Could not find a match for the mustMatch pattern`;
const REPORT_AND_SKIP = `Found a header comment which did not match the mustMatch pattern, skipping fix and reporting`;

const ESCAPE = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;
const YEAR_REGEXP = /20\d{2}/;
const NON_MATCHING_HEADER_ACTIONS = ["prepend", "replace", "report"];

function escapeRegExp(str) {
  return String(str).replace(ESCAPE, "\\$&");
}

function stringifyRegexp(regexp) {
  return regexp instanceof RegExp ? regexp.source : String(regexp);
}

function regexpizeTemplate({ template, varRegexps }) {
  const allRegexpVars = Object.assign({}, { YEAR: YEAR_REGEXP }, varRegexps);
  const allPatternVars = _.mapValues(allRegexpVars, stringifyRegexp);
  return new RegExp(_.template(escapeRegExp(template))(allPatternVars));
}

function resolveTemplate({ templateFile, template, fileName }) {
  
  if(template) return template;
  if(!templateFile){
    throw new Error(`Either template or templateFile must be set`);
  }
  //Naively look for the templateFile first
  if(fs.existsSync(templateFile)){
    return fs.readFileSync(templateFile, "utf8");
  }
  if(!fs.existsSync(fileName)){
    throw new Error(`Could not find the file name ${fileName}. This is necessary to find the root`);
  }
  const root = findRoot(fileName);
  const rootTemplateFile = path.join(root,templateFile);
  if(fs.existsSync(rootTemplateFile)){
    return fs.readFileSync(rootTemplateFile, "utf8");
  }
  const absRootTemplateFile = path.resolve(rootTemplateFile);
  if(fs.existsSync(absRootTemplateFile)){
    return fs.readFileSync(absRootTemplateFile,"utf8");
  }
  throw new Error(`Can't find templateFile @ ${absRootTemplateFile}`);
}

function resolveOptions(
  { mustMatch, templateFile, template, templateVars, chars, onNonMatchingHeader, varRegexps, nonMatchingTolerance },
  fileName
) {
  onNonMatchingHeader = onNonMatchingHeader || "prepend";
  templateVars = templateVars || {};
  varRegexps = varRegexps || {};
  chars = chars || 1000;
  nonMatchingTolerance = nonMatchingTolerance || null;

  let mustMatchTemplate = false;
  if (!mustMatch) {
    mustMatchTemplate = true;
  } else if (!(mustMatch instanceof RegExp)) {
    mustMatch = new RegExp(mustMatch);
  }
  template = resolveTemplate({ templateFile, template, fileName });

  const YEAR = new Date().getFullYear();
  const allVars = Object.assign({}, { YEAR }, templateVars);

  if (mustMatchTemplate && template) {
    //create mustMatch from varRegexps and template
    mustMatch = regexpizeTemplate({ template, varRegexps });
  } else if (!template && mustMatchTemplate) {
    throw new Error("Either mustMatch, template, or templateFile must be set");
  }
  const resolvedTemplate = _.template(template)(allVars);

  return { resolvedTemplate, mustMatch, chars, onNonMatchingHeader, nonMatchingTolerance };
}

module.exports = { regexpizeTemplate, COULD_NOT_FIND, REPORT_AND_SKIP, resolveOptions };
