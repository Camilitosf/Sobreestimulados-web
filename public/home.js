'use strict';
const header=document.querySelector('#home-header'),logo=document.querySelector('.logo-portada');
if(header&&logo){const small=logo.cloneNode();small.className='logo-header';small.alt='';header.append(small);new IntersectionObserver(([entry])=>{header.classList.toggle('compacto',!entry.isIntersecting&&logo.getBoundingClientRect().top<0);},{threshold:0}).observe(logo);}
const form=document.querySelector('#votacion');
if(form){
 const field=form.querySelector('fieldset'),text=document.querySelector('#sugerencia'),status=document.querySelector('#voto-estado'),results=document.querySelector('#voto-resultados');
 const labels={A:'Fonendoscopios',B:'Más Pines/Broches',C:'Portatarjetas',D:'Otra opción'};
 function render(data){
  if(!data.voted)return;field.disabled=true;results.hidden=false;results.replaceChildren();
  const total=document.createElement('p');total.textContent=`${data.total} respuestas en total (incluida la tuya).`;results.append(total);
  for(const key of Object.keys(labels)){const row=document.createElement('p'),bar=document.createElement('progress');const percent=data.total?100*(data.counts[key]||0)/data.total:0;row.textContent=`${key}. ${labels[key]}: ${percent.toFixed(1)}%`;bar.max=100;bar.value=percent;bar.setAttribute('aria-label',row.textContent);results.append(row,bar);}
  status.textContent='Gracias por participar. Los porcentajes pueden sumar 99,9% o 100,1% por redondeo.';
 }
 async function request(options){const response=await fetch('/api/encuesta',{cache:'no-store',...options});const data=await response.json();if(!response.ok)throw new Error(data.error||'No se pudo enviar.');return data;}
 form.addEventListener('change',()=>{const other=new FormData(form).get('opcion')==='D';text.disabled=!other;text.required=other;});
 form.addEventListener('submit',async event=>{event.preventDefault();const option=new FormData(form).get('opcion'),suggestion=option==='D'?text.value.trim():'';field.disabled=true;status.textContent='Enviando…';try{render(await request({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({option,suggestion})}));}catch(error){field.disabled=false;status.textContent=error.message;}});
 request().then(data=>{if(data.voted)render(data);else{field.disabled=false;status.textContent='Elige una opción para participar.';}}).catch(()=>{status.textContent='Encuesta temporalmente no disponible. Vuelve más tarde.';});
}
