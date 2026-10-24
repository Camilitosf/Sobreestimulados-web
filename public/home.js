'use strict';
const poll=document.querySelector('#encuesta');
if(poll){
 const css=document.createElement('link');css.rel='stylesheet';css.href='/poll.css?v=2';document.head.append(css);
 poll.innerHTML='<div class="poll-layout"><div class="poll-card"><h2 id="pregunta">¿Qué te gustaría ver próximamente?</h2><div id="poll-options" aria-label="Opciones de la encuesta"></div><form id="poll-other" hidden><label for="poll-text">¿Qué producto? (máx. 50 caracteres)</label><div class="poll-entry"><input id="poll-text" type="text" maxlength="50" required placeholder="Escribe tu idea" autocomplete="off"><button type="submit">Votar</button></div></form><p id="poll-status" role="status" aria-live="polite">Cargando…</p><div id="poll-actions" hidden style="text-align:center;margin-top:8px"><button type="button" id="poll-change">Cambiar voto</button><span aria-hidden="true"> · </span><button type="button" id="poll-delete">Eliminar voto</button><button type="button" id="poll-cancel" hidden>Cancelar cambio</button></div><details class="poll-privacy"><summary>Privacidad</summary><p>Participación voluntaria. Guardamos tu voto y una cookie funcional por 180 días. Puedes cambiar o eliminar tu voto desde este navegador. Tu sugerencia es privada: no incluyas datos personales. Borrar cookies o cambiar de navegador permite volver a votar.</p></details></div><blockquote class="poll-quote">Con tus opiniones nos ayudas a traer productos que estudiantes como tú en realidad necesitan</blockquote></div>';
 const options=poll.querySelector('#poll-options'),other=poll.querySelector('#poll-other'),text=poll.querySelector('#poll-text'),status=poll.querySelector('#poll-status'),actions=poll.querySelector('#poll-actions'),change=poll.querySelector('#poll-change'),remove=poll.querySelector('#poll-delete'),cancel=poll.querySelector('#poll-cancel');
 for(const button of [change,remove,cancel])button.style.cssText='background:transparent;border:0;border-radius:4px;color:#c7c7c7;font:inherit;font-size:.75rem;text-decoration:underline;text-underline-offset:3px;padding:6px;min-height:32px;margin:0;cursor:pointer';
 const labels={A:'Fonendoscopios',B:'Más Pines/Broches',C:'Portatarjetas',D:'Otra opción'},buttons={};
 let busy=true,voted=false,editing=false,lastData=null;
 function lock(value){busy=value;for(const button of Object.values(buttons))button.disabled=value||(voted&&!editing);other.querySelector('button').disabled=value;text.disabled=value;for(const button of [change,remove,cancel])button.disabled=value;}
 function render(data){
  voted=Boolean(data.voted);editing=false;lastData=data;other.hidden=true;actions.hidden=!voted;change.hidden=false;cancel.hidden=true;poll.classList.toggle('poll-voted',voted);
  for(const [key,button] of Object.entries(buttons)){
   const percent=data.total?Math.round(100*(data.counts[key]||0)/data.total):0;
   button.classList.toggle('poll-mine',voted&&key===data.choice);button.setAttribute('aria-pressed',String(voted&&key===data.choice));
   button.querySelector('.poll-percent').hidden=!voted;button.querySelector('.poll-percent').textContent=percent+'%';
   button.setAttribute('aria-label',labels[key]+(voted?': '+percent+'%':''));button.querySelector('.poll-fill').style.width=(voted?percent:0)+'%';
  }
  lock(false);status.textContent=voted?'¡Gracias por votar!':'Toca una opción para votar';
 }
 async function request(init={}){const response=await fetch('/api/encuesta',{cache:'no-store',credentials:'same-origin',...init});const data=await response.json();if(!response.ok)throw new Error(data.error||'No se pudo completar la solicitud.');return data;}
 async function send(option,suggestion){if(busy||(voted&&!editing))return;lock(true);status.textContent='Guardando…';try{const data=await request({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({option,suggestion})});if(!data.voted)throw new Error('No se confirmó el voto. Intenta otra vez.');render(data);}catch(error){lock(false);status.textContent=error.message;}}
 for(const [key,label] of Object.entries(labels)){
  const button=document.createElement('button');button.type='button';button.className='poll-choice';button.dataset.option=key;
  const fill=document.createElement('span');fill.className='poll-fill';fill.setAttribute('aria-hidden','true');
  const name=document.createElement('span');name.className='poll-label';name.textContent=label;
  const percent=document.createElement('span');percent.className='poll-percent';percent.hidden=true;
  button.append(fill,name,percent);options.append(button);buttons[key]=button;
  button.addEventListener('click',()=>{if(busy||(voted&&!editing))return;if(key==='D'){other.hidden=false;text.focus();return;}other.hidden=true;send(key,'');});
 }
 change.addEventListener('click',()=>{if(busy)return;editing=true;change.hidden=true;cancel.hidden=false;lock(false);status.textContent='Elige otra opción. Tu voto actual se conserva hasta confirmar el nuevo.';buttons.A.focus();});
 cancel.addEventListener('click',()=>{if(!busy){render(lastData);change.focus();}});
 remove.addEventListener('click',async()=>{if(busy||!window.confirm('¿Eliminar tu voto de la encuesta?'))return;lock(true);status.textContent='Eliminando voto…';try{render(await request({method:'DELETE'}));status.textContent='Voto eliminado. Puedes volver a votar.';}catch(error){lock(false);status.textContent=error.message;}});
 other.addEventListener('submit',event=>{event.preventDefault();const suggestion=text.value.trim();if(!suggestion||suggestion.length>50){text.setCustomValidity('Escribe entre 1 y 50 caracteres.');text.reportValidity();return;}send('D',suggestion);});
 text.addEventListener('input',()=>text.setCustomValidity(''));
 lock(true);request().then(render).catch(()=>{status.textContent='Encuesta no disponible por ahora.';});
}
