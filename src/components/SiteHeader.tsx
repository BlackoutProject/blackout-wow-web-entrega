"use client";
import {useInterfaceCopy} from "@/lib/use-interface-copy";
import Link from 'next/link';
import Image from 'next/image';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState,type MouseEvent} from 'react';
import {useTranslation} from 'react-i18next';
import {useAuth} from '@/context/AuthContext';
import {LanguageSwitcher} from './LanguageSwitcher';
import {InterfaceSoundToggle} from './InterfaceSound';
export function SiteHeader(){
 const ui=useInterfaceCopy();
 const {t}=useTranslation();const path=usePathname().replace(/\/$/,'')||'/';const {accessToken,canManageDashboard,logout}=useAuth();const [open,setOpen]=useState(false);
 const header=useRef<HTMLElement>(null);
 const menuButton=useRef<HTMLButtonElement>(null);
 useEffect(()=>setOpen(false),[path]);
 useEffect(()=>{
  if(!open)return;
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);menuButton.current?.focus({preventScroll:true});}};
  const outside=(event:PointerEvent)=>{if(!header.current?.contains(event.target as Node))setOpen(false);};
  document.addEventListener('keydown',escape);document.addEventListener('pointerdown',outside);
  return()=>{document.removeEventListener('keydown',escape);document.removeEventListener('pointerdown',outside);};
 },[open]);
 const links=[{href:'/servidor',label:t('nav.server')},{href:'/como-conectarme',label:t('nav.connect')},{href:'/terminos-y-condiciones',label:t('nav.rules')}];
 if(canManageDashboard)links.push({href:'/dashboard/productos',label:t('nav.dashboard')});
 const goHome=(event:MouseEvent<HTMLAnchorElement>)=>{
  if(path!=='/'||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  setOpen(false);
  window.history.replaceState(null,'','/');
  window.scrollTo({top:0,left:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 };
 return <header ref={header} className="site-header"><div className="site-header-inner">
  <Link href="/" onClick={goHome} className="site-brand" aria-label={t('nav.homeAria')}><Image src="/warcraft/crest.webp" width={78} height={58} sizes="78px" quality={85} alt=""/><span>BLACKOUT<small>CUSTOM · 255 · 3.3.5a</small></span></Link>
  <nav className="site-nav" aria-label={ui("Principal")}>{links.map(l=><Link key={l.href} href={l.href} aria-current={path===l.href?'page':undefined}>{l.label}</Link>)}</nav>
  <div className="site-header-actions">{accessToken?<Link href="/cuenta" className="site-account">{t('nav.account')} <span>↗</span></Link>:<><Link href="/registro" className="site-account site-register">{t('nav.register')}</Link><Link href="/login" className="site-account">{t('nav.login')} <span>↗</span></Link></>}<LanguageSwitcher/><InterfaceSoundToggle/><button ref={menuButton} type="button" className="site-menu-button" aria-controls="site-mobile-menu" aria-expanded={open} aria-label={t(open?'nav.closeMenu':'nav.openMenu')} onClick={()=>setOpen(v=>!v)}><span/ ><span/ ></button></div>
 </div><nav id="site-mobile-menu" className="site-mobile-menu" aria-label={ui("Navegación móvil")} hidden={!open}>{links.map(l=><Link key={l.href} href={l.href} onClick={()=>setOpen(false)} aria-current={path===l.href?'page':undefined}>{l.label}<span>↗</span></Link>)}<Link href={accessToken?'/cuenta':'/registro'}>{accessToken?t('nav.account'):t('nav.register')}</Link>{accessToken&&<button onClick={()=>{logout();setOpen(false);}}>{t('nav.logout')}</button>}</nav></header>;
}
