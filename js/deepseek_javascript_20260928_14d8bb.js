let cChart;
function calcCompound() {
  const P = +document.getElementById('c-initial').value;
  const yearly = +document.getElementById('c-yearly').value;
  const r = +document.getElementById('c-rate').value / 100;
  const n = +document.getElementById('c-years').value;

  const labels = [], values = [];
  let total = P;
  for (let i = 0; i <= n; i++) {
    labels.push('Năm ' + i);
    values.push(Math.round(total));
    total = total * (1 + r) + yearly;
  }
  const final = values[n];
  const invested = P + yearly * n;
  const profit = final - invested;

  document.getElementById('c-result').innerHTML = `
    <p><b>Tổng vốn bỏ vào:</b> ${invested.toLocaleString('vi-VN')} VNĐ</p>
    <p><b>Giá trị cuối kỳ:</b> ${final.toLocaleString('vi-VN')} VNĐ</p>
    <p><b>Lợi nhuận:</b> <span style="color:#4ade80">${profit.toLocaleString('vi-VN')} VNĐ</span></p>
    <p><b>Tỷ suất:</b> ${((final/invested - 1) * 100).toFixed(1)}%</p>
  `;

  if (cChart) cChart.destroy();
  cChart = new Chart(document.getElementById('c-chart'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Giá trị danh mục (VNĐ)',
        data: values,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56,189,248,0.15)',
        fill: true, tension: 0.3
      }]
    },
    options: { plugins: { legend: { labels: { color: '#e2e8f0' } } },
      scales: { x: { ticks: { color: '#94a3b8' } }, y: { ticks: { color: '#94a3b8' } } } }
  });
}