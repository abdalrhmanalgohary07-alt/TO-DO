import{h,toast}from"./ui.js";import{CONTACT_URL,WEB3FORMS_KEY}from"./config.js";const ON=!!(WEB3FORMS_KEY||CONTACT_URL);
const K="todo_msgs",L="todo_last",get=()=>{try{return JSON.parse(localStorage.getItem(K))||[]}catch{return[]}},put=a=>{try{localStorage.setItem(K,JSON.stringify(a))}catch{}};
let busy=false,tick=()=>{};export const onMsgs=f=>{tick=f};
const post=async m=>{
  if(WEB3FORMS_KEY){const em=/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m.reply||"");const r=await fetch("https://api.web3forms.com/submit",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({access_key:WEB3FORMS_KEY,subject:"رسالة جديدة من تطبيق To Do",from_name:"To Do",name:m.name||"-",message:m.message+"\n\n—\nالاسم: "+(m.name||"-")+"\nللرد: "+(m.reply||"-"),...(em?{replyto:m.reply}:{})})});const j=await r.json().catch(()=>({}));if(j.success===true)return true;throw new Error(j.message||"send failed")}
  const r=await fetch(CONTACT_URL,{method:"POST",redirect:"follow",body:JSON.stringify({id:m.id,message:m.message,name:m.name,reply:m.reply})});if(!r.ok)throw new Error("http "+r.status);const t=await r.text();try{return JSON.parse(t).ok===true}catch{throw new Error("not json")}};
export async function flushOutbox(){
  if(busy||!ON||!navigator.onLine)return 0;busy=true;let n=0;
  for(const m of get().filter(x=>!x.sent)){try{if(!await post(m))break;put(get().map(x=>x.id===m.id?{...x,sent:true,sentAt:new Date().toISOString()}:x));n++}catch{break}}
  busy=false;if(n)tick();return n;
}
const fmt=d=>new Date(d).toLocaleString("ar-EG-u-nu-latn",{day:"numeric",month:"long",year:"numeric",hour:"numeric",minute:"2-digit"});
export function msgsPage(){
  const name=h("input",{placeholder:"اسمك (اختياري)",maxLength:60,autocomplete:"name"}),
    reply=h("input",{placeholder:"إيميلك أو رقمك عشان أرد عليك (اختياري)",maxLength:80,dir:"ltr"}),
    msg=h("textarea",{placeholder:"اكتب اقتراحك أو التعديل اللي عايزه...",rows:4,maxLength:1500,required:true,"aria-label":"رسالتك"}),
    hp=h("input",{tabIndex:-1,autocomplete:"off","aria-hidden":"true",style:"position:absolute;opacity:0;pointer-events:none;height:0;min-height:0;padding:0;border:0"}),
    list=get().reverse();
  const send=async e=>{e.preventDefault();const t=msg.value.trim();if(!t||hp.value)return;
    if(Date.now()-(+localStorage.getItem(L)||0)<30000)return toast("استنى شوية قبل رسالة تانية");
    put([...get(),{id:Math.random().toString(36).slice(2),message:t,name:name.value.trim(),reply:reply.value.trim(),at:new Date().toISOString(),sent:false}]);
    try{localStorage.setItem(L,Date.now())}catch{}tick();
    toast(!ON?"الإرسال مش متفعّل لسه (المفتاح فاضي في config.js) — الرسالة محفوظة":await flushOutbox()?"وصلت رسالتك — شكرًا ليك":"الرسالة اتحفظت وهتتبعت أول ما النت يرجع")};
  const retry=async()=>toast(!ON?"المفتاح فاضي في config.js":await flushOutbox()?"الرسالة اتبعتت":"لسه مقدرتش أبعت — اتأكد من النت والرابط");
  return h("div",{class:"view"},h("a",{class:"back",href:"#/"},"→ الرئيسية"),
    h("div",{},h("h1",{},"تواصل معي"),h("p",{class:"muted"},"ابعت اقتراح أو طلب تعديل — بيوصلني مباشرة من التطبيق ومفيش إيميل ظاهر لأي حد.")),
    h("form",{class:"card stack msgform",onsubmit:send},name,reply,msg,hp,h("button",{class:"btn primary"},"إرسال")),
    h("div",{class:"sec"},h("h2",{},"رسايلك"),h("small",{class:"muted"},list.length?String(list.length):"")),
    list.length?h("div",{class:"msgs"},...list.map(m=>h("article",{class:"msg"},
      h("div",{class:"mh"},h("small",{class:"muted"},fmt(m.at)),h("span",{class:"st "+(m.sent?"ok":"wait")},m.sent?"اتبعتت":"في انتظار الإرسال")),
      h("p",{},m.message),
      h("div",{class:"ma"},m.sent?null:h("button",{class:"btn",type:"button",onclick:retry},"إعادة المحاولة"),
        h("button",{class:"icon",title:"حذف","aria-label":"حذف",onclick:()=>{put(get().filter(x=>x.id!==m.id));tick()}},"✕"))))):h("p",{class:"empty"},"لسه مبعتّش أي رسالة."));
}
