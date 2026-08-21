"use client";
import { useEffect, useMemo, useState } from "react";
import { predictCycle } from "@/lib/cyclePrediction";

type DailyLog={is_period:boolean;flow:string;blood_color:string;product_count:number;pain_level:number;pain_locations:string[];symptoms:string[];mood:string;notes:string};
type TrackerData={settings:{average_cycle_length:number;average_period_length:number;last_period_start:string};logs:Record<string,DailyLog>};
const emptyLog:DailyLog={is_period:false,flow:"",blood_color:"",product_count:0,pain_level:0,pain_locations:[],symptoms:[],mood:"",notes:""};
const initialData:TrackerData={settings:{average_cycle_length:28,average_period_length:5,last_period_start:"2026-08-01"},logs:{"2026-08-01":{...emptyLog,is_period:true,flow:"Medium",blood_color:"Bright Red",pain_level:5,mood:"Tired"},"2026-08-02":{...emptyLog,is_period:true,flow:"Heavy",blood_color:"Dark Red",pain_level:6,mood:"Anxious"},"2026-08-03":{...emptyLog,is_period:true,flow:"Light",blood_color:"Brown / Dark",pain_level:3,mood:"Happy"}}};
const dateKey=(d:Date)=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
const toggle=(list:string[],value:string)=>list.includes(value)?list.filter(x=>x!==value):[...list,value];
const flowOptions=["Spotting","Light","Medium","Heavy"], colours=[["Bright Red","#e85f67"],["Dark Red","#8f3443"],["Brown / Dark","#795348"],["Pinkish","#f2a1b3"]];
const painPlaces=["Lower Abdomen","Lower Back","Headache","Breast Tenderness"];
const symptoms=["Bloating","Constipation","Diarrhea","Nausea","Acne","Fatigue","Insomnia","Chills"];
const moods=[["😊","Happy"],["😰","Anxious"],["😭","Low"],["🤬","Irritable"],["🧠","Brain Fog"]];

export default function TrackerPage(){
 const today=new Date(2026,7,21),[month,setMonth]=useState(new Date(2026,7,1)),[selected,setSelected]=useState("2026-08-21"),[data,setData]=useState<TrackerData>(initialData),[log,setLog]=useState<DailyLog>(emptyLog),[saved,setSaved]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem("lunaTrackerData");if(raw)setData(JSON.parse(raw));}catch{}},[]);
 useEffect(()=>setLog(data.logs[selected]?{...data.logs[selected]}:{...emptyLog,pain_locations:[],symptoms:[]}),[selected,data.logs]);
 const days=useMemo(()=>{const first=new Date(month.getFullYear(),month.getMonth(),1),last=new Date(month.getFullYear(),month.getMonth()+1,0);return [...Array(first.getDay()).fill(null),...Array.from({length:last.getDate()},(_,i)=>new Date(month.getFullYear(),month.getMonth(),i+1))]},[month]);
 const historyPeriodStarts=useMemo(()=>{const loggedStarts=Object.keys(data.logs).filter(key=>{if(!data.logs[key].is_period)return false;const previous=new Date(key+"T00:00:00");previous.setDate(previous.getDate()-1);return !data.logs[dateKey(previous)]?.is_period});return [...new Set([data.settings.last_period_start,...loggedStarts])]},[data]);
 const prediction=useMemo(()=>predictCycle(historyPeriodStarts,data.settings.average_cycle_length),[historyPeriodStarts,data.settings.average_cycle_length]);
 const start=new Date((prediction.lastPeriodStart??data.settings.last_period_start)+"T00:00:00"),cycleDay=Math.max(1,Math.floor((today.getTime()-start.getTime())/86400000)+1),phase=prediction.getPhaseForDate(today)??"Follicular",daysToPeriod=prediction.predictedStart?Math.max(0,Math.ceil((new Date(prediction.predictedStart+"T00:00:00").getTime()-today.getTime())/86400000)):prediction.averageCycleLength;
 function save(){const next={...data,logs:{...data.logs,[selected]:log}};setData(next);localStorage.setItem("lunaTrackerData",JSON.stringify(next));setSaved(true);setTimeout(()=>setSaved(false),2000)}
 function predictedPeriod(key:string){return Boolean(prediction.predictedPeriod&&key>=prediction.predictedPeriod.start&&key<=prediction.predictedPeriod.end)}
 function ovulation(key:string){return key===prediction.ovulationDate}
 return <main className="tracker-page">
  <header className="tracker-title"><div><p>MY CYCLE JOURNAL</p><h1>Your body&apos;s story, day by day 🌷</h1><span>Private, gentle tracking that helps you notice patterns.</span></div><button>🔒 Saved on this device</button></header>
  <section className="cycle-overview">
   <div className="cycle-ring" style={{"--cycle-progress":`${Math.min(cycleDay/prediction.averageCycleLength,1)*360}deg`} as React.CSSProperties}><div><small>CYCLE DAY</small><strong>{cycleDay}</strong><span>{phase} phase</span></div></div>
   <div className="cycle-summary"><p>CURRENT PHASE</p><h2>{phase==="Ovulation"?"A little extra sparkle today ✨":`${phase} phase`}</h2><span>Your cycle is unique. Predictions become more helpful as you add records.</span><div className="phase-bar"><i className="menstrual"/><i className="follicular"/><i className="ovulation"/><i className="luteal"/></div><div className="phase-labels"><span>Period · 1–5</span><span>Follicular · 6–13</span><span>Ovulation · 14</span><span>Luteal · 15–28</span></div></div>
   <div className="cycle-countdown"><span>🌙</span><small>NEXT PERIOD</small><strong>{daysToPeriod} days</strong><p>{prediction.predictedStart?`Estimated ${new Date(prediction.predictedStart+"T00:00:00").toLocaleDateString("en-AU",{day:"numeric",month:"long"})}`:"Add a period start"}</p></div>
   <div className="cycle-stats"><div><small>DYNAMIC AVERAGE</small><strong>{prediction.averageCycleLength} <span>days</span></strong></div><div><small>AVERAGE PERIOD</small><strong>{data.settings.average_period_length} <span>days</span></strong></div></div>
  </section>
  <div className="tracker-workspace">
   <section className="tracker-calendar">
    <div className="tracker-section-head"><div><p>CALENDAR</p><h2>{month.toLocaleDateString("en-AU",{month:"long",year:"numeric"})}</h2></div><div><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}>←</button><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}>→</button></div></div>
    <div className="tracker-weekdays">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(x=><span key={x}>{x}</span>)}</div>
    <div className="tracker-days">{days.map((d,i)=>{if(!d)return <span key={i}/>;const key=dateKey(d),entry=data.logs[key],isSelected=key===selected,datePhase=prediction.getPhaseForDate(key);return <button key={key} title={datePhase?`${datePhase} phase`:undefined} onClick={()=>setSelected(key)} className={`${isSelected?"picked":""} ${entry?.is_period?"logged-period":""} ${predictedPeriod(key)?"predicted":""} ${datePhase?`phase-${datePhase.toLowerCase()}`:""}`}><b>{d.getDate()}</b>{ovulation(key)&&<i>✿</i>}{entry?.mood&&<small>{moods.find(x=>x[1]===entry.mood)?.[0]}</small>} {entry?.is_period&&<em className={`flow-${entry.flow.toLowerCase()}`}/>}</button>})}</div>
    <div className="tracker-legend"><span><i className="actual-dot"/>Logged period</span><span><i className="predict-dot"/>Predicted period</span><span>✿ Ovulation</span><span>😊 Mood logged</span></div>
   </section>
   <section className="daily-panel">
    <div className="tracker-section-head"><div><p>DAILY DETAILS</p><h2>{new Date(selected+"T00:00:00").toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long"})}</h2></div><label className="period-toggle"><input type="checkbox" checked={log.is_period} onChange={e=>setLog({...log,is_period:e.target.checked})}/><span/> Period day</label></div>
    <div className="log-section"><h3><span>💧</span> Flow & colour</h3><label>Flow intensity</label><div className="log-choices">{flowOptions.map(x=><button className={log.flow===x?"active":""} onClick={()=>setLog({...log,flow:x,is_period:true})} key={x}>{x}</button>)}</div><label>Blood colour</label><div className="colour-choices">{colours.map(([x,c])=><button className={log.blood_color===x?"active":""} onClick={()=>setLog({...log,blood_color:x})} key={x}><i style={{background:c}}/>{x}</button>)}</div><label>Products used <span>(optional)</span></label><div className="stepper"><button onClick={()=>setLog({...log,product_count:Math.max(0,log.product_count-1)})}>−</button><strong>{log.product_count}</strong><button onClick={()=>setLog({...log,product_count:log.product_count+1})}>+</button><span>pads, tampons or period products</span></div></div>
    <div className="log-section"><h3><span>⚡</span> Pain & cramps</h3><div className="pain-title"><label>Pain level</label><strong>{log.pain_level}<small>/10</small></strong></div><input className="detail-slider" type="range" min="0" max="10" value={log.pain_level} onChange={e=>setLog({...log,pain_level:Number(e.target.value)})} style={{"--range-fill":`${log.pain_level*10}%`} as React.CSSProperties}/><div className="slider-ends"><span>No pain</span><span>Unable to function</span></div><label>Where does it hurt?</label><div className="chip-grid">{painPlaces.map(x=><button className={log.pain_locations.includes(x)?"active":""} onClick={()=>setLog({...log,pain_locations:toggle(log.pain_locations,x)})} key={x}>{x}</button>)}</div></div>
    <div className="log-section"><h3><span>🌿</span> Physical & PMS symptoms</h3><div className="chip-grid symptoms">{symptoms.map(x=><button className={log.symptoms.includes(x)?"active":""} onClick={()=>setLog({...log,symptoms:toggle(log.symptoms,x)})} key={x}>{x}</button>)}</div></div>
    <div className="log-section"><h3><span>☁️</span> Mood & mind</h3><div className="mood-log">{moods.map(([emoji,x])=><button className={log.mood===x?"active":""} onClick={()=>setLog({...log,mood:x})} key={x}><span>{emoji}</span><small>{x}</small></button>)}</div></div>
    <div className="log-section"><h3><span>✎</span> Notes for today</h3><textarea value={log.notes} onChange={e=>setLog({...log,notes:e.target.value})} placeholder="How was your day? Add anything you want to remember…"/><small className="privacy-copy">🔒 Only you can see this note</small></div>
    <button className="save-daily" onClick={save}>{saved?"Saved with care ✓":"Save daily log"}</button>
   </section>
  </div>
 </main>
}
