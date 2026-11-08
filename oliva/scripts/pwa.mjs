import { cp, readFile, writeFile, mkdir } from "node:fs/promises";
await cp("assets/pwa","dist",{recursive:true});
const notices=await readFile("THIRD_PARTY_NOTICES.md","utf8");
await writeFile("dist/THIRD_PARTY_NOTICES.txt",notices);
await mkdir("dist/licenses",{recursive:true});
for (const [source,name] of [["LICENSE","MIT.txt"],["THIRD_PARTY_NOTICES.md","THIRD_PARTY_NOTICES.txt"],["assets/fonts/DMSans-OFL.txt","DMSans-OFL.txt"],["assets/fonts/CormorantGaramond-OFL.txt","CormorantGaramond-OFL.txt"]]) await cp(source,"dist/licenses/"+name);
let html=await readFile("dist/index.html","utf8");
html=html.replace(/<link\b[^>]*rel="(?:manifest|icon|apple-touch-icon)"[^>]*>/g,"")
  .replace(/<meta\b[^>]*name="(?:theme-color|apple-mobile-web-app-capable|apple-mobile-web-app-title)"[^>]*>/g,"");
html=html.replace(/<html\b([^>]*)>/,(_,attributes)=>`<html${attributes.replace(/\s+lang="[^"]*"/,"")} lang="de">`);
html=html.replace(/(<meta name="viewport"[^>]+content=")([^"]*)"/,(all,start,content)=>`${start}${content.includes("viewport-fit")?content:content+", viewport-fit=cover"}"`);
html=html.replace("</head>",'<link rel="manifest" href="/manifest.webmanifest"><link rel="icon" href="/icon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><meta name="theme-color" content="#314c3b"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="OLIVA"></head>');
await writeFile("dist/index.html",html);
console.log("OLIVA PWA: manifest, icons, German metadata and rights notices included.");
