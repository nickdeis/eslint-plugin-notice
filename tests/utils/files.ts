/**
 * Copyright (c) 2024, Nick Deis
 */

import path from "path";
import fs from "fs";
import { normalizeLineEndings } from "../../src/utils/strings";

/**
 * Since we norm the output of templates, we need to norm the expected output of --fix
 */
export function readAndNormalize(rpath: string, rootDir: string = __dirname) {
  return normalizeLineEndings(fs.readFileSync(path.join(rootDir, rpath), "utf8"));
}

export function templateFile(name: string) {
  return readAndNormalize(`/templates/${name}.js`);
}

export function templateFilePath(name: string) {
  return path.join(__dirname, `/templates/${name}.js`);
}
