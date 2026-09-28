# Video Translator — Whisper + AI + FFmpeg

Full-stack web app dịch video tiếng Anh → tiếng Việt.

## Thành phần

- Frontend: `index.html`, `style.css`, `app.js` — deploy GitHub Pages.
- Backend: FastAPI + OpenAI Whisper + AI translation + FFmpeg.
- Whisper lấy transcript có timestamp.
- AI dịch transcript sang tiếng Việt.
- FFmpeg burn phụ đề tiếng Việt vào video MP4.
- API trả về video MP4, SRT, VTT và danh sách subtitle.

## 1. Chạy backend bằng Docker

Tạo `.env` từ `.env.example` và đặt:

```env
OPENAI_API_KEY=sk-...
ALLOWED_ORIGINS=https://YOUR_GITHUB_USERNAME.github.io
MAX_UPLOAD_MB=1024
```

Build:

```bash
docker build -t video-translator-backend .
```

Run:

```bash
docker run --rm -p 8000:8000 --env-file .env video-translator-backend
```

Backend:
`http://localhost:8000`

Health:
`http://localhost:8000/health`

## 2. Chạy backend không dùng Docker

Máy phải cài FFmpeg và libass.

```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 3. Deploy frontend lên GitHub Pages

Đưa 3 file frontend lên repository:

- index.html
- style.css
- app.js

Mở trang GitHub Pages, nhập URL backend vào ô `Địa chỉ Backend API`, sau đó bấm `Kiểm tra`.

## Bảo mật

Không commit `OPENAI_API_KEY` vào GitHub.

Backend hiện hỗ trợ gửi `client_api_key` từ frontend để thử nghiệm, nhưng production nên tắt cách này và chỉ dùng `OPENAI_API_KEY` ở server.

## Lưu ý

Video được upload lên backend để Whisper xử lý. Backend giữ file trong thư mục tạm và xóa sau khi request hoàn thành.

FFmpeg đang burn subtitle thành chữ cứng vào video. Đây là quy trình CPU-intensive; với video dài cần máy chủ có đủ CPU/RAM/disk.

Nếu muốn xử lý video rất dài hoặc nhiều người dùng đồng thời, nên chuyển API sang hàng đợi job (Redis/Celery/RQ) và lưu kết quả vào object storage thay vì trả cả video dưới dạng base64 trong một HTTP response.
