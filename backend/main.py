import os, base64, tempfile, shutil, subprocess, re
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI

app = FastAPI(title="Video Translator API", version="1.0.0")

ALLOWED_ORIGINS = [x.strip() for x in os.getenv("ALLOWED_ORIGINS", "*").split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "1024"))

def client_from_key(client_key: Optional[str]):
    key = client_key or OPENAI_API_KEY
    if not key:
        raise HTTPException(500, "Chưa cấu hình OPENAI_API_KEY trên backend.")
    return OpenAI(api_key=key)

def srt_time(seconds):
    ms = max(0, int(round(float(seconds)*1000)))
    h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def vtt_time(seconds):
    ms = max(0, int(round(float(seconds)*1000)))
    h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"

def clean_text(x):
    return re.sub(r"\s+", " ", str(x or "")).strip()

def make_srt(items):
    out=[]
    for i,x in enumerate(items,1):
        text=clean_text(x.get("translation") or x.get("text"))
        out += [str(i), f"{srt_time(x['start'])} --> {srt_time(x['end'])}", text, ""]
    return "\n".join(out)

def make_vtt(items):
    out=["WEBVTT",""]
    for x in items:
        out += [f"{vtt_time(x['start'])} --> {vtt_time(x['end'])}", clean_text(x.get("translation") or x.get("text")), ""]
    return "\n".join(out)

def escape_subtitle_path(p):
    return p.replace("\\","\\\\").replace(":","\\:").replace("'","\\'")

def burn_subtitles(video_path, srt_path, output_path):
    # Uses libass subtitle rendering. Font style is controlled here for a predictable output.
    vf = f"subtitles='{escape_subtitle_path(str(srt_path))}':force_style='FontName=Arial,FontSize=20,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=2,Shadow=1,Alignment=2,MarginV=36'"
    cmd=["ffmpeg","-y","-i",str(video_path),"-vf",vf,"-c:v","libx264","-preset","veryfast","-crf","20","-c:a","aac","-b:a","192k","-movflags","+faststart",str(output_path)]
    p=subprocess.run(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
    if p.returncode != 0:
        raise RuntimeError("FFmpeg lỗi: "+p.stderr[-3000:])

def whisper_transcribe(client, path, model):
    with open(path,"rb") as f:
        result=client.audio.transcriptions.create(
            model=model,
            file=f,
            response_format="verbose_json",
            timestamp_granularities=["segment"]
        )
    return [{"start":float(s.start),"end":float(s.end),"text":clean_text(s.text)} for s in result.segments]

def translate_segments(client, segments, model):
    # Translate in batches to reduce API overhead.
    batch_size=30
    result=[]
    for i in range(0,len(segments),batch_size):
        batch=segments[i:i+batch_size]
        payload="\n".join([f"{j}: {x['text']}" for j,x in enumerate(batch)])
        prompt=("Bạn là biên dịch viên phụ đề video. Dịch từ tiếng Anh sang tiếng Việt tự nhiên, "
                "ngắn gọn, đúng ngữ cảnh. Giữ nguyên số thứ tự ở đầu mỗi dòng. Không giải thích.\n\n"+payload)
        r=client.chat.completions.create(
            model=model,
            messages=[
                {"role":"system","content":"Translate English subtitle lines to natural Vietnamese. Preserve line IDs exactly."},
                {"role":"user","content":prompt}
            ],
            temperature=0.2
        )
        text=r.choices[0].message.content or ""
        mapping={}
        for line in text.splitlines():
            m=re.match(r"^\s*(\d+)\s*:\s*(.*)$",line)
            if m: mapping[int(m.group(1))]=m.group(2).strip()
        for j,x in enumerate(batch):
            y=dict(x);y["translation"]=mapping.get(j,x["text"]);result.append(y)
    return result

@app.get("/health")
def health():
    return {"status":"ok","service":"video-translator","ffmpeg":shutil.which("ffmpeg") is not None,"openai_configured":bool(OPENAI_API_KEY)}

@app.post("/api/translate")
async def translate_video(
    video: UploadFile = File(...),
    whisper_model: str = Form("whisper-1"),
    translation_model: str = Form("gpt-5-mini"),
    subtitle_style: str = Form("bottom"),
    client_api_key: Optional[str] = Form(None),
):
    if not video.filename:
        raise HTTPException(400,"Thiếu tên file.")
    allowed={"whisper-1"}
    if whisper_model not in allowed:
        raise HTTPException(400,"Whisper model không hợp lệ.")
    if not translation_model or len(translation_model)>100:
        raise HTTPException(400,"Translation model không hợp lệ.")

    client=client_from_key(client_api_key)
    work=Path(tempfile.mkdtemp(prefix="video_translator_"))
    try:
        inp=work / Path(video.filename).name
        with open(inp,"wb") as f:
            total=0
            while True:
                chunk=await video.read(1024*1024)
                if not chunk: break
                total += len(chunk)
                if total > MAX_UPLOAD_MB*1024*1024:
                    raise HTTPException(413,f"Video vượt quá {MAX_UPLOAD_MB} MB.")
                f.write(chunk)

        segments=whisper_transcribe(client,inp,whisper_model)
        translated=translate_segments(client,segments,translation_model)

        srt=make_srt(translated);vtt=make_vtt(translated)
        srt_path=work/"subtitles_vi.srt";out=work/"translated_vi.mp4"
        srt_path.write_text(srt,encoding="utf-8")
        burn_subtitles(inp,srt_path,out)

        return {
            "filename":video.filename,
            "subtitles":translated,
            "srt_base64":base64.b64encode(srt.encode("utf-8-sig")).decode(),
            "vtt_base64":base64.b64encode(vtt.encode("utf-8")).decode(),
            "video_base64":base64.b64encode(out.read_bytes()).decode(),
        }
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(500,str(e))
    finally:
        shutil.rmtree(work,ignore_errors=True)
