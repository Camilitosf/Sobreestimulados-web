import {readFile,writeFile} from 'node:fs/promises';
const file=new URL('../public/index.html',import.meta.url);
let html=await readFile(file,'utf8');
html=html.replace('<header>','<header id="home-header">');
html=html.replace('<h2 id="titulo-productos">Nuestros productos</h2>','<h2 id="titulo-productos"><a href="/productos.html">Nuestros productos</a></h2>');
if(!html.includes('id="encuesta"')){
 const poll=await readFile(new URL('./encuesta.html',import.meta.url),'utf8');
 html=html.replace('<section id="comunidad"',poll+'\n<section id="comunidad"');
}
if(!html.includes('/home.js?v=1'))html=html.replace('</head>','<link rel="stylesheet" href="/home.css?v=1"><script src="/home.js?v=1" defer></script></head>');
await writeFile(file,html);
