"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function AccountPage(){
 const [user,setUser]=useState<User|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{if(!supabase){setLoading(false);return}supabase.auth.getSession().then(({data})=>{setUser(data.session?.user??null);setLoading(false)});const{data}=supabase.auth.onAuthStateChange((_event,session)=>setUser(session?.user??null));return()=>data.subscription.unsubscribe()},[]);
 async function signIn(){if(!supabase)return;setError("");const{error}=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:window.location.origin+"/account"}});if(error)setError(error.message)}
 async function signOut(){await supabase?.auth.signOut();setUser(null)}
 const name=user?.user_metadata?.full_name||user?.user_metadata?.name||"LunaCare member",initial=name.charAt(0).toUpperCase();
 return <main className="account-page"><section className="account-shell">
  <div className="account-visual"><div className="account-cloud">☁</div><span>✦</span><h1>Your cycle story,<br/>safe and close.</h1><p>Sign in to keep your check-ins, journal and Luna&apos;s progress connected across devices.</p><ul><li>🔒 Private by design</li><li>☁️ Cloud backup</li><li>🌷 Continue on any device</li></ul></div>
  <div className="account-card">{loading?<div className="account-loading">Loading your account…</div>:user?<><div className="account-avatar">{user.user_metadata?.avatar_url?<img src={user.user_metadata.avatar_url} alt="Google profile"/>:initial}</div><p>WELCOME BACK</p><h2>{name}</h2><span>{user.email}</span><div className="sync-status"><i>✓</i><div><strong>Google account connected</strong><small>Your sign-in session is securely managed by Supabase.</small></div></div><div className="account-data"><div><small>LOCAL COINS</small><strong>{typeof window!=="undefined"?localStorage.getItem("lunaCoins")??"100":"100"}</strong></div><div><small>JOURNAL</small><strong>Ready to sync</strong></div></div><button className="account-secondary" onClick={signOut}>Sign out</button><Link href="/">← Back to LunaCare</Link></>:<><span className="account-logo">✦</span><p>WELCOME TO LUNACARE</p><h2>Save your progress</h2><span>Continue with Google to create your secure LunaCare account.</span><button className="google-button" onClick={signIn} disabled={!isSupabaseConfigured}><b>G</b> Continue with Google</button>{!isSupabaseConfigured&&<div className="auth-setup"><strong>Google login needs one-time setup</strong><p>Add your Supabase URL and publishable key to the environment file, then enable Google in Supabase Authentication.</p><code>NEXT_PUBLIC_SUPABASE_URL<br/>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code></div>}{error&&<p className="auth-error">{error}</p>}<small className="account-privacy">By continuing, your Google account is used only to identify your LunaCare profile.</small><Link href="/">Continue without an account</Link></>}</div>
 </section></main>
}
