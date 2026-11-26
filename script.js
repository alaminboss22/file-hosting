const API = "https://tempfile.org/api/upload/local";
const input = document.getElementById("fileInput");
const dropzone = document.getElementById("dropzone");
const uploadBtn = document.getElementById("uploadBtn");
const selected = document.getElementById("selected");
const message = document.getElementById("message");
const progressWrap = document.getElementById("progressWrap");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const progressPercent = document.getElementById("progressPercent");
let currentFile = null;

document.getElementById("year").textContent = new Date().getFullYear();
function formatSize(bytes){if(bytes<1024)return bytes+" B";const units=["KB","MB","GB"];let n=bytes/1024,i=0;while(n>=1024&&i<units.length-1){n/=1024;i++}return n.toFixed(1)+" "+units[i]}
function choose(file){currentFile=file||null;message.textContent="";document.getElementById("result").hidden=true;if(!currentFile){selected.hidden=true;uploadBtn.disabled=true;return}selected.hidden=false;selected.textContent=currentFile.name+" · "+formatSize(currentFile.size);if(currentFile.size>100*1024*1024){message.textContent="This file is over the 100 MB limit. Please choose a smaller file.";uploadBtn.disabled=true}else{uploadBtn.disabled=false}}
input.addEventListener("change",()=>choose(input.files[0]));
["dragenter","dragover"].forEach(evt=>dropzone.addEventListener(evt,e=>{e.preventDefault();dropzone.classList.add("drag")}));
["dragleave","drop"].forEach(evt=>dropzone.addEventListener(evt,e=>{e.preventDefault();dropzone.classList.remove("drag")}));
dropzone.addEventListener("drop",e=>choose(e.dataTransfer.files[0]));
uploadBtn.addEventListener("click",async()=>{if(!currentFile)return;uploadBtn.disabled=true;message.textContent="";progressWrap.hidden=false;progressBar.style.width="0%";progressText.textContent="Uploading…";progressPercent.textContent="0%";
const data=new FormData();data.append("files",currentFile);data.append("expiryHours","48");
try{const xhr=new XMLHttpRequest();const response=await new Promise((resolve,reject)=>{xhr.open("POST",API);xhr.upload.onprogress=e=>{if(e.lengthComputable){const p=Math.round(e.loaded/e.total*100);progressBar.style.width=p+"%";progressPercent.textContent=p+"%"}};xhr.onload=()=>{let body;try{body=JSON.parse(xhr.responseText)}catch{reject(new Error("The upload service returned an invalid response."));return}if(xhr.status>=200&&xhr.status<300&&body.success&&body.files?.length)resolve(body);else reject(new Error(body.error||"Upload failed (HTTP "+xhr.status+")."))};xhr.onerror=()=>reject(new Error("Network error. Check your internet and try again."));xhr.ontimeout=()=>reject(new Error("Upload timed out. Try again with a stable connection."));xhr.timeout=15*60*1000;xhr.send(data)});
const f=response.files[0];const url="https://tempfile.org/"+encodeURIComponent(f.id)+"/download?utm_source=chatgpt.com";document.getElementById("resultName").textContent=f.name+" · "+formatSize(f.size);document.getElementById("shareLink").value=url;document.getElementById("openLink").href=url;document.getElementById("result").hidden=false;progressText.textContent="Upload complete";progressBar.style.width="100%";progressPercent.textContent="100%";
}catch(err){message.textContent=err.message;progressText.textContent="Upload failed"}finally{uploadBtn.disabled=!currentFile||currentFile.size>100*1024*1024}});
document.getElementById("copyBtn").addEventListener("click",async()=>{const field=document.getElementById("shareLink");try{await navigator.clipboard.writeText(field.value);document.getElementById("copyBtn").textContent="Copied!"}catch{field.select();document.execCommand("copy");document.getElementById("copyBtn").textContent="Copied!"}setTimeout(()=>document.getElementById("copyBtn").textContent="Copy",1800)});
