import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

/** Local test resource; can switch releases on one origin for real SW updates. */
export async function testServer(initialRoot) {
  let root=path.resolve(initialRoot);
  const server=http.createServer((req,res)=>{
    try {
      const url=new URL(req.url,'http://localhost');
      const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
      if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
      const target=file===root?path.join(root,'index.html'):file;
      const ext=path.extname(target), types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'};
      res.setHeader('Content-Type',types[ext]||'application/octet-stream');
      res.setHeader('Cache-Control','no-store');
      fs.readFile(target,(error,body)=>{if(error){res.writeHead(404);res.end();}else res.end(body);});
    } catch {res.writeHead(400);res.end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  return {url:`http://127.0.0.1:${server.address().port}/`,setRoot(next){root=path.resolve(next);},
    close:()=>new Promise(resolve=>server.close(resolve))};
}
