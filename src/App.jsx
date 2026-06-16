import { useState, useMemo, Fragment } from "react";

const B = {
  teal:"#2DC6C6", tealDark:"#1A9898", tealDeep:"#0F6B6B",
  tealLight:"#E0F7F7", tealBg:"#F2FBFB",
  purple:"#9B4CB8", purpleLight:"#F0E6F6",
  pink:"#D63A82", pinkLight:"#FCE8F1",
  green:"#3DB89A", greenLight:"#E0F5F0",
  text:"#1A2F2F", muted:"#5A8080", border:"#D0ECEC", white:"#FFFFFF",
};
const SV = {
  grotta:{ label:"Grotta del Sale", color:B.teal,   light:B.tealLight,   emoji:"🧂" },
  anthea:{ label:"Anthea",          color:B.purple, light:B.purpleLight, emoji:"🌸" },
  vacuum:{ label:"Vacuum",          color:B.pink,   light:B.pinkLight,   emoji:"💪" },
  fisio: { label:"Fisioterapia",    color:B.green,  light:B.greenLight,  emoji:"🩺" },
};
const ST = {
  confirmed:{ label:"Confermato",    icon:"✅" },
  pending:  { label:"Da confermare", icon:"⚠️" },
  cancelled:{ label:"Disdetto",      icon:"❌" },
  moved:    { label:"Spostato",      icon:"🔄" },
};
const BT = {
  ferie:   { label:"Ferie",    icon:"🏖️", color:"#0EA5E9", light:"#E0F2FE", stripe:"rgba(14,165,233,0.13)" },
  malattia:{ label:"Malattia", icon:"🤒", color:"#EF4444", light:"#FEE2E2", stripe:"rgba(239,68,68,0.13)" },
  assenza: { label:"Assenza",  icon:"📵", color:"#F59E0B", light:"#FEF3C7", stripe:"rgba(245,158,11,0.13)" },
};
const STAFF = {
  all:     { name:"Tutto il team", icon:"👥" },
  titolare:{ name:"Titolare",      icon:"👑" },
  dip1:    { name:"Dipendente 1",  icon:"👩" },
  dip2:    { name:"Dipendente 2",  icon:"👩‍🦱" },
};
const DAYS_S = ["Lun","Mar","Mer","Gio","Ven","Sab"];
const DAYS_F = ["Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"];
const DURS   = [15,20,30,45,60,90,120];
const SLOT_H = 56;
const TIMES  = [];
for(let h=8; h<=19; h++){ TIMES.push(`${h}:00`); TIMES.push(`${h}:30`); }
TIMES.push("20:00");

function toDateStr(d){ return d.toISOString().split("T")[0]; }
function todayStr(){ return toDateStr(new Date()); }
function dayName(s){ const d=new Date(s+"T12:00:00"); return DAYS_F[d.getDay()===0?6:d.getDay()-1]; }
function tIdx(t){ const [h,m]=t.split(":").map(Number); return (h-8)*2+(m>=30?1:0); }
function blockAt(blocks,di,time,wd){
  if(!wd?.[di]) return null;
  const ds=toDateStr(wd[di]);
  return blocks.find(b=>{
    if(b.date!==ds) return false;
    if(b.timeFrom===null) return true;
    const ti=tIdx(time); return ti>=tIdx(b.timeFrom)&&ti<tIdx(b.timeTo);
  })||null;
}
function blockStart(b,t){ return b.timeFrom===null ? t===TIMES[0] : b.timeFrom===t; }
function initDay(di){ const t=new Date(),dow=t.getDay(),m=new Date(t); m.setDate(t.getDate()-(dow===0?6:dow-1)+di); return toDateStr(m); }
function doneApts(apts,cn,svc){ return apts.filter(a=>a.client===cn&&a.service===svc&&a.status!=="cancelled").length; }

let UID=10, BID=5, PID=10;

const INIT_APTS = [
  {id:1,day:0,time:"9:00", dur:60,client:"Maria Rossi",  phone:"3331234567",service:"grotta",status:"confirmed",notes:"Prima seduta"},
  {id:2,day:1,time:"10:30",dur:30,client:"Laura Bianchi",phone:"3387654321",service:"anthea",status:"pending",  notes:""},
  {id:3,day:2,time:"14:00",dur:90,client:"Sofia Verdi",  phone:"3459876543",service:"vacuum",status:"confirmed",notes:"Avvisare giorno prima"},
  {id:4,day:3,time:"11:00",dur:45,client:"Anna Neri",    phone:"3301112233",service:"fisio", status:"moved",    notes:"Spostata da martedì"},
  {id:5,day:4,time:"9:30", dur:30,client:"Giulia Russo", phone:"3421234567",service:"grotta",status:"cancelled",notes:"Ha disdetto"},
  {id:6,day:0,time:"11:00",dur:60,client:"Laura Bianchi",phone:"3387654321",service:"fisio", status:"confirmed",notes:""},
