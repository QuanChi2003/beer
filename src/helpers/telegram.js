async function sendTelegramMessage(text){
  const token=process.env.TELEGRAM_BOT_TOKEN; const chatId=process.env.TELEGRAM_CHAT_ID;
  if(!token||!chatId){console.log('[TG MOCK]',text);return;}
  const url=`https://api.telegram.org/bot${token}/sendMessage`;
  const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text,parse_mode:'HTML'})});
  if(!res.ok){console.error('[TG ERROR]',await res.text());}
}
async function sendTelegramDocument(filePath, caption){
  const token=process.env.TELEGRAM_BOT_TOKEN; const chatId=process.env.TELEGRAM_CHAT_ID;
  if(!token||!chatId){console.log('[TG DOC MOCK]',filePath);return;}
  const FormData=(await import('form-data')).default; const fs=await import('fs');
  const form=new FormData(); form.append('chat_id',chatId); if(caption) form.append('caption',caption); form.append('document',fs.createReadStream(filePath));
  const url=`https://api.telegram.org/bot${token}/sendDocument`; const res=await fetch(url,{method:'POST',body:form});
  if(!res.ok){console.error('[TG DOC ERROR]',await res.text());}
}
module.exports={sendTelegramMessage,sendTelegramDocument};
