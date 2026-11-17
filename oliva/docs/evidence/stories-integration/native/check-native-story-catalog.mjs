#!/usr/bin/env node
// Static Metro JSON-module verification. Never imports or executes bundle code.
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { deepStrictEqual } from "node:assert";

const ROOT = "/workspace/faithpath-next";
const require = createRequire(path.join(ROOT, "package.json"));
const acorn = require("acorn");
const sha = (data) => createHash("sha256").update(data).digest("hex");
const fail = (code, detail = {}) => {
  const error = new Error(code);
  error.code = code;
  error.detail = detail;
  throw error;
};
const need = (test, code, detail = {}) => { if (!test) fail(code, detail); };
const keyName = (node) => node?.type === "Identifier" ? node.name :
  node?.type === "Literal" && ["string", "number"].includes(typeof node.value) ? String(node.value) : null;

function jsonLiteral(node) {
  if (node?.type === "Literal" && !node.regex && node.bigint === undefined &&
      (node.value === null || typeof node.value === "string" || typeof node.value === "boolean" ||
       typeof node.value === "number" && Number.isFinite(node.value))) return node.value;
  if (node?.type === "UnaryExpression" && node.operator === "-" &&
      node.argument?.type === "Literal" && typeof node.argument.value === "number" &&
      Number.isFinite(node.argument.value)) return -node.argument.value;
  if (node?.type === "ArrayExpression") return node.elements.map((item) => jsonLiteral(item));
  if (node?.type === "ObjectExpression") {
    const value = {};
    for (const item of node.properties) {
      need(item.type === "Property" && item.kind === "init" && !item.computed && !item.method && !item.shorthand,
        "UNSUPPORTED_JSON_PROPERTY");
      const key = keyName(item.key);
      need(key !== null && !Object.hasOwn(value, key), "UNSUPPORTED_OR_DUPLICATE_JSON_KEY");
      Object.defineProperty(value, key, { value: jsonLiteral(item.value), enumerable: true, configurable: true, writable: true });
    }
    return value;
  }
  fail("UNSUPPORTED_JSON_LITERAL");
}


function moduleLiteral(call) {
 const factory=call.arguments[0];
 if(factory?.type!=="FunctionExpression"||factory.body.type!=="BlockStatement"||factory.params[4]?.type!=="Identifier")return null;
 const statements=factory.body.body.filter(s=>s.type!=="EmptyStatement"&&!(s.type==="ExpressionStatement"&&typeof s.directive==="string"));
 if(statements.length!==1)return null;
 const expression=statements[0]?.type==="ExpressionStatement"?statements[0].expression:null;
 if(expression?.type!=="AssignmentExpression"||expression.operator!=="="||expression.left.type!=="MemberExpression"||expression.left.object.name!==factory.params[4].name||keyName(expression.left.property)!=="exports"||expression.left.computed&&expression.left.property.type!=="Literal")return null;
 if(expression.right.type!=="ObjectExpression")return null;
 const keys=expression.right.properties.map(p=>keyName(p.key));
 if(!keys.includes("units")&&!(keys.includes("questions")&&keys.includes("sourceVariants")))return null;
 need(call.arguments[2]?.type==="ArrayExpression"&&call.arguments[2].elements.length===0,"JSON_MODULE_HAS_DEPENDENCIES");
 return {moduleId:call.arguments[1]?.value,value:jsonLiteral(expression.right),start:call.start,end:call.end};
}
let report,reportPath;
try{
 const args=process.argv.slice(2),folders=[];
 while(args.length){const arg=args.shift();if(arg==="--report"){need(!reportPath&&args.length>0,"INVALID_REPORT");reportPath=path.resolve(args.shift());}else{need(!arg.startsWith("--"),"UNKNOWN_ARGUMENT");folders.push(arg);}}
 need(folders.length>0,"MISSING_EXPORTS");
 const sources=[];
 for(const name of ["story-index","story-questions"]){const file="src/data/"+name+".json",bytes=await fs.readFile(path.join(ROOT,file));sources.push({file,sha256:sha(bytes),bytes:bytes.length,value:JSON.parse(bytes)});}
 const units=sources[0].value.units,bank=sources[1].value;
 need(units.length===436&&Object.keys(bank.questions).length===2479&&Object.keys(bank.sourceVariants).length===95,"WRONG_ORIGINAL_COUNTS");
 need(new Set(units.map(u=>u.references[0].book)).size===66&&units.every(u=>u.reflection),"INCOMPLETE_CANON_OR_REFLECTIONS");
 const exports=[];
 for(const folder of folders){
  const base=path.resolve(folder),metadata=JSON.parse(await fs.readFile(path.join(base,"metadata.json"),"utf8"));
  for(const [platform,data] of Object.entries(metadata.fileMetadata).filter(([p])=>["android","ios"].includes(p))){
   need(data.bundle.endsWith(".js"),"JAVASCRIPT_EXPORT_REQUIRED");const file=path.resolve(base,data.bundle);need(file.startsWith(base+path.sep),"NONLOCAL_BUNDLE");
   const bytes=await fs.readFile(file),code=bytes.toString("utf8"),ast=acorn.parse(code,{ecmaVersion:"latest",sourceType:"script"});
   const calls=ast.body.filter(s=>s.type==="ExpressionStatement"&&s.expression.type==="CallExpression"&&s.expression.callee.name==="__d").map(s=>s.expression);
   const candidates=calls.map(moduleLiteral).filter(Boolean);need(candidates.length===2,"EXPECTED_TWO_ORIGINAL_STORY_MODULES",{candidates:candidates.length});
   const matches=[];
   for(const source of sources){const list=candidates.filter(c=>JSON.stringify(c.value)===JSON.stringify(source.value));need(list.length===1,"STORY_CATALOG_MISMATCH",{source:source.file,platform});deepStrictEqual(list[0].value,source.value);matches.push({source:source.file,moduleId:list[0].moduleId,fullDeepEquality:true,jsonSha256:sha(JSON.stringify(list[0].value))});}
   exports.push({platform,bundle:data.bundle,bundleSha256:sha(bytes),modulesScanned:calls.length,matches});
  }
 }
 need(exports.length===2&&new Set(exports.map(e=>e.platform)).size===2,"BOTH_PLATFORMS_REQUIRED");
 report={status:"PASS",checker:"static-metro-original-stories-v014",bundleCodeExecuted:false,deviceTest:false,simulatorTest:false,parser:`acorn@${acorn.version}`,counts:{units:436,questions:2479,reflectionPrompts:436,aliasPairs:95,books:66},sources:sources.map(({value,...s})=>s),exports};
}catch(e){report={status:"FAIL",bundleCodeExecuted:false,code:e.code??"CHECKER_ERROR",detail:e.detail??String(e)};process.exitCode=1;}
const output=JSON.stringify(report,null,2)+"\n";if(reportPath)await fs.writeFile(reportPath,output);process.stdout.write(output);
