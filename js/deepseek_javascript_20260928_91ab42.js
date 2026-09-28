const CL_ITEMS = [
  'Tôi hiểu rõ mô hình kinh doanh của công ty',
  'Công ty có lợi thế cạnh tranh (moat)',
  'Ban lãnh đạo có đạo đức và năng lực',
  'Tài chính lành mạnh (nợ thấp, dòng tiền dương)',
  'ROE > 15% trong 5 năm gần nhất',
  'Định giá hợp lý (P/E, P/B không quá cao)',
  'Có biên an toàn ít nhất 20%',
  'Tôi chấp nhận được nếu cổ phiếu giảm 30%',
  'Đây là khoản đầu tư dài hạn (>= 3 năm)',
  'Không vay margin để mua cổ phiếu này'
];

function initChecklist() {
  document.getElementById('cl-list').innerHTML = CL_ITEMS.map((item, i) =>
    `<label><input type="checkbox" id="cl-${i}"> ${item}</label>`).join('');
}

function evalChecklist() {
  const checked = CL_ITEMS.filter((_, i) => document.getElementById(`cl-${i}`).checked).length;
  const pct = (checked / CL_ITEMS.length) * 100;
  let advice = pct >= 80 ? '✅ Đủ điều kiện mua' : pct >= 60 ? '⚠️ Cân nhắc thêm' : '❌ Chưa nên mua';
  document.getElementById('cl-result').innerHTML = `<p><b>${checked}/${CL_ITEMS.length}</b> tiêu chí (${pct.toFixed(0)}%)</p><p>${advice}</p>`;
}
initChecklist();