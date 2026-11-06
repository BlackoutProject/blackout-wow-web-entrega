"use client";
import {useEffect,useMemo} from 'react';
import {I18nextProvider} from 'react-i18next';
import {ensureI18nInitialized} from '@/i18n/client';
import {type AppLanguage,resolveAppLanguage,languageCookieName} from '@/i18n/settings';
export function LanguageProvider({children,initialLanguage}:{children:React.ReactNode;initialLanguage:AppLanguage}){
 const i18n=useMemo(()=>ensureI18nInitialized(initialLanguage),[initialLanguage]);
 useEffect(()=>{
  const stored=document.cookie.split('; ').find(value=>value.startsWith(languageCookieName+'='))?.split('=')[1];
  const language=resolveAppLanguage(stored);void i18n.changeLanguage(language);document.documentElement.lang=language;
  const sync=(value:string)=>{document.documentElement.lang=value;};i18n.on('languageChanged',sync);return()=>{i18n.off('languageChanged',sync);};
 },[i18n,initialLanguage]);
 return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
