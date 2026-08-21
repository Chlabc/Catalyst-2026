"use client";
import { useEffect, useState } from "react";
const yogaPoses=[
 {id:"childs-pose",title:"Child's Pose",duration:"2 min",benefits:"Relaxes the lower back and pelvis",imageUrl:"https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=900&q=80",steps:["Kneel and bring your big toes together.","Fold forward with arms extended or by your sides.","Breathe slowly into your lower back."]},
 {id:"cat-cow",title:"Cat-Cow Pose",duration:"2 min",benefits:"Encourages gentle pelvic circulation",imageUrl:"https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=900&q=80",steps:["Start on hands and knees.","Inhale, soften your belly and lift your chest.","Exhale, gently round your spine."]},
 {id:"legs-up-wall",title:"Legs-Up-The-Wall",duration:"2 min",benefits:"May ease swelling and bloating",imageUrl:"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=80",steps:["Sit sideways close to a wall.","Turn and rest both legs up the wall.","Relax your shoulders and breathe normally."]},
 {id:"reclined-angle",title:"Reclined Bound Angle",duration:"2 min",benefits:"Gently opens the pelvis and eases tension",imageUrl:"https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=900&q=80",steps:["Lie down with knees bent.","Bring the soles of your feet together.","Support your thighs with cushions if needed."]},
];
const meds=[
 {id:"naprogesic",icon:"💊",name:"Naprogesic",ingredient:"Naproxen Sodium",type:"NSAID · Period pain",description:"Made specifically for period pain. It may work best when taken at the first sign of cramps or when your period begins.",note:"Not suitable for everyone, including some people with stomach, kidney, heart or asthma conditions."},
 {id:"nurofen",icon:"🌸",name:"Nurofen Period Pain",ingredient:"Ibuprofen",type:"NSAID · Anti-inflammatory",description:"An anti-inflammatory pain reliever commonly used for moderate period cramps and headaches.",note:"Do not combine with other NSAIDs. Take only as directed on the label."},
 {id:"panadol",icon:"✨",name:"Panadol Extra",ingredient:"Paracetamol + Caffeine",type:"Pain relief",description:"An option for some people who cannot take NSAIDs or have a sensitive stomach.",note:"Check caffeine intake and avoid using with other paracetamol-containing products."},
 {id:"heat-patch",icon:"♨️",name:"Heat Patches",ingredient:"Non-medicated",type:"Drug-free comfort",description:"Portable warmth can help relax tense muscles around the lower abdomen or back.",note:"Avoid damaged skin and follow the patch instructions to prevent burns."},
];
export default function MedicinePage(){
 const [active,setActive]=useState<string|null>(null),[seconds,setSeconds]=useState(120);
 useEffect(()=>{if(!active||seconds<=0)return;const id=window.setInterval(()=>setSeconds(x=>x-1),1000);return()=>clearInterval(id)},[active,seconds]);
 function timer(id:string){if(active===id){setActive(null);return}setActive(id);setSeconds(120)}
 const time=String(Math.floor(seconds/60)).padStart(2,"0")+":"+String(seconds%60).padStart(2,"0");
 return <main className="relief-page">
  <header className="feature-hero relief-hero"><p>RELIEF & MEDICINE</p><h1>Your gentle relief toolkit 🌿</h1><span>Move softly, breathe slowly, and choose medicine with professional advice.</span></header>
  <section className="relief-heading"><div><p>2-MINUTE MOVEMENT</p><h2>Yoga for cramp comfort</h2><span>Stop if anything increases your pain.</span></div>{active&&<div className="floating-timer"><small>ACTIVE TIMER</small><strong>{time}</strong><button onClick={()=>setActive(null)}>Pause</button></div>}</section>
  <section className="yoga-grid">{yogaPoses.map(pose=><article className="yoga-card" key={pose.id}><div className="yoga-image"><img src={pose.imageUrl} alt={pose.title}/><span>{pose.duration}</span></div><div className="yoga-body"><h3>{pose.title}</h3><p>{pose.benefits}</p><ol>{pose.steps.map(step=><li key={step}>{step}</li>)}</ol><button className={active===pose.id?"active":""} onClick={()=>timer(pose.id)}>{active===pose.id?"Pause · "+time:"▶ Start 2-minute timer"}</button></div></article>)}</section>
  <section className="relief-heading meds-title"><div><p>AUSTRALIAN OTC GUIDE</p><h2>Common period pain options</h2><span>Always read the label and check whether a medicine is suitable for you.</span></div><a href="https://www.healthdirect.gov.au/medicines" target="_blank" rel="noreferrer">Healthdirect medicines ↗</a></section>
  <section className="meds-grid">{meds.map(med=><article className="med-card" key={med.id}><div className="med-icon">{med.icon}</div><small>{med.type}</small><h3>{med.name}</h3><strong>{med.ingredient}</strong><p>{med.description}</p><div className="med-note">ℹ {med.note}</div><b className="med-disclaimer">Consult your pharmacist or GP before taking any medication.</b></article>)}</section>
  <section className="safety-strip"><span className="safety-icon">☎</span><div><strong>Severe, sudden or unusual pain?</strong><p>A registered Healthdirect nurse is available 24/7.</p></div><a href="tel:1800022222"><small>CALL HEALTHDIRECT</small>1800 022 222</a></section>
 </main>
}
