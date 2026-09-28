function calcDividend() {
  const price = +document.getElementById('dv-price').value;
  const div = +document.getElementById('dv-div').value;
  const shares = +document.getElementById('dv-shares').value;
  const g = +document.getElementById('dv-growth').value / 100;
  const years = +document.getElementById('dv-years').value;

  const initialYield = (div / price) * 100;
  let totalDiv = 0, currentDiv = div;
  const rows = [];
  for (let i = 1; i <= years; i++) {
    const yearDiv = currentDiv * shares;
    totalDiv += yearDiv;
    const yieldOnCost = (currentDiv / price) * 100;
    rows.push(`<tr><td>Năm ${i}</td><td>${Math.round(yearDiv).toLocaleString('vi-VN')}</td><td>${yieldOnCost.toFixed(2)}%</td><td>${Math.round(totalDiv).toLocaleString('vi-VN')}</td></tr>`);
    currentDiv *= (1 + g);
  }

  document.getElementById('dv-result').innerHTML = `
    <p><b>Yield ban đầu:</b> ${initialYield.toFixed(2)}%</p>
    <p><b>Tổng cổ tức ${years} năm:</b> ${Math.round(totalDiv).toLocaleString('vi-VN')} VNĐ</p>
    <table><thead><tr><th>Năm</th><th>Cổ tức/năm</th><th>Yield on cost</th><th>Lũy kế</th></tr></thead>
    <tbody>${rows.join('')}</tbody></table>
  `;
}