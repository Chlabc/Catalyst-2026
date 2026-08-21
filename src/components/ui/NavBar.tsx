"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const links = [{ href: "/", label: "Today" }, { href: "/tracker", label: "Journal" }, { href: "/calendar", label: "Period 101" }, { href: "/medicine", label: "Relief" }, { href: "/pharmacy", label: "Find care" }];
export function NavBar() {
  const pathname = usePathname(); const [open, setOpen] = useState(false);const[email,setEmail]=useState("");
  useEffect(()=>{if(!supabase)return;supabase.auth.getSession().then(({data})=>setEmail(data.session?.user.email??""));const{data}=supabase.auth.onAuthStateChange((_event,session)=>setEmail(session?.user.email??""));return()=>data.subscription.unsubscribe()},[]);
  return <header className="luna-nav"><nav><Link href="/" className="luna-brand"><span>✦</span><b>LunaCare</b></Link><ul>{links.map((link) => <li key={link.href}><Link className={pathname === link.href ? "nav-active" : ""} href={link.href}>{link.label}</Link></li>)}</ul><div className="nav-actions"><button onClick={() => setOpen(!open)} aria-label="Notifications" aria-expanded={open}>♢</button><Link className={email?"avatar signed":"account-link"} href="/account" aria-label="Account">{email?email.charAt(0).toUpperCase():"Sign in"}</Link>{open && <div className="notification-pop"><strong>You&apos;re all caught up</strong><p>Your daily check-in is ready whenever you are.</p><Link href="/">Check in now →</Link></div>}</div></nav></header>;
}
