"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const moods = [{ icon: "😣", label: "Rough" }, { icon: "😕", label: "Low" }, { icon: "😐", label: "Okay" }, { icon: "🙂", label: "Good" }, { icon: "🤩", label: "Great" }];
const symptoms = ["Cramps", "Headache", "Bloating", "Fatigue", "Low mood"];
const quizQuestions = [
  { question: "Which option may help ease period cramps?", answers: ["Skipping all meals", "A wrapped heat pack", "Very intense exercise"], correct: 1, explanation: "Gentle heat can relax muscles and may reduce cramp discomfort." },
  { question: "When should you ask for medical help?", answers: ["Pain stops normal activities", "Only when pain is zero", "Never — cramps are always normal"], correct: 0, explanation: "Severe, unusual, or activity-limiting pain deserves support from a health professional." },
  { question: "Which is safest when using a heat pack?", answers: ["Place it directly on skin", "Use it while asleep", "Wrap it and keep it comfortably warm"], correct: 2, explanation: "Wrapping the heat pack helps protect your skin from burns." },
];
const dressUpItems=[{id:"beret",name:"Rose Beret",price:40},{id:"wizard",name:"Moonlight Hat",price:70},{id:"crown",name:"Garden Crown",price:55}];

export default function Home() {
  const [mood, setMood] = useState(3);
  const [pain, setPain] = useState(4);
  const [symptom, setSymptom] = useState("Cramps");
  const [saved, setSaved] = useState(false);
  const [monsterHp, setMonsterHp] = useState(72);
  const [coins, setCoins] = useState(240);
  const [chestOpen, setChestOpen] = useState(false);
  const [petHunger, setPetHunger] = useState(60);
  const [toast, setToast] = useState("");
  const [sosOpen, setSosOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);
  const [name, setName] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [showNameEditor, setShowNameEditor] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [treasureOpen,setTreasureOpen]=useState(false);
  const [treasureRewards,setTreasureRewards]=useState<number[]>([]);
  const [selectedChest,setSelectedChest]=useState<number|null>(null);
  const [dressUpOpen,setDressUpOpen]=useState(false);
  const [equippedHat,setEquippedHat]=useState<string|null>(null);
  const [ownedItems,setOwnedItems]=useState<string[]>([]);

  useEffect(() => {
    const savedName = localStorage.getItem("lunaUserName") ?? "";
    setName(savedName);
    setNameDraft(savedName);
    setShowNameEditor(!savedName);
    setCoins(Number(localStorage.getItem("lunaCoins") ?? 100));
    setPetHunger(Number(localStorage.getItem("lunaPetHunger") ?? 60));
    setEquippedHat(localStorage.getItem("lunaEquippedHat"));
    try{setOwnedItems(JSON.parse(localStorage.getItem("lunaOwnedItems")??"[]"))}catch{}
    const existing = localStorage.getItem("lunaDailyCheckin");
    if (!existing) return;
    try {
      const record = JSON.parse(existing);
      setMood(record.mood ?? 3); setPain(record.pain ?? 4); setSymptom(record.symptom ?? "Cramps");
    } catch { /* Keep defaults when saved data is invalid. */ }
  }, []);

  function saveCheckin() {
    localStorage.setItem("lunaDailyCheckin", JSON.stringify({ mood, pain, symptom, recordedAt: new Date().toISOString() }));
    setSaved(true); window.setTimeout(() => setSaved(false), 2200);
    if (pain >= 8) setSosOpen(true);
  }
  function attackMonster() {
    if (monsterHp === 0) return;
    setQuizOpen(true); setAnswer(null);
  }
  function saveName() {
    const cleanName = nameDraft.trim();
    if (!cleanName) return;
    localStorage.setItem("lunaUserName", cleanName); setName(cleanName); setShowNameEditor(false);
  }
  function chooseAnswer(index: number) {
    if (answer !== null) return;
    setAnswer(index);
    if (index === quizQuestions[questionIndex].correct) {
      setMonsterHp(0);
    }
  }
  function continueQuiz() {
    if (answer !== quizQuestions[questionIndex].correct) { setAnswer(null); return; }
    setQuizOpen(false); setQuestionIndex((value) => (value + 1) % quizQuestions.length); setAnswer(null);
    setTreasureRewards(Array.from({length:3},()=>Math.floor(Math.random()*81)+20));setSelectedChest(null);setTreasureOpen(true);
  }
  function feedPet() {
    if (coins < 20 || petHunger >= 100) return;
    const nextCoins=coins-20; const nextHunger=Math.min(100,petHunger+20);
    setCoins(nextCoins); setPetHunger(nextHunger);
    localStorage.setItem("lunaCoins",String(nextCoins)); localStorage.setItem("lunaPetHunger",String(nextHunger));
    setToast("Luna loved the berry! +20 fullness 🍓"); window.setTimeout(()=>setToast(""),2600);
  }
  function chooseChest(index:number){
    if(selectedChest!==null)return;setSelectedChest(index);setChestOpen(true);
    const reward=treasureRewards[index];setCoins(value=>{const next=value+reward;localStorage.setItem("lunaCoins",String(next));return next});
    setToast("You found "+reward+" coins! ✨");window.setTimeout(()=>setToast(""),3000);
  }
  function buyOrEquip(item:{id:string;price:number}){
    if(ownedItems.includes(item.id)){setEquippedHat(item.id);localStorage.setItem("lunaEquippedHat",item.id);return}
    if(coins<item.price)return;const nextCoins=coins-item.price,nextOwned=[...ownedItems,item.id];setCoins(nextCoins);setOwnedItems(nextOwned);setEquippedHat(item.id);
    localStorage.setItem("lunaCoins",String(nextCoins));localStorage.setItem("lunaOwnedItems",JSON.stringify(nextOwned));localStorage.setItem("lunaEquippedHat",item.id);
  }

  return <main className="luna-page">
    <section className="welcome-row"><div><p className="luna-kicker">YOUR COZY CORNER</p><h1>Good morning{name ? `, ${name}` : ""} <span>🌷</span></h1><button className="edit-name" onClick={() => { setNameDraft(name); setShowNameEditor(true); }}>✎ {name ? "Edit name" : "Add your name"}</button><p>Take a breath. Let&apos;s listen to your body together.</p></div><div className="home-stats"><div className="coin-pill"><span>🪙</span><strong>{coins}</strong><small>coins</small></div><div className="streak-pill"><span>🔥</span><strong>7 day streak</strong><small>Personal best!</small></div><Link className="cloud-pill" href="/account">☁ Save to cloud</Link></div></section>

    <section className="luna-grid luna-main-grid">
      <article className="luna-card checkin-card">
        <div className="luna-card-title"><div className="title-icon coral">♡</div><div><p>DAILY CHECK-IN</p><h2>How are you feeling?</h2></div><span className="time-chip">⚡ 30 sec</span></div>
        <div className="checkin-block"><label>Mood</label><div className="mood-picker">{moods.map((item, index) => <button key={item.label} onClick={() => setMood(index + 1)} className={mood === index + 1 ? "active" : ""} aria-label={item.label}><span>{item.icon}</span><small>{item.label}</small></button>)}</div></div>
        <div className="checkin-block pain-block"><div className="label-row"><label htmlFor="pain">Pain level</label><strong>{pain}<small>/10</small></strong></div><input id="pain" type="range" min="0" max="10" value={pain} onChange={(event) => setPain(Number(event.target.value))} style={{ "--range-fill": `${pain * 10}%` } as React.CSSProperties} /><div className="range-labels"><span>No pain</span><span>Severe</span></div></div>
        <div className="checkin-block"><label>What&apos;s bothering you most?</label><div className="symptom-pills">{symptoms.map((item) => <button key={item} onClick={() => setSymptom(item)} className={symptom === item ? "active" : ""}>{item}</button>)}</div></div>
        <button className="luna-button primary" onClick={saveCheckin}>{saved ? "Check-in saved ✓" : "Save my check-in"}</button><p className="private-copy">🔒 Stored privately on this device</p>
      </article>

      <div className="right-stack">{pain > 3 && <article className={`luna-card monster-card ${chestOpen?"monster-won":""}`}><div className="battle-top"><span>⚔️ HORMONE MONSTER</span><small>{monsterHp === 0 ? "TREASURE UNLOCKED!" : "BATTLE READY"}</small></div><div className={`monster-face ${monsterHp === 0 ? "defeated" : ""}`}><b>{monsterHp === 0 ? "💫" : "👾"}</b>{chestOpen&&<span className="chest-pop">🎁</span>}</div><div className="monster-copy"><h2>{monsterHp === 0 ? "You outsmarted the Cramp Monster!" : "A Cramp Monster appeared!"}</h2><p>{monsterHp === 0 ? "Amazing! Your knowledge unlocked 50 coins." : "One quick health question can defeat this grumpy blob."}</p></div><div className="hp-row"><span>MONSTER HP</span><strong>{monsterHp}/100</strong></div><div className="hp-track"><i style={{ width: `${monsterHp}%` }} /></div><button className="luna-button battle" onClick={attackMonster} disabled={monsterHp===0}>{monsterHp === 0 ? "✓ Treasure collected" : "⚔ Fight the monster!"}</button></article>}
      <article className="luna-card pet-card"><div className="pet-visual"><span className="sparkle">✦</span><Image className="pet-image" src="/lunacare-pet.png" alt="Luna, your virtual cycle companion" width={180} height={180} priority />{equippedHat&&<span className={"equipped-hat hat-"+equippedHat} aria-label={"Equipped "+equippedHat}/>}<span className="pet-bowl">🍓</span></div><div className="pet-copy"><div className="pet-heading"><p>YOUR COMPANION</p><span>LEVEL 3</span></div><h2>Luna is feeling cuddly!</h2><p>Your little companion grows when you care for yourself.</p><div className="hunger-label"><span>Fullness</span><strong>{petHunger}%</strong></div><div className="hunger-track"><i style={{width:`${petHunger}%`}} /></div><div className="pet-actions"><button onClick={feedPet} disabled={coins<20||petHunger>=100}>🍓 Feed · 20 coins</button><button onClick={()=>setDressUpOpen(true)}>🎀 Dress up</button></div></div></article></div>
    </section>

    <section className="assistant-card"><div className="ai-orb">✦</div><div className="assistant-copy"><p>YOUR AI CARE PLAN</p><h2>Here&apos;s your 10-minute reset</h2><p>Based on pain level {pain} and {symptom.toLowerCase()}, gentle heat and movement may help you feel more comfortable.</p></div><ol className="care-steps"><li><span>1</span><div><strong>Warm it up</strong><small>Heat pack · 5 min</small></div></li><li><span>2</span><div><strong>Release tension</strong><small>Child&apos;s pose · 3 min</small></div></li><li><span>3</span><div><strong>Hydrate</strong><small>Warm water · 2 min</small></div></li></ol><Link href="/medicine" className="outline-link">Start care plan →</Link></section>

    <div className="section-title-row"><div><p className="luna-kicker">YOUR HEALTH TOOLKIT</p><h2>Everything you need, in one place</h2></div><Link href="/tracker">View all tools →</Link></div>
    <section className="toolkit-grid"><Link href="/tracker" className="kit-card"><span className="kit-icon peach">▥</span><div><h3>Cycle & symptom journal</h3><p>Flow, colour, PMS and private notes.</p><small>Log today →</small></div></Link><Link href="/tracker" className="kit-card"><span className="kit-icon purple">↗</span><div><h3>GP-ready health report</h3><p>Turn 3 months of trends into a clear PDF.</p><small>Preview report →</small></div></Link><Link href="/medicine" className="kit-card"><span className="kit-icon green">✚</span><div><h3>Instant relief hub</h3><p>Yoga and Australian OTC medicine guides.</p><small>Find relief →</small></div></Link><Link href="/pharmacy" className="kit-card"><span className="kit-icon blue">⌖</span><div><h3>Find local care</h3><p>Nearby chemists, Priceline and GPs.</p><small>Open local finder →</small></div></Link></section>
    <section className="safety-strip"><span className="safety-icon">☎</span><div><strong>Severe or unusual pain?</strong><p>Don&apos;t wait it out. A registered nurse is available 24/7.</p></div><a href="tel:1800022222"><small>CALL HEALTHDIRECT</small>1800 022 222</a></section>
    <button className="sos-fab" onClick={()=>setSosOpen(true)}><span>♡</span><strong>SOS</strong></button>
    {toast&&<div className="reward-toast" role="status">{toast}</div>}
    {showNameEditor && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="name-title"><div className="name-modal"><span className="modal-spark">✦</span><p>WELCOME TO LUNACARE</p><h2 id="name-title">What should we call you?</h2><span>Your name is only saved on this device.</span><label htmlFor="user-name">Your name</label><input id="user-name" autoFocus maxLength={30} value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} onKeyDown={(event) => event.key === "Enter" && saveName()} placeholder="Enter your name" /><button onClick={saveName} disabled={!nameDraft.trim()}>Continue →</button>{name && <button className="modal-cancel" onClick={() => setShowNameEditor(false)}>Cancel</button>}</div></div>}
    {quizOpen && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="quiz-title"><div className="quiz-modal"><div className="quiz-modal-top"><div><p>⚔️ ATTACK THE CRAMP MONSTER</p><span>Question {questionIndex + 1} of {quizQuestions.length}</span></div><button onClick={() => setQuizOpen(false)} aria-label="Close quiz">×</button></div><div className="quiz-monster">😈<span>-24 HP</span></div><h2 id="quiz-title">{quizQuestions[questionIndex].question}</h2><div className="quiz-answers">{quizQuestions[questionIndex].answers.map((item,index) => <button key={item} onClick={() => chooseAnswer(index)} className={answer === null ? "" : index === quizQuestions[questionIndex].correct ? "correct" : answer === index ? "wrong" : ""}><span>{String.fromCharCode(65 + index)}</span>{item}</button>)}</div>{answer !== null && <div className={answer === quizQuestions[questionIndex].correct ? "answer-feedback success" : "answer-feedback error"}><strong>{answer === quizQuestions[questionIndex].correct ? "Correct — powerful hit! ⚡" : "Not quite — try again"}</strong><p>{quizQuestions[questionIndex].explanation}</p></div>}<button className="quiz-continue" disabled={answer === null} onClick={continueQuiz}>{answer === quizQuestions[questionIndex].correct ? "Deal damage →" : "Try again"}</button></div></div>}
    {sosOpen&&<div className="modal-backdrop" role="dialog" aria-modal="true"><div className="sos-modal"><button className="modal-x" onClick={()=>setSosOpen(false)}>×</button><span className="sos-heart">♡</span><p>YOU&apos;RE NOT ALONE</p><h2>Is your pain severe or unusual?</h2><span>If pain is overwhelming, sudden, or different from usual, a registered nurse can help you decide what to do next.</span><a href="tel:1800022222">☎ Call Healthdirect nurse<strong>1800 022 222</strong></a><button onClick={()=>setSosOpen(false)}>I&apos;m okay for now</button><small>If you&apos;re in immediate danger, call 000.</small></div></div>}
    {syncOpen&&<div className="modal-backdrop" role="dialog" aria-modal="true"><div className="name-modal sync-modal"><button className="modal-x" onClick={()=>setSyncOpen(false)}>×</button><span className="modal-spark">☁</span><p>BACK UP YOUR PROGRESS</p><h2>Keep Luna close, everywhere.</h2><span>Cloud sync needs a Firebase or Supabase connection. Your current records remain safely on this device.</span><button onClick={()=>{setSyncOpen(false);setToast("Google Sync is ready for API connection");window.setTimeout(()=>setToast(""),2500)}}>G&nbsp; Continue with Google</button><button className="modal-cancel" onClick={()=>setSyncOpen(false)}>Maybe later</button></div></div>}
    {treasureOpen&&<div className="modal-backdrop" role="dialog" aria-modal="true"><div className="treasure-modal"><p>MONSTER DEFEATED!</p><h2>Choose your mystery chest ✨</h2><span>Pick one. All rewards will be revealed after your choice.</span><div className="chest-grid">{["A","B","C"].map((label,index)=><button key={label} onClick={()=>chooseChest(index)} className={selectedChest===index?"chosen":selectedChest!==null?"revealed":""}><span>{selectedChest===null?"🎁":"🪙"}</span><strong>Treasure Chest {label}</strong>{selectedChest!==null&&<b>{treasureRewards[index]} coins</b>}</button>)}</div>{selectedChest!==null&&<><p className="won-copy">You won <strong>{treasureRewards[selectedChest]} coins!</strong></p><button className="treasure-done" onClick={()=>setTreasureOpen(false)}>Collect reward</button></>}</div></div>}
    {dressUpOpen&&<div className="modal-backdrop" role="dialog" aria-modal="true"><div className="dressup-modal"><button className="modal-x" onClick={()=>setDressUpOpen(false)}>×</button><p>LUNA&apos;S WARDROBE</p><h2>Pick something adorable 🎀</h2><span>Your equipped accessory appears instantly on Luna.</span><div className="shop-grid">{dressUpItems.map(item=><article key={item.id}><div className={"shop-hat hat-"+item.id}/><h3>{item.name}</h3><small>{ownedItems.includes(item.id)?"Owned":"🪙 "+item.price}</small><button disabled={!ownedItems.includes(item.id)&&coins<item.price} onClick={()=>buyOrEquip(item)}>{equippedHat===item.id?"✓ Equipped":ownedItems.includes(item.id)?"Equip":"Buy & equip"}</button></article>)}</div>{equippedHat&&<button className="remove-hat" onClick={()=>{setEquippedHat(null);localStorage.removeItem("lunaEquippedHat")}}>Remove accessory</button>}</div></div>}
  </main>;
}
