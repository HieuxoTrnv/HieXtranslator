async function runScreener() {
  const pe = +document.getElementById('s-pe').value;
  const pb = +document.getElementById('s-pb').value;
  const roe = +document.getElementById('s-roe').value;
  const yld = +document.getElementById('s-yield').value;

  const res = await fetch('data/stocks.json');
  const stocks = await res.json();
  const filtered = stocks.filter(s => s.pe <= pe && s.pb <= pb && s.roe >= roe && s.yield >= yld);

  document.getElementById('s-result').innerHTML = filtered.length
    ? `<table><thead><tr><th>Mã</th><th>Tên</th><th>P/E</th><th>P/B</th><th>ROE</th><th>Yield</th><th>Giá</th></tr></thead>
       <tbody>${filtered.map(s => `<tr><td><b>${s.symbol}</b></td><td>${s.name}</td><td>${s.pe}</td><td>${s.pb}</td><td>${s.roe}%</td><td>${s.yield}%</td><td>${s.price.toLocaleString('vi-VN')}</td></tr>`).join('')}</tbody></table>`
    : '<p>Không có cổ phiếu nào thỏa mãn.</p>';
}