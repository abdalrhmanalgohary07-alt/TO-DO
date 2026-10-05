import*as S from"./store.js";import{home,subject,calendar,dataPage,printPage}from"./views.js";import{h,mark,closeSheet,pattern,onlineIcon,guessIcon}from"./ui.js";import{flushOutbox,msgsPage,onMsgs}from"./contact.js";
const chat=()=>{const e=h("span",{class:"chat"});e.innerHTML='<svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true"><path d="M9 3.5h6a6 6 0 0 1 6 6V11a6 6 0 0 1-6 6h-3.5L7 21v-4.3A6 6 0 0 1 3 11V9.5a6 6 0 0 1 6-6z" fill="currentColor"/><path d="M6.6 10.7l2 2 3.3-3.9" fill="none" stroke="var(--on-fg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.2 10h3M14.2 12.6h2" fill="none" stroke="var(--on-fg)" stroke-width="1.8" stroke-linecap="round"/><circle cx="19.6" cy="4.6" r="2.7" fill="#F59E0B" stroke="var(--paper)" stroke-width="1.2"/></svg>';return e};
const app=document.getElementById("app");let last="";
function render(){pattern(S.get().subjects);
  const[,r,a]=(location.hash.slice(1)||"/").split("/"),same=last===location.hash,y=scrollY;
  app.replaceChildren(r==="s"?subject(a):r==="cal"?calendar(a):r==="data"?dataPage():r==="print"?printPage(a):r==="msgs"?msgsPage():home());
  scrollTo(0,same?y:0);last=location.hash;
  const cur=r==="cal"?"cal":r==="data"||r==="print"?"data":r==="msgs"?"":"home";document.body.classList.toggle("on-msgs",r==="msgs");document.body.classList.toggle("on-print",r==="print");document.querySelectorAll(".tabs a").forEach(t=>t.classList.toggle("on",t.dataset.t===cur));
}
S.subscribe(render);onMsgs(()=>S.update(()=>{}));document.body.append(h("a",{class:"fab",href:"#/msgs","aria-label":"تواصل معي",title:"تواصل معي"},chat()));
addEventListener("hashchange",()=>{closeSheet();render()});
render();
const tried=new Set(),sweep=()=>{if(!navigator.onLine)return;S.get().subjects.filter(s=>s.auto&&s.icon[0]!=="@"&&!tried.has(s.id)&&!guessIcon(s.ar,s.en)).forEach(async s=>{tried.add(s.id);const i=await onlineIcon(s.ar,s.en);if(i)S.update(x=>{const t=x.subjects.find(y=>y.id===s.id);if(t&&t.auto)t.icon=i})})};
sweep();flushOutbox();addEventListener("online",()=>{tried.clear();sweep();flushOutbox()});
if("serviceWorker"in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
document.getElementById("theme").onclick=()=>setTheme(document.documentElement.dataset.theme==="dark"?"light":"dark",1);
