# Stock Tools

Bộ công cụ web tĩnh cho nhà đầu tư chứng khoán.

## Cách chạy
1. Mở file `index.html` bằng trình duyệt.
2. Hoặc chạy local server: `python -m http.server 8000`

## Tính năng
- Máy tính lãi kép, DCA, cổ tức
- Screener cổ phiếu (từ data/stocks.json)
- Watchlist & nhật ký giao dịch (localStorage)
- Checklist trước khi mua
- Mô phỏng drawdown

## Cập nhật dữ liệu
Sửa file `data/stocks.json` để thêm/sửa cổ phiếu.

## Nén thành zip
```bash
zip -r stock-tools.zip stock-tools/
