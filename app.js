"use strict";

const videoInput=document.getElementById("videoInput");
const videoInput2=document.getElementById("videoInput2");
const subtitleInput=document.getElementById("subtitleInput");
const videoPlayer=document.getElementById("videoPlayer");
const videoPlaceholder=document.getElementById("videoPlaceholder");
const videoName=document.getElementById("videoName");
const subtitleList=document.getElementById("subtitleList");
const subtitleCount=document.getElementById("subtitleCount");
const editorCount=document.getElementById("editorCount");
const videoSubtitle=document.getElementById("videoSubtitle");
const currentTime=document.getElementById("currentTime");
const duration=document.getElementById("duration");
const statusText=document.getElementById("statusText");
const statusDot=document.getElementById("statusDot");
const progressBar=document.getElementById("progressBar");
const translateAllBtn=document.getElementById("translateAllBtn");
const copyAllBtn=document.getElementById("copyAllBtn");
const downloadSrtBtn=document.getElementById("downloadSrtBtn");
const downloadVttBtn=document.getElementById("downloadVttBtn");
const addSubtitleBtn=document.getElementById("addSubtitleBtn");
const searchInput=document.getElementById("searchInput");
const clearSearchBtn=document.getElementById("clearSearchBtn");
const shiftBackBtn=document.getElementById("shiftBackBtn");
const shiftForwardBtn=document.getElementById("shiftForwardBtn");
const sortSubtitleBtn=document.getElementById("sortSubtitleBtn");
const clearSubtitleBtn=document.getElementById("clearSubtitleBtn");
const saveProjectBtn=document.getElementById("saveProjectBtn");
const loadProjectBtn=document.getElementById("loadProjectBtn");
const projectInput=document.getElementById("projectInput");
const fontSizeSelect=document.getElementById("fontSizeSelect");
const fontColorInput=document.getElementById("fontColorInput");
const subtitleBgSelect=document.getElementById("subtitleBgSelect");
const positionSelect=document.getElementById("positionSelect");

let subtitles=[];
let activeSubtitleId=null;
let currentVideoUrl=null;

function createId(){return Date.now().toString(36)+Math.random().toString(36).substring(2,9)}
function escapeHtml(value){return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}
function formatTime(seconds){seconds=Number(seconds)||0;const h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60),s=Math.floor(seconds%60),ms=Math.round(seconds%1*1000);return String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0")+","+String(ms).padStart(3,"0")}
function parseTime(str){if(!str)return 0;const p=str.trim().replace(".",",").split(":");if(p.length!==3)return 0;const ms=Number(String((p[2].split(",")[1]||"0")).padEnd(3,"0").slice(0,3));return Number(p[0])*3600+Number(p[1])*60+Number(p[2].split(",")[0])+ms/1000}
function formatVttTime(seconds){return formatTime(seconds).replace(",",".")}
function formatClock(seconds){seconds=Number(seconds)||0;return String(Math.floor(seconds/3600)).padStart(2,"0")+":"+String(Math.floor(seconds%3600/60)).padStart(2,"0")+":"+String(Math.floor(seconds%60)).padStart(2,"0")}
function showToast(message){document.querySelector(".toast")?.remove();const t=document.createElement("div");t.className="toast";t.textContent=message;document.body.appendChild(t);setTimeout(()=>t.remove(),2800)}
function setStatus(message,type="normal"){statusText.textContent=message;statusDot.className="status-dot";if(type==="loading")statusDot.classList.add("loading");if(type==="error")statusDot.classList.add("error")}
function updateProgress(value){progressBar.style.width=`${Math.max(0,Math.min(100,value))}%`}

function handleVideoFile(file){if(!file)return;if(currentVideoUrl)URL.revokeObjectURL(currentVideoUrl);currentVideoUrl=URL.createObjectURL(file);videoPlayer.src=currentVideoUrl;videoPlayer.load();videoPlaceholder.classList.add("hidden");videoName.textContent=file.name;setStatus(`Đã tải video: ${file.name}`);showToast("Đã tải video")}
videoInput.addEventListener("change",e=>handleVideoFile(e.target.files[0]));
videoInput2.addEventListener("change",e=>handleVideoFile(e.target.files[0]));
videoPlayer.addEventListener("loadedmetadata",()=>duration.textContent=formatClock(videoPlayer.duration));
videoPlayer.addEventListener("timeupdate",()=>{currentTime.textContent=formatClock(videoPlayer.currentTime);updateVideoSubtitle()});

subtitleInput.addEventListener("change",e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{const parsed=parseSubtitleFile(r.result,file.name);subtitles=parsed.map(x=>({...x,id:createId(),vi:x.vi||""}));activeSubtitleId=null;renderSubtitles();setStatus(`Đã import ${subtitles.length} dòng phụ đề`);showToast(`Đã import ${subtitles.length} dòng`)}catch(err){console.error(err);setStatus("Không thể đọc file phụ đề","error");showToast("File SRT/VTT không hợp lệ")}};r.readAsText(file,"UTF-8")});

function parseSubtitleFile(text,filename){text=text.replace(/\r\n/g,"\n").replace(/\r/g,"\n").replace(/^\uFEFF/,"");if(filename.toLowerCase().endsWith(".vtt")||text.trim().startsWith("WEBVTT"))text=text.replace(/^WEBVTT[^\n]*\n/i,"");return text.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean).map(block=>{const lines=block.split("\n"),i=lines.findIndex(x=>x.includes("-->"));if(i<0)return null;const times=lines[i].split("-->");if(times.length<2)return null;const start=parseSubtitleTime(times[0].trim()),end=parseSubtitleTime(times[1].trim().split(/\s+/)[0]),en=stripSubtitleTags(lines.slice(i+1).filter(Boolean).join("\n"));return en?{start,end,en,vi:""}:null}).filter(Boolean)}
function parseSubtitleTime(v){v=v.trim();if(v.includes(":")){const p=v.split(":");if(p.length===3)return Number(p[0])*3600+Number(p[1])*60+Number(p[2].replace(",","."))}return Number(v)||0}
function stripSubtitleTags(t){return t.replace(/<[^>]*>/g,"").replace(/\{\\[^}]*\}/g,"").trim()}

function renderSubtitles(){subtitleCount.textContent=`${subtitles.length} dòng`;editorCount.textContent=`${subtitles.length} dòng`;if(!subtitles.length){subtitleList.innerHTML=`<div class="empty-editor"><div class="empty-icon">📝</div><h3>Chưa có phụ đề</h3><p>Import file SRT/VTT để bắt đầu</p></div>`;return}const k=searchInput.value.trim().toLowerCase();const filtered=subtitles.filter(x=>!k||x.en.toLowerCase().includes(k)||x.vi.toLowerCase().includes(k));subtitleList.innerHTML=filtered.map(renderSubtitleRow).join("");attachRowEvents();updateActiveRow()}
function renderSubtitleRow(item){const i=subtitles.findIndex(x=>x.id===item.id);return `<div class="subtitle-row ${item.id===activeSubtitleId?"active":""}" data-id="${item.id}"><div class="subtitle-number">${i+1}</div><div class="time-column"><input class="time-input start-input" data-id="${item.id}" value="${formatTime(item.start)}"><input class="time-input end-input" data-id="${item.id}" value="${formatTime(item.end)}"></div><div class="subtitle-texts"><div class="text-wrap"><div class="text-label">🇬🇧 ENGLISH</div><textarea class="subtitle-textarea english-input" data-id="${item.id}" spellcheck="false">${escapeHtml(item.en)}</textarea></div><div class="text-wrap"><div class="text-label">🇻🇳 TIẾNG VIỆT</div><textarea class="subtitle-textarea vietnamese" data-id="${item.id}" placeholder="Bản dịch tiếng Việt...">${escapeHtml(item.vi)}</textarea></div></div><div class="row-actions"><button class="row-action jump-btn" data-id="${item.id}" title="Đi đến thời gian">▶</button><button class="row-action delete delete-btn" data-id="${item.id}" title="Xóa dòng">×</button></div></div>`}
function findSubtitle(id){return subtitles.find(x=>x.id===id)}
function attachRowEvents(){document.querySelectorAll(".english-input").forEach(el=>el.addEventListener("input",()=>{const x=findSubtitle(el.dataset.id);if(x)x.en=el.value}));document.querySelectorAll(".vietnamese").forEach(el=>el.addEventListener("input",()=>{const x=findSubtitle(el.dataset.id);if(x){x.vi=el.value;updateVideoSubtitle()}}));document.querySelectorAll(".start-input").forEach(el=>el.addEventListener("change",()=>{const x=findSubtitle(el.dataset.id);if(x)x.start=parseTime(el.value);renderSubtitles()}));document.querySelectorAll(".end-input").forEach(el=>el.addEventListener("change",()=>{const x=findSubtitle(el.dataset.id);if(x)x.end=parseTime(el.value);renderSubtitles()}));document.querySelectorAll(".jump-btn").forEach(el=>el.addEventListener("click",()=>{const x=findSubtitle(el.dataset.id);if(!x)return;videoPlayer.currentTime=x.start;activeSubtitleId=x.id;videoPlayer.play().catch(()=>{});updateActiveRow()}));document.querySelectorAll(".delete-btn").forEach(el=>el.addEventListener("click",()=>{subtitles=subtitles.filter(x=>x.id!==el.dataset.id);if(activeSubtitleId===el.dataset.id)activeSubtitleId=null;renderSubtitles()}))}
function getActiveSubtitle(){const t=videoPlayer.currentTime;return subtitles.find(x=>t>=x.start&&t<=x.end)}
function updateVideoSubtitle(){const x=getActiveSubtitle();if(!x){videoSubtitle.textContent="";activeSubtitleId=null;updateActiveRow();return}activeSubtitleId=x.id;videoSubtitle.textContent=x.vi||x.en||"";updateActiveRow()}
function updateActiveRow(){document.querySelectorAll(".subtitle-row").forEach(r=>r.classList.toggle("active",r.dataset.id===activeSubtitleId))}

async function translateText(text){if(!text.trim())return "";const url="https://api.mymemory.translated.net/get?q="+encodeURIComponent(text)+"&langpair=en|vi";const response=await fetch(url);if(!response.ok)throw new Error("Translation API error");const data=await response.json();if(data?.responseData?.translatedText){const ta=document.createElement("textarea");ta.innerHTML=data.responseData.translatedText;return ta.value}throw new Error("Không nhận được bản dịch")}
translateAllBtn.addEventListener("click",async()=>{if(!subtitles.length){showToast("Hãy import SRT/VTT trước");return}translateAllBtn.disabled=true;setStatus("Đang dịch phụ đề...","loading");updateProgress(0);let done=0;try{for(let i=0;i<subtitles.length;i++){const x=subtitles[i];if(x.en.trim()&&!x.vi.trim()){try{x.vi=await translateText(x.en)}catch(e){console.error(e);x.vi="[Lỗi dịch - hãy thử lại]"}}done++;updateProgress((i+1)/subtitles.length*100);setStatus(`Đang dịch ${i+1}/${subtitles.length}...`,"loading");await new Promise(r=>setTimeout(r,250));if(done%3===0||i===subtitles.length-1)renderSubtitles()}renderSubtitles();setStatus(`Đã dịch ${done} dòng`);updateProgress(100);showToast("Đã hoàn thành dịch phụ đề")}catch(e){console.error(e);setStatus("Có lỗi khi dịch phụ đề","error");showToast("Không thể hoàn thành dịch")}finally{translateAllBtn.disabled=false;setTimeout(()=>updateProgress(0),1000)}});

copyAllBtn.addEventListener("click",async()=>{if(!subtitles.length)return showToast("Chưa có phụ đề");try{await navigator.clipboard.writeText(subtitles.map(x=>x.vi||x.en).join("\n"));showToast("Đã copy phụ đề tiếng Việt")}catch{showToast("Không thể copy tự động")}});

function generateSrt(){return subtitles.map((x,i)=>`${i+1}\n${formatTime(x.start)} --> ${formatTime(x.end)}\n${x.vi.trim()||x.en.trim()}\n`).join("\n")}
function generateVtt(){return "WEBVTT\n\n"+subtitles.map(x=>`${formatVttTime(x.start)} --> ${formatVttTime(x.end)}\n${x.vi.trim()||x.en.trim()}\n\n`).join("")}
function downloadFile(content,filename,mime){const blob=new Blob([content],{type:`${mime};charset=utf-8`}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
downloadSrtBtn.addEventListener("click",()=>{if(!subtitles.length)return showToast("Chưa có phụ đề");downloadFile(generateSrt(),"subtitle-vietnamese.srt","application/x-subrip");showToast("Đã tải SRT")});
downloadVttBtn.addEventListener("click",()=>{if(!subtitles.length)return showToast("Chưa có phụ đề");downloadFile(generateVtt(),"subtitle-vietnamese.vtt","text/vtt");showToast("Đã tải VTT")});

addSubtitleBtn.addEventListener("click",()=>{const t=videoPlayer.currentTime||0,x={id:createId(),start:Math.max(0,t),end:Math.max(0,t+3),en:"",vi:""};subtitles.push(x);subtitles.sort((a,b)=>a.start-b.start);activeSubtitleId=x.id;renderSubtitles();showToast("Đã thêm dòng phụ đề")});
searchInput.addEventListener("input",renderSubtitles);clearSearchBtn.addEventListener("click",()=>{searchInput.value="";renderSubtitles()});
function shiftAll(n){if(!subtitles.length)return showToast("Chưa có phụ đề");subtitles.forEach(x=>{x.start=Math.max(0,x.start+n);x.end=Math.max(x.start,x.end+n)});renderSubtitles();showToast(n>0?"Đã tiến phụ đề 0.5 giây":"Đã lùi phụ đề 0.5 giây")}
shiftBackBtn.addEventListener("click",()=>shiftAll(-.5));shiftForwardBtn.addEventListener("click",()=>shiftAll(.5));sortSubtitleBtn.addEventListener("click",()=>{subtitles.sort((a,b)=>a.start-b.start);renderSubtitles();showToast("Đã sắp xếp phụ đề")});
clearSubtitleBtn.addEventListener("click",()=>{if(subtitles.length&&confirm("Bạn có chắc muốn xóa toàn bộ phụ đề?")){subtitles=[];activeSubtitleId=null;renderSubtitles();videoSubtitle.textContent="";showToast("Đã xóa toàn bộ phụ đề")}});

fontSizeSelect.addEventListener("change",()=>document.documentElement.style.setProperty("--subtitle-size",fontSizeSelect.value+"px"));
fontColorInput.addEventListener("input",()=>document.documentElement.style.setProperty("--subtitle-color",fontColorInput.value));
function updateSubtitleBackground(){videoSubtitle.classList.remove("bg-dark","bg-solid");if(subtitleBgSelect.value==="dark")videoSubtitle.classList.add("bg-dark");if(subtitleBgSelect.value==="solid")videoSubtitle.classList.add("bg-solid")}
function updateSubtitlePosition(){videoSubtitle.classList.remove("position-top","position-middle");if(positionSelect.value==="top")videoSubtitle.classList.add("position-top");if(positionSelect.value==="middle")videoSubtitle.classList.add("position-middle")}
subtitleBgSelect.addEventListener("change",updateSubtitleBackground);positionSelect.addEventListener("change",updateSubtitlePosition);

saveProjectBtn.addEventListener("click",()=>{const project={app:"Video Translator",version:1,created:new Date().toISOString(),subtitles:subtitles.map(x=>({start:x.start,end:x.end,en:x.en,vi:x.vi})),style:{fontSize:fontSizeSelect.value,fontColor:fontColorInput.value,background:subtitleBgSelect.value,position:positionSelect.value}};downloadFile(JSON.stringify(project,null,2),"video-translator-project.json","application/json");showToast("Đã lưu dự án")});
loadProjectBtn.addEventListener("click",()=>projectInput.click());
projectInput.addEventListener("change",e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{const p=JSON.parse(r.result);if(!p||!Array.isArray(p.subtitles))throw new Error("Invalid project");subtitles=p.subtitles.map(x=>({id:createId(),start:Number(x.start)||0,end:Number(x.end)||0,en:x.en||"",vi:x.vi||""}));if(p.style){if(p.style.fontSize){fontSizeSelect.value=p.style.fontSize;document.documentElement.style.setProperty("--subtitle-size",p.style.fontSize+"px")}if(p.style.fontColor){fontColorInput.value=p.style.fontColor;document.documentElement.style.setProperty("--subtitle-color",p.style.fontColor)}if(p.style.background)subtitleBgSelect.value=p.style.background;if(p.style.position)positionSelect.value=p.style.position;updateSubtitleBackground();updateSubtitlePosition()}renderSubtitles();setStatus("Đã mở dự án");showToast("Đã mở dự án thành công")}catch(err){console.error(err);setStatus("File dự án không hợp lệ","error");showToast("Không thể mở dự án")}};r.readAsText(file)});

document.addEventListener("keydown",e=>{if(["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName))return;if(e.code==="Space"){e.preventDefault();videoPlayer.paused?videoPlayer.play():videoPlayer.pause()}if(e.code==="ArrowLeft")videoPlayer.currentTime=Math.max(0,videoPlayer.currentTime-5);if(e.code==="ArrowRight")videoPlayer.currentTime+=5});

updateSubtitleBackground();updateSubtitlePosition();renderSubtitles();setStatus("Sẵn sàng. Hãy chọn video hoặc import phụ đề.");
