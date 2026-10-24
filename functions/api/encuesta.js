const choices=['A','B','C','D'];
const reply=(data,status=200,cookie)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(cookie?{'Set-Cookie':cookie}:{})}});
const sha256=async text=>{const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');};
export async function onRequest({request,env}){
 if(!['GET','POST'].includes(request.method))return reply({error:'Método no permitido'},405);
 if(!env.ENCUESTA_DB)return reply({error:'Encuesta pendiente de configuración'},503);
 const origin=new URL(request.url).origin;
 if(request.method==='POST'&&request.headers.get('Origin')!==origin)return reply({error:'Origen no permitido'},403);
 let token=(request.headers.get('Cookie')||'').match(/(?:^|;\s*)se_poll=([a-f0-9]{64})(?:;|$)/)?.[1];
 const hadCookie=Boolean(token);
 if(!token){const bytes=crypto.getRandomValues(new Uint8Array(32));token=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');}
 const cookie=`se_poll=${token}; Path=/api/encuesta; Max-Age=15552000; HttpOnly; Secure; SameSite=Lax`;
 try{
  const key=await sha256(token);
  if(request.method==='POST'){
   if(!hadCookie)return reply({error:'Recarga la página y permite la cookie funcional para votar.'},400,cookie);
   if(!(request.headers.get('Content-Type')||'').startsWith('application/json'))return reply({error:'Formato no permitido'},415);
   const raw=await request.text();if(new TextEncoder().encode(raw).length>2048)return reply({error:'Respuesta demasiado larga'},413);
   let data;try{data=JSON.parse(raw);}catch{return reply({error:'Respuesta inválida'},400);}
   if(!data||!choices.includes(data.option))return reply({error:'Elige una opción válida'},400);
   const suggestion=data.option==='D'&&typeof data.suggestion==='string'?data.suggestion.trim():'';
   if(data.option==='D'&&(!suggestion||suggestion.length>50))return reply({error:'Escribe entre 1 y 50 caracteres'},400);
   await env.ENCUESTA_DB.prepare('INSERT INTO votos (token, opcion, sugerencia) VALUES (?, ?, ?) ON CONFLICT(token) DO NOTHING').bind(key,data.option,suggestion).run();
  }
  const mine=await env.ENCUESTA_DB.prepare('SELECT opcion FROM votos WHERE token=?').bind(key).first();
  if(!mine)return reply({voted:false},200,cookie);
  const rows=await env.ENCUESTA_DB.prepare('SELECT opcion, COUNT(*) AS n FROM votos GROUP BY opcion').all();
  const counts=Object.fromEntries(choices.map(c=>[c,0]));
  for(const row of rows.results)if(choices.includes(row.opcion))counts[row.opcion]=Number(row.n);
  return reply({voted:true,choice:mine.opcion,counts,total:Object.values(counts).reduce((a,b)=>a+b,0)},200,cookie);
 }catch(error){console.error('Encuesta:',error.message);return reply({error:'Encuesta temporalmente no disponible'},503,cookie);}
}
