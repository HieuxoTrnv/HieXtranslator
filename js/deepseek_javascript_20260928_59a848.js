function calcDrawdown() {
  const value = +document.getElementById('dd-value').value;
  const drop = +document.getElementById('dd-drop').value;
  const after = value * (1 - drop / 100);
  const needRecover = ((value / after) - 1) * 100;
  const loss = value - after;
  document.getElementById('dd-result').innerHTML = `
    <p><b>Danh mục ban đầu:</b> ${value.toLocaleString('vi-VN')} VNĐ</p>
    <p><b>Sau khi giảm ${drop}%:</b> <span style="color:#f87171">${after.toLocaleString('vi-VN')} VNĐ</span></p>
    <p><b>Thiệt hại:</b> ${loss.toLocaleString('vi-VN')} VNĐ</p>
    <p><b>Cần tăng:</b> ${needRecover.toFixed(1)}% để hòa vốn</p>
  `;
}