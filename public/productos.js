'use strict';
(async () => {
 const $ = id => document.getElementById(id);
 const form = $('filtros'), grid = $('catalogo'), status = $('estado');
 const norm = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 form.addEventListener('submit',e=>e.preventDefault());
 try {
  const response = await fetch('/',{cache:'no-cache'});
  if(!response.ok) throw new Error('Carga fallida');
  const doc = new DOMParser().parseFromString(await response.text(),'text/html');
  const products = Array.from(doc.querySelectorAll('#productos .producto'),(node,index)=>{
   const card = document.importNode(node,true);
   const type = card.querySelector('.categoria').textContent.trim();
   const price = Number(card.querySelector('.precio').textContent.replace(/\D/g,''));
   const raw = card.dataset.popularidad;
   return {card,index,type,price,text:norm(card.textContent),popularity:raw === undefined ? null : Number(raw)};
  });
  if(!products.length) throw new Error('Catálogo vacío');
  for(const type of new Set(products.map(p=>p.type))){
   const option = document.createElement('option'); option.value=type;option.textContent=type;$('tipo').append(option);
  }
  const update = () => {
   const low=$('minimo'),high=$('maximo');
   const min=low.value===''?0:Number(low.value),max=high.value===''?Infinity:Number(high.value);
   if(!low.validity.valid || !high.validity.valid || min>max){
    status.textContent='Revisa los precios: deben ser positivos o cero, y el mínimo no puede superar al máximo.';
    grid.replaceChildren();$('popularidad-nota').hidden=true;return;
   }
   const words=norm($('buscar').value).trim().split(/\s+/).filter(Boolean);
   const type=$('tipo').value,order=$('orden').value;
   const results=products.filter(p=>p.price>=min&&p.price<=max&&(!type||p.type===type)&&words.every(w=>p.text.includes(w)));
   const hasPopularity=products.every(p=>p.popularity!==null&&Number.isFinite(p.popularity));
   $('popularidad-nota').hidden=order!=='popularidad'||hasPopularity;
   results.sort((a,b)=>order==='asc'?a.price-b.price||a.index-b.index:order==='desc'?b.price-a.price||a.index-b.index:order==='popularidad'&&hasPopularity?b.popularity-a.popularity||a.index-b.index:a.index-b.index);
   grid.replaceChildren(...results.map(p=>p.card));
   status.textContent=results.length?`${results.length} producto${results.length===1?'':'s'} encontrado${results.length===1?'':'s'}.`:'No encontramos productos con esos filtros.';
  };
  form.addEventListener('input',update);form.addEventListener('change',update);
  form.addEventListener('reset',()=>setTimeout(update,0));update();
 } catch(error){
  status.textContent='No pudimos cargar los productos.';
  const link=document.createElement('a');link.href='/#productos';link.textContent='Ver catálogo de inicio';grid.replaceChildren(link);
 }
})();
