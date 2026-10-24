(function(){
'use strict';
if(!document.querySelector('.header-wrapper')||document.querySelector('.announcement-bar'))return;
const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href='/anuncios.css?v=2';document.head.append(stylesheet);
const bar=document.createElement('aside');bar.className='announcement-bar';bar.setAttribute('aria-label','Ubicación y descuento para estudiantes');
const readable=document.createElement('p');readable.className='announcement-readable';readable.textContent='Punta Arenas, Magallanes, CL, Chile. Si estudias Medicina en la UMAG, utiliza tu código "CEM-UMAG10" para obtener un 10%.';
const viewport=document.createElement('div');viewport.className='announcement-viewport';viewport.setAttribute('aria-hidden','true');
const track=document.createElement('div');track.className='announcement-track';
for(let i=0;i<2;i++){
 const group=document.createElement('div');group.className='announcement-group';
 for(let j=0;j<4;j++){
  const location=document.createElement('span');location.className='announcement-location';location.textContent='Punta Arenas, Magallanes, CL';
  const flag=document.createElement('img');flag.src='/bandera-chile.svg';flag.alt='';flag.width=21;flag.height=14;flag.className='announcement-flag';location.append(flag);
  const separator=document.createElement('span');separator.className='announcement-separator';separator.textContent='•';
  const offer=document.createElement('span');offer.textContent='Si estudias Medicina en la UMAG, utiliza tu código "CEM-UMAG10" para obtener un 10%.';
  group.append(location,separator,offer,separator.cloneNode(true));
 }
 track.append(group);
}
viewport.append(track);bar.append(readable,viewport);document.body.prepend(bar);document.documentElement.classList.add('has-announcement');
let pending=false;
function updateOffset(){document.documentElement.style.setProperty('--announcement-offset',Math.max(0,bar.getBoundingClientRect().bottom)+'px');pending=false;}
function schedule(){if(!pending){pending=true;requestAnimationFrame(updateOffset);}}
window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});
stylesheet.addEventListener('load',schedule);window.addEventListener('pageshow',schedule);if(window.ResizeObserver)new ResizeObserver(schedule).observe(bar);updateOffset();
})();

(function(){
'use strict';
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
})();
