// 1) افتح script.google.com بحسابك ← New project ← الصق الكود ده
// 2) Deploy ← New deployment ← Web app ← Execute as: Me ← Who has access: Anyone
// 3) انسخ رابط الـ Web app (بينتهي بـ /exec) والصقه في config.js
// الرسايل بتوصل لإيميل حسابك، والإيميل مش بيظهر في التطبيق ولا في الكود بتاعه.
function doPost(e){
  try{
    const d=JSON.parse(e.postData.contents),m=String(d.message||"").trim().slice(0,1500);
    if(!m)return out(false);
    const r=String(d.reply||"").trim().slice(0,80),n=String(d.name||"").trim().slice(0,60),o={
      to:Session.getEffectiveUser().getEmail(),
      subject:"رسالة جديدة من تطبيق To Do",
      body:m+"\n\n—\nالاسم: "+(n||"-")+"\nللرد: "+(r||"-")
    };
    if(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r))o.replyTo=r;
    MailApp.sendEmail(o);
    return out(true);
  }catch(err){return out(false)}
}
function out(ok){return ContentService.createTextOutput(JSON.stringify({ok:ok})).setMimeType(ContentService.MimeType.JSON)}

// شغّل الدالة دي مرة واحدة من المحرر (Run) عشان تدّي صلاحية إرسال الإيميل، وتتأكد إن الإيميل بيوصل.
// بعد أي تعديل في الكود: Deploy ← Manage deployments ← Edit ← Version: New version ← Deploy.
function testMail(){
  MailApp.sendEmail(Session.getEffectiveUser().getEmail(),"تجربة To Do","لو وصلتك الرسالة دي يبقى الإرسال شغال.");
}
