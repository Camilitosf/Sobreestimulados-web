'use strict';
(async () => {
 const $ = id => document.getElementById(id);
 const form=$('filtros'),grid=$('catalogo'),status=$('estado');
 const norm=t=>t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 form.addEventListener('submit',e=>e.preventDefault());
 const known={'kit-sutura-a.jpg':{folder:'kit-sutura-modelo-s',price:20000},'kit-sutura-x.jpg':{folder:'kit-sutura-modelo-x',price:23000},'pines-broches.jpg':{folder:'pines-broches',price:3000}};
 function gallery(card,images){
  const img=card.querySelector('.foto-producto');
  if(!img||!images.length)return;
  const original=img.src,alt=img.alt;
  const urls=images.filter(u=>typeof u==='string'&&u.startsWith('/productos/')&&!u.startsWith('//')&&!u.split('/').includes('..'));
  if(!urls.length)return;
  const box=document.createElement('div');box.className='galeria';box.setAttribute('role','group');box.setAttribute('aria-label',`Fotos de ${alt}`);
  img.replaceWith(box);box.append(img);
  let index=0;
  const counter=document.createElement('span');counter.className='contador';counter.setAttribute('aria-live','polite');
  const prev=document.createElement('button'),next=document.createElement('button');
  prev.type=next.type='button';prev.textContent='‹';next.textContent='›';prev.className='anterior';next.className='siguiente';prev.setAttribute('aria-label',`Foto anterior de ${alt}`);next.setAttribute('aria-label',`Foto siguiente de ${alt}`);
  function show(i){index=Math.max(0,Math.min(urls.length-1,i));img.src=urls[index];img.alt=`${alt}, imagen ${index+1} de ${urls.length}`;counter.textContent=`${index+1} / ${urls.length}`;prev.disabled=index===0;next.disabled=index===urls.length-1;}
  img.addEventListener('error',()=>{if(img.getAttribute('src')!==original){img.src=original;img.alt=alt;counter.textContent='Imagen no disponible';}});
  if(urls.length>1){box.tabIndex=0;box.append(prev,next,counter);prev.addEventListener('click',()=>show(index-1));next.addEventListener('click',()=>show(index+1));box.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();show(index+(e.key==='ArrowRight'?1:-1));}});
   let last='';box.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||e.target.closest('button'))return;const r=box.getBoundingClientRect(),x=(e.clientX-r.left)/r.width;const zone=x<0.25?'left':x>0.75?'right':'';if(zone&&zone!==last)show(index+(zone==='right'?1:-1));last=zone;});box.addEventListener('pointerleave',()=>{last='';});
  }
  show(0);
 }
 try{
  const response=await fetch('/index.html',{cache:'no-store'});if(!response.ok)throw new Error('Catálogo no disponible');
  const doc=new DOMParser().parseFromString(await response.text(),'text/html');
  const products=Array.from(doc.querySelectorAll('#productos .producto'),(node,index)=>{
   const card=document.importNode(node,true),img=card.querySelector('img');
   const file=img?decodeURIComponent(new URL(img.getAttribute('src'),location.origin).pathname.split('/').pop()):'';
   const info=known[file];const priceNode=card.querySelector('.precio');
   const raw=card.dataset.precio;
   const price=raw!==undefined?Number(raw):info?info.price:Number((priceNode?.textContent.match(/[\d.]+/)||[''])[0].replace(/\./g,''));
   if(!Number.isFinite(price)||price<0)throw new Error('Precio inválido');
   card.dataset.precio=String(price);
   return {card,index,price,type:card.querySelector('.categoria')?.textContent.trim()||'Otros',text:norm(card.textContent),folder:card.dataset.producto||info?.folder,popularity:card.dataset.popularidad===undefined?null:Number(card.dataset.popularidad)};
  });
  if(!products.length)throw new Error('Catálogo vacío');
  for(const type of new Set(products.map(p=>p.type))){const opt=document.createElement('option');opt.value=opt.textContent=type;$('tipo').append(opt);}
  function update(){
   const low=$('minimo'),high=$('maximo'),min=low.value===''?0:Number(low.value),max=high.value===''?Infinity:Number(high.value);
   if(!low.validity.valid||!high.validity.valid||min>max){status.textContent='Revisa el precio mínimo y máximo.';grid.replaceChildren();$('popularidad-nota').hidden=true;return;}
   const words=norm($('buscar').value).trim().split(/\s+/).filter(Boolean),type=$('tipo').value,order=$('orden').value;
   const results=products.filter(p=>p.price>=min&&p.price<=max&&(!type||p.type===type)&&words.every(w=>p.text.includes(w)));
   const ranked=products.every(p=>p.popularity!==null&&Number.isFinite(p.popularity));
   $('popularidad-nota').hidden=order!=='popularidad'||ranked;
   if(order==='asc')results.sort((a,b)=>a.price-b.price||a.index-b.index);
   else if(order==='desc')results.sort((a,b)=>b.price-a.price||a.index-b.index);
   else if(order==='popularidad'&&ranked)results.sort((a,b)=>b.popularity-a.popularity||a.index-b.index);
   else results.sort((a,b)=>a.index-b.index);
   grid.replaceChildren(...results.map(p=>p.card));status.textContent=results.length?`${results.length} producto${results.length===1?'':'s'} encontrado${results.length===1?'':'s'}.`:'No encontramos productos con esos filtros.';
  }
  for(const id of ['buscar','minimo','maximo'])$(id).addEventListener('input',update);
  for(const id of ['tipo','orden'])$(id).addEventListener('change',update);
  form.addEventListener('reset',()=>setTimeout(update,0));update();
  try{const res=await fetch('/productos/manifest.json',{cache:'no-store'});if(!res.ok)throw new Error('Manifest pendiente');const manifest=await res.json();for(const p of products){const images=manifest.products?.[p.folder];if(Array.isArray(images))gallery(p.card,images);}}
  catch(error){console.warn('Se conservan las fotos originales:',error);}
 }catch(error){console.error(error);status.textContent='No pudimos cargar el catálogo.';const link=document.createElement('a');link.href='/#productos';link.textContent='Ver catálogo de inicio';grid.replaceChildren(link);}
})();
