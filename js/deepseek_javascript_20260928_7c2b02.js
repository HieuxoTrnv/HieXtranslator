const W_KEY = 'stock_watchlist';
function getWatch() { return JSON.parse(localStorage.getItem(W_KEY) || '[]'); }
function saveWatch(list) { localStorage.setItem(W_KEY, JSON.stringify(list)); renderWatch(); }

function addWatch() {
  const sym = document.getElementById('w-symbol').value.trim().toUpperCase();
  const price = +document.getElementById('w-price').value;
  if (!sym || !price) return alert('Nhập mã và giá');
  const list = getWatch();
  list.push({ sym, price, date: new Date().toLocaleDateString('vi-VN') });
  saveWatch(list);
  document.getElementById('w-symbol').value = '';
  document.getElementById('w-price').value = '';
}

function removeWatch(i) {
  const list = getWatch();
  list.splice(i, 1);
  saveWatch(list);
}

function renderWatch() {
  const list = getWatch();
  const tbody = document.querySelector('#w-table tbody');
  tbody.innerHTML = list.map((w, i) =>
    `<tr><td><b>${w.sym}</b></td><td>${w.price.toLocaleString('vi-VN')}</td><td>${w.date}</td>
     <td><button onclick="removeWatch(${i})">Xóa</button></td></tr>`).join('');
}
renderWatch();