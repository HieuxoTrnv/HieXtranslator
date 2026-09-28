const J_KEY = 'stock_journal';
function getJournal() { return JSON.parse(localStorage.getItem(J_KEY) || '[]'); }
function saveJournal(list) { localStorage.setItem(J_KEY, JSON.stringify(list)); renderJournal(); }

function addJournal() {
  const sym = document.getElementById('j-symbol').value.trim().toUpperCase();
  const action = document.getElementById('j-action').value;
  const price = +document.getElementById('j-price').value;
  const qty = +document.getElementById('j-qty').value;
  const reason = document.getElementById('j-reason').value;
  if (!sym || !price || !qty) return alert('Nhập đủ thông tin');
  const list = getJournal();
  list.push({ sym, action, price, qty, reason, date: new Date().toLocaleString('vi-VN') });
  saveJournal(list);
  ['j-symbol','j-price','j-qty','j-reason'].forEach(id => document.getElementById(id).value = '');
}

function removeJournal(i) {
  const list = getJournal();
  list.splice(i, 1);
  saveJournal(list);
}

function renderJournal() {
  const list = getJournal();
  document.querySelector('#j-table tbody').innerHTML = list.map((j, i) =>
    `<tr><td>${j.date}</td><td><b>${j.sym}</b></td>
     <td style="color:${j.action==='MUA'?'#4ade80':'#f87171'}">${j.action}</td>
     <td>${j.price.toLocaleString('vi-VN')}</td><td>${j.qty}</td><td>${j.reason || ''}</td>
     <td><button onclick="removeJournal(${i})">Xóa</button></td></tr>`).join('');
}

function exportJournal() {
  const blob = new Blob([JSON.stringify(getJournal(), null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'journal.json';
  a.click();
}
renderJournal();