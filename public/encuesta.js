(function(){
'use strict';
const options=Array.from(document.querySelectorAll('.poll-option'));
const status=document.querySelector('.survey-status');
if(options.length&&status)initPoll();
initMenu();

function initPoll(){
 let busy=true,voted=false;
 function lock(value){busy=value;options.forEach(option=>{option.disabled=value||voted;});}
 function render(data){
  voted=true;lock(false);
  const counts=data.counts||{},total=data.total||0,max=Math.max(0,...Object.values(counts));
  options.forEach(option=>{
   const key=option.dataset.option,count=counts[key]||0,percent=total?Math.round(100*count/total):0;
   option.querySelector('.option-percent').textContent=percent+'%';
   option.querySelector('.option-bar').style.setProperty('--porcentaje',percent+'%');
   option.classList.toggle('selected',key===data.choice);
   option.classList.toggle('winner',max>0&&count===max);
   option.setAttribute('aria-pressed',String(key===data.choice));
  });
  status.textContent='¡Gracias por votar! Resultados con '+total+(total===1?' voto.':' votos.');
 }
 async function request(init){
  const response=await fetch('/api/encuesta',{cache:'no-store',credentials:'same-origin',...init});
  let data={};try{data=await response.json();}catch{}
  if(!response.ok)throw new Error(data.error||'No se pudo enviar.');
  return data;
 }
 options.forEach(option=>option.addEventListener('click',async()=>{
  if(busy||voted)return;
  lock(true);status.textContent='Guardando…';
  try{
   const data=await request({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({option:option.dataset.option})});
   if(!data.voted)throw new Error('No se confirmó el voto. Intenta otra vez.');
   render(data);
  }catch(error){lock(false);status.textContent=error.message;}
 }));
 lock(true);status.textContent='Cargando…';
 request().then(data=>{
  if(data.voted)render(data);
  else{lock(false);status.textContent='Toca una opción para votar y ver los resultados.';}
 }).catch(()=>{lock(true);status.textContent='Encuesta no disponible por ahora.';});
}

function initMenu(){
 const nav=document.querySelector('.nav-principal'),box=document.querySelector('.header-derecha');
 if(!nav||!box)return;
 nav.id='nav-principal';
 const button=document.createElement('button');
 button.type='button';button.className='menu-toggle';
 button.setAttribute('aria-label','Abrir menú');
 button.setAttribute('aria-expanded','false');
 button.setAttribute('aria-controls','nav-principal');
 button.innerHTML='<span></span><span></span><span></span>';
 box.append(button);
 const close=()=>{nav.classList.remove('abierto');button.setAttribute('aria-expanded','false');};
 button.addEventListener('click',()=>{const open=nav.classList.toggle('abierto');button.setAttribute('aria-expanded',String(open));});
 nav.addEventListener('click',event=>{if(event.target.closest('a'))close();});
 document.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
}
})();
