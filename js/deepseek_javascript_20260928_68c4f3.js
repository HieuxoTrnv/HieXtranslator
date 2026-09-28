let dChart;
function calcDCA() {
  const monthly = +document.getElementById('d-monthly').value;
  const r = +document.getElementById('d-rate').value / 100 / 12;
  const years = +document.getElementById('d-years').value;
  const months = years * 12;

  const labels = [], values = [];
  let total = 0;
  for (let i = 0; i <= months; i++) {
    if (i % 12 === 0) { labels.push('Năm ' + (i/12)); values.push(Math.round(total)); }
    total = (total + monthly) * (1 + r);
  }
  const invested = monthly * months;
  const profit = total - invested;

  document.getElementById('d-result').innerHTML = `
    <p><b>Tổng vốn:</b> ${invested.toLocaleString('vi-VN')} VNĐ</p>
    <p><b>Giá trị cuối:</b> ${Math.round(total).toLocaleString('vi-VN')} VNĐ</p>
    <p><b>Lợi nhuận:</b> <span style="color:#4ade80">${Math.round(profit).toLocaleString('vi-VN')} VNĐ</span></p>
  `;

  if (dChart) dChart.destroy();
  dChart = new Chart(document.getElementById('d-chart'), {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Giá trị (VNĐ)', data: values, backgroundColor: '#38bdf8' }] },
    options: { plugins: { legend: { labels: { color: '#e2e8f0' } } },
      scales: { x: { ticks: { color: '#94a3b8' } }, y: { ticks: { color: '#94a3b8' } } } }
  });
}