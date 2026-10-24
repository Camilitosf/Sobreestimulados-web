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
