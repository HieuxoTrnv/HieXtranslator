const $=s=>document.querySelector(s);
const apiUrl=$("#apiUrl"), videoInput=$("#videoInput"), fileName=$("#fileName"), preview=$("#preview");
const translateBtn=$("#translateBtn"), testBtn=$("#testBtn"), serverText=$("#serverText"), dot=$("#dot");
const progressBar=$("#progressBar"), progressText=$("#progressText"), stage=$("#stage"), logEl=$("#log");
const resultCard=$("#resultCard"), resultVideo=$("#resultVideo"), videoDownload=$("#videoDownload"), srtDownload=$("#srtDownload"), vttDownload=$("#vttDownload"), subtitleList=$("#subtitleList");

apiUrl.value=localStorage.getItem("vt_api_url")||"http://localhost:8000";
function log(s){logEl.textContent+=s+"\n";logEl.scrollTop=logEl.scrollHeight}
function setProgress(n,msg){n=Math.max(0,Math.min(100,n));progressBar.style.width=n+"%";progressText.textContent=Math.round(n)+"%";if(msg)stage.textContent=msg}
async function testServer(){
  const base=apiUrl.value.trim().replace(/\/$/,""); localStorage.setItem("vt_api_url",base);
  try{
    const r=await fetch(base+"/health"); const d=await r.json();
    serverText.textContent=d.status==="ok"?"Backend online":"Backend phản hồi";
    dot.style.background="#37e28b"; log("✓ Backend: "+JSON.stringify(d));
    return true;
  }catch(e){serverText.textContent="Không kết nối backend";dot.style.background="#e55353";log("✕ Không kết nối: "+e.message);return false}
}
testBtn.onclick=testServer;
videoInput.onchange=()=>{
  const f=videoInput.files[0]; if(!f)return;
  fileName.textContent=f.name; preview.src=URL.createObjectURL(f); preview.hidden=false; translateBtn.disabled=false;
};

function renderSubs(items){
  subtitleList.innerHTML="";
  items.forEach((x,i)=>{
    const div=document.createElement("div");div.className="subline";
    div.innerHTML=`<small>#${i+1} · ${fmt(x.start)} → ${fmt(x.end)}</small><b>EN:</b> ${esc(x.text)}<br><span><b>VI:</b> ${esc(x.translation||"")}</span>`;
    subtitleList.appendChild(div);
  });
}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function fmt(sec){sec=Number(sec||0);const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=Math.floor(sec%60),ms=Math.round((sec-Math.floor(sec))*1000);return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}.${String(ms).padStart(3,"0")}`}
function blobUrl(base64,mime){const bin=atob(base64),arr=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);return URL.createObjectURL(new Blob([arr],{type:mime}))}

async function translate(){
  const file=videoInput.files[0];if(!file)return;
  const base=apiUrl.value.trim().replace(/\/$/,""); localStorage.setItem("vt_api_url",base);
  translateBtn.disabled=true;resultCard.hidden=true;logEl.textContent="";
  setProgress(3,"Đang tải video lên backend…");log("Video: "+file.name);
  const fd=new FormData();fd.append("video",file);fd.append("whisper_model",$("#whisperModel").value);fd.append("translation_model",$("#translationModel").value);fd.append("subtitle_style",$("#subtitleStyle").value);
  const key=$("#clientKey").value.trim();if(key)fd.append("client_api_key",key);
  try{
    const r=await fetch(base+"/api/translate", {method:"POST",body:fd});
    if(!r.ok){let t=await r.text();throw new Error(t)}
    setProgress(70,"Backend đang xử lý…"); const d=await r.json();
    setProgress(100,"Hoàn tất.");log("✓ Đã xử lý xong.");
    renderSubs(d.subtitles||[]);
    const vu=blobUrl(d.video_base64,"video/mp4"), su=blobUrl(d.srt_base64,"text/plain;charset=utf-8"), wu=blobUrl(d.vtt_base64,"text/vtt;charset=utf-8");
    resultVideo.src=vu;videoDownload.href=vu;videoDownload.download=(file.name.replace(/\.[^.]+$/,"")+"_vi.mp4");
    srtDownload.href=su;srtDownload.download="subtitles_vi.srt";vttDownload.href=wu;vttDownload.download="subtitles_vi.vtt";
    resultCard.hidden=false;resultCard.scrollIntoView({behavior:"smooth"});
  }catch(e){setProgress(0,"Có lỗi.");log("✕ "+e.message);alert("Lỗi: "+e.message)}
  finally{translateBtn.disabled=false}
}
translateBtn.onclick=translate;
setProgress(0,"Sẵn sàng. Nhập URL backend rồi kiểm tra kết nối.");
