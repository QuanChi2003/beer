const nodemailer=require('nodemailer');
const host=process.env.SMTP_HOST,port=parseInt(process.env.SMTP_PORT||'587',10);
const user=process.env.SMTP_USER,pass=process.env.SMTP_PASS;
const from=process.env.SENDER_EMAIL||'no-reply@example.com';
let transporter=null;
if(host&&user&&pass){transporter=nodemailer.createTransport({host,port,secure:false,auth:{user,pass}});}
async function sendMail(to,subject,html){if(!transporter){console.log('[MAIL MOCK]',{to,subject});return;}await transporter.sendMail({from,to,subject,html});}
module.exports={sendMail};
