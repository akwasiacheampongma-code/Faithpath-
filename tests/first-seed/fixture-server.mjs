/** Loopback-only QA server; can close its actual TCP listener to prove cached use.
 * No control endpoint, no deployment, no personal storage access. */
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
export async function fixtureServer(directory){
 const root=path.resolve(directory),headers={},types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.webp':'image/webp','.svg':'image/svg+xml','.ttf':'font/ttf','.png':'image/png','.txt':'text/plain'};
 for(const line of fs.readFileSync(root+'/_headers','utf8').split('\n').slice(1)){if(!line.startsWith('  '))break;const i=line.indexOf(':');if(i>0)headers[line.slice(0,i).trim()]=line.slice(i+1).trim()}
 const server=http.createServer((req,res)=>{let file;try{const url=new URL(req.url,'http://local');file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(file===root)file+='/index.html';if(!file.startsWith(root+'/'))throw new Error();}catch{res.writeHead(400);res.end();return}if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('missing QA asset');return}res.writeHead(200,{...headers,'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(res)});
 let port=0,online=false;const connect=async()=>{if(online)return;await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));port=server.address().port;online=true};const disconnect=async()=>{if(!online)return;const done=new Promise(resolve=>server.close(resolve));server.closeAllConnections();await done;online=false};await connect();return {url:'http://127.0.0.1:'+port,connect,disconnect};
}
