const fs=require('fs'); const path=require('path'); const PDFDocument=require('pdfkit'); const QRCode=require('qrcode'); const {money}=require('./money');
async function generateInvoicePDF(orderId,data){
  const fname=`invoice_${orderId}.pdf`; const full=path.join('/tmp',fname);
  const doc=new PDFDocument({size:'A4',margin:50}); const ws=fs.createWriteStream(full); doc.pipe(ws);
  doc.fontSize(18).text('HÓA ĐƠN ĐẶT MÓN – Beer Cầu Gẫy',{align:'center'}); doc.moveDown(.5);
  doc.fontSize(12).text(`Mã đơn: #${orderId}`); doc.text(`Ngày: ${new Date(data.orderAt).toLocaleString('vi-VN')}`);
  doc.text(`Chi nhánh: ${data.branch_id}`); doc.text(`Loại: ${data.type==='dine-in'?'Tại bàn':'Giao hàng'}`);
  if(data.type==='dine-in'){doc.text(`Bàn: ${data.table_number}`);} else {doc.text(`Khách: ${data.delivery_name}`);doc.text(`SĐT: ${data.delivery_phone}`);doc.text(`Địa chỉ: ${data.delivery_address}`);}
  doc.moveDown();
  try{const url=(process.env.APP_URL||'https://example.vercel.app')+'/orders'; const dataUrl=await QRCode.toDataURL(url); const b64=dataUrl.split(',')[1]; const buf=Buffer.from(b64,'base64'); doc.image(buf,{width:90,align:'right'});}catch(e){}
  doc.moveDown(); doc.text('Danh sách món:'); data.items.forEach(i=> doc.text(`• ${i.name} x${i.qty} — ${money(i.sale_price*i.qty)}`));
  doc.moveDown(); doc.text(`Tạm tính: ${money(data.subtotalSale)}`); if(data.discount) doc.text(`Giảm giá: -${money(data.discount)}`);
  doc.text(`Tổng: ${money(data.total)}`); doc.text(`Lợi nhuận (ước tính): ${money(data.profit)}`); doc.text('Ghi chú: Quán sẽ tính phí ship riêng tuỳ theo nơi.');
  doc.end(); await new Promise((resolve,reject)=>{ws.on('finish',resolve); ws.on('error',reject);}); return full;
}
module.exports={generateInvoicePDF};
