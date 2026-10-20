(function(){
const STORAGE_KEY='sobreestimulados-encuesta-v1';
const options=Array.from(document.querySelectorAll('.poll-option'));
const status=document.querySelector('.survey-status');
if(!options.length||!status)return;
const votes=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
function total(){return Object.values(votes).reduce((a,b)=>a+b,0)}
function render(){
const sum=total();
let winner=null,max=-1;
options.forEach(option=>{
const key=option.dataset.option;
const count=votes[key]||0;
const percent=sum?Math.round((count/sum)*100):0;
option.querySelector('.option-percent').textContent=percent+'%';
option.querySelector('.option-bar').style.setProperty('--porcentaje',percent+'%');
option.classList.remove('winner','selected');
if(count>max){max=count;winner=option}
});
if(sum>0&&winner)winner.classList.add('winner');
const saved=localStorage.getItem(STORAGE_KEY+'-vote');
if(saved){
const selected=options.find(option=>option.dataset.option===saved);
if(selected)selected.classList.add('selected');
status.textContent='¡Gracias por votar! Tu opinión quedó registrada en este dispositivo.';
}else{
status.textContent='Vota para ver los resultados.';
}
}
options.forEach(option=>{
option.addEventListener('click',()=>{
const key=option.dataset.option;
const previous=localStorage.getItem(STORAGE_KEY+'-vote');
if(previous===key)return;
if(previous)votes[previous]=Math.max(0,(votes[previous]||0)-1);
votes[key]=(votes[key]||0)+1;
localStorage.setItem(STORAGE_KEY,JSON.stringify(votes));
localStorage.setItem(STORAGE_KEY+'-vote',key);
render();
});
});
render();
})();
