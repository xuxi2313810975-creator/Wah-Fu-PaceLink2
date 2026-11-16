const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const route=require('./route.js');
const root=__dirname;
const port=Number(process.env.PORT)||4173;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json'};
http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api/route'){
    req.query=Object.fromEntries(url.searchParams);res.status=code=>(res.statusCode=code,res);res.json=value=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(value));};
    return route(req,res);
  }
  const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  try{const body=fs.readFileSync(file);res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(body);}catch{res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
