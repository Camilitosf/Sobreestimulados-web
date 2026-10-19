import { readdir, mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const source=path.join(root,'productos'),output=path.join(root,'public'),target=path.join(output,'productos');
const sortNames=(a,b)=>a.name.localeCompare(b.name,'es',{numeric:true});
async function build(){
 await import('./home.mjs');
 await readFile(path.join(output,'index.html'),'utf8');
 await mkdir(source,{recursive:true});await mkdir(target,{recursive:true});
 const products=Object.create(null);let total=0;
 for(const folder of (await readdir(source,{withFileTypes:true})).filter(e=>e.isDirectory()&&!e.name.startsWith('.')).sort(sortNames)){
  const input=path.join(source,folder.name),images=[];
  for(const file of (await readdir(input,{withFileTypes:true})).filter(e=>e.isFile()&&!e.name.startsWith('.')&&/\.(avif|webp|png|jpe?g)$/i.test(e.name)).sort(sortNames)){
   await mkdir(path.join(target,folder.name),{recursive:true});await copyFile(path.join(input,file.name),path.join(target,folder.name,file.name));
   images.push(`/productos/${encodeURIComponent(folder.name)}/${encodeURIComponent(file.name)}`);total++;
  }
  products[folder.name]=images;console.log(`${folder.name}: ${images.length} imágenes`);
 }
 await writeFile(path.join(target,'manifest.json'),JSON.stringify({version:1,products},null,2)+'\n');
 await readFile(path.join(output,'Favicon Sobreestimulados.png'));
 await readFile(path.join(output,'ajustes.css'));
 async function prepare(directory){
  for(const entry of await readdir(directory,{withFileTypes:true})){
   const file=path.join(directory,entry.name);
   if(entry.isDirectory())await prepare(file);
   else if(entry.isFile()&&/\.html$/i.test(entry.name)){
    let html=await readFile(file,'utf8');
    if(!/<link\b[^>]*\brel\s*=\s*["'][^"']*\bicon\b[^"']*["']/i.test(html))html=html.replace(/<\/head\s*>/i,'<link rel="icon" type="image/png" href="/Favicon%20Sobreestimulados.png?v=1">\n</head>');
    if(!html.includes('href="/ajustes.css?v=visual-1"'))html=html.replace(/<\/head\s*>/i,'<link rel="stylesheet" href="/ajustes.css?v=visual-1">\n</head>');
    if(path.relative(output,file)==='productos.html'){
     if(!html.includes('class="pagina-productos"'))html=html.replace('<body>','<body class="pagina-productos">');
     html=html.replace('<a href="/">← Volver a Sobreestimulados</a>','<a class="home-link" href="/" aria-label="Home, volver al inicio"><span aria-hidden="true">⌂</span> Home</a>');
     if(!html.includes('class="logo-productos"'))html=html.replace('<h1>Productos</h1>','<img class="logo-productos" src="/Logo%20SE%20png.png" alt="Logo de Sobreestimulados" width="153"><h1>Productos</h1>');
    }
    await writeFile(file,html);
   }
  }
 }
 await prepare(output);console.log(`Build listo: ${total} imágenes; favicon y ajustes visuales aplicados.`);
}
build().catch(error=>{console.error('Error de build:',error);process.exitCode=1;});
