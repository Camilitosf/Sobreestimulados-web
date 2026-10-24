'use strict';
const header=document.querySelector('#home-header'),logo=document.querySelector('.logo-portada');
if(header&&logo){const small=logo.cloneNode();small.className='logo-header';small.alt='';header.append(small);new IntersectionObserver(([entry])=>{header.classList.toggle('compacto',!entry.isIntersecting&&logo.getBoundingClientRect().top<0);},{threshold:0}).observe(logo);}
const poll=document.querySelector('#encuesta');
if(poll){
 const css=document.createElement('link');css.rel='stylesheet';css.href='/poll.css?v=2';document.head.append(css);
 poll.innerHTML='<div class="poll-layout"><div class="poll-card"><h2 id="pregunta">¿Qué te gustaría ver próximamente?</h2><div id="poll-options" aria-label="Opciones de la encuesta"></div><form id="poll-other" hidden><label for="poll-text">¿Qué producto? (máx. 50 caracteres)</label><div class="poll-entry"><input id="poll-text" type="text" maxlength="50" required placeholder="Escribe tu idea" autocomplete="off"><button type="submit">Votar</button></div></form><p id="poll-status" role="status" aria-live="polite">Cargando…</p><details class="poll-privacy"><summary>Privacidad</summary><p>Participación voluntaria. Guardamos tu voto y una cookie funcional por 180 días. Tu sugerencia es privada: no incluyas datos personales. Borrar cookies o cambiar de navegador permite volver a votar.</p></details></div><blockquote class="poll-quote">Con tus opiniones nos ayudas a traer productos que estudiantes como tú en realidad necesitan</blockquote></div>';
 const options=poll.querySelector('#poll-options'),other=poll.querySelector('#poll-other'),text=poll.querySelector('#poll-text'),status=poll.querySelector('#poll-status');
 const labels={A:'Fonendoscopios',B:'Más Pines/Broches',C:'Portatarjetas',D:'Otra opción'},buttons={};
 let busy=true,voted=false;
 for(const [key,label] of Object.entries(labels)){
  const button=document.createElement('button');button.type='button';button.className='poll-choice';button.disabled=true;button.dataset.option=key;
  const fill=document.createElement('span');fill.className='poll-fill';fill.setAttribute('aria-hidden','true');
  const name=document.createElement('span');name.className='poll-label';name.textContent=label;
  const percent=document.createElement('span');percent.className='poll-percent';percent.hidden=true;
  button.append(fill,name,percent);options.append(button);buttons[key]=button;
  button.addEventListener('click',()=>{if(busy||voted)return;if(key==='D'){other.hidden=false;text.focus();return;}other.hidden=true;send(key,'');});
 }
 function lock(value){busy=value;for(const button of Object.values(buttons))button.disabled=value||voted;other.querySelector('button').disabled=value||voted;text.disabled=value||voted;}
 function render(data){
  if(!data.voted)throw new Error('No se confirmó el voto. Intenta otra vez.');
  voted=true;lock(false);other.hidden=true;poll.classList.add('poll-voted');
  for(const [key,button] of Object.entries(buttons)){const percent=data.total?Math.round(100*(data.counts[key]||0)/data.total):0;button.classList.toggle('poll-mine',key===data.choice);button.querySelector('.poll-percent').hidden=false;button.querySelector('.poll-percent').textContent=percent+'%';button.setAttribute('aria-label',labels[key]+': '+percent+'%');requestAnimationFrame(()=>{button.querySelector('.poll-fill').style.width=percent+'%';});}
  status.textContent='¡Gracias por votar!';
 }
 async function request(options={}){const response=await fetch('/api/encuesta',{cache:'no-store',...options});const data=await response.json();if(!response.ok)throw new Error(data.error||'No se pudo enviar.');return data;}
 async function send(option,suggestion){if(busy||voted)return;lock(true);status.textContent='Guardando…';try{render(await request({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({option,suggestion})}));}catch(error){lock(false);status.textContent=error.message;}}
 other.addEventListener('submit',event=>{event.preventDefault();const suggestion=text.value.trim();if(!suggestion||suggestion.length>50){text.setCustomValidity('Escribe entre 1 y 50 caracteres.');text.reportValidity();return;}send('D',suggestion);});
 text.addEventListener('input',()=>text.setCustomValidity(''));
 request().then(data=>{if(data.voted)render(data);else{lock(false);status.textContent='Toca una opción para votar';}}).catch(()=>{status.textContent='Encuesta no disponible por ahora.';});
}
