"use client";
import {useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {useRouter} from "next/navigation";
import {type AppLanguage, languageCookieName, isSupportedLanguage} from "@/i18n/settings";

const languages = [{code:"es",name:"Español"},{code:"en",name:"English"},{code:"pt",name:"Português"}] as const;

function Flag({language}:{language:AppLanguage}) {
  return <svg className="language-flag" viewBox="0 0 24 16" aria-hidden="true">
    {language==="es"?<><path fill="#aa151b" d="M0 0h24v16H0z"/><path fill="#f1bf00" d="M0 4h24v8H0z"/></>:
     language==="en"?<><path fill="#17356d" d="M0 0h24v16H0z"/><path stroke="#fff" strokeWidth="4" d="m0 0 24 16M24 0 0 16"/><path stroke="#c8102e" strokeWidth="1.5" d="m0 0 24 16M24 0 0 16"/><path stroke="#fff" strokeWidth="6" d="M12 0v16M0 8h24"/><path stroke="#c8102e" strokeWidth="3" d="M12 0v16M0 8h24"/></>:
     <><path fill="#009739" d="M0 0h24v16H0z"/><path fill="#ffdf00" d="m12 2 10 6-10 6L2 8z"/><circle cx="12" cy="8" r="3.7" fill="#002776"/><path d="M8.5 6.8c2.3-.2 4.7.7 6.7 2.2" stroke="white" strokeWidth=".8" fill="none"/></>}
  </svg>;
}
export function LanguageSwitcher() {
  const router=useRouter();
  const {i18n}=useTranslation();
  const language=isSupportedLanguage(i18n.language)?i18n.language:"es";
  const [open,setOpen]=useState(false);
  const root=useRef<HTMLDivElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  const label=language==="en"?"Change language":language==="pt"?"Alterar idioma":"Cambiar idioma";
  useEffect(()=>{
    if(!open)return;
    const close=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false);};
    document.addEventListener("pointerdown",close);
    return()=>document.removeEventListener("pointerdown",close);
  },[open]);
  const choose=(code:AppLanguage)=>{
    document.cookie=`${languageCookieName}=${code}; path=/; max-age=31536000; samesite=lax`;
    void i18n.changeLanguage(code);
    // Preserve native section links when the server refreshes translated metadata.
    window.history.replaceState(null,"",window.location.href);
    router.refresh();
    setOpen(false);trigger.current?.focus({preventScroll:true});
  };
  const focusItem=(index:number)=>root.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')[index]?.focus();
  return <div className="site-language language-picker" ref={root} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setOpen(false);}} onKeyDown={e=>{
    if(e.key==="Escape"){setOpen(false);trigger.current?.focus({preventScroll:true});}
  }}>
    <button ref={trigger} type="button" className="language-trigger" aria-label={label} aria-expanded={open} aria-haspopup="menu" aria-controls="language-options" onClick={()=>setOpen(value=>!value)} onKeyDown={e=>{
      if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();setOpen(true);requestAnimationFrame(()=>focusItem(e.key==="ArrowUp"?2:0));}
    }}><Flag language={language}/><span>{language.toUpperCase()}</span><span className="language-chevron" aria-hidden="true">⌄</span></button>
    <div className="language-options" id="language-options" role="menu" aria-label={label} hidden={!open}>
      {languages.map((item,index)=><button type="button" role="menuitemradio" aria-checked={language===item.code} key={item.code} onClick={()=>choose(item.code)} onKeyDown={e=>{
        const next=e.key==="ArrowDown"?(index+1)%3:e.key==="ArrowUp"?(index+2)%3:e.key==="Home"?0:e.key==="End"?2:null;
        if(next!==null){e.preventDefault();focusItem(next);}
      }}><Flag language={item.code}/><span lang={item.code}>{item.name}</span><span aria-hidden="true">{language===item.code?"✓":""}</span></button>)}
    </div>
  </div>;
}
