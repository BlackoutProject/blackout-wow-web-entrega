"use client";
import {useInterfaceCopy} from "@/lib/use-interface-copy";
import Link from 'next/link';
import Image from 'next/image';
import {usePathname} from 'next/navigation';
import {useTranslation} from 'react-i18next';
import {SiteHeader} from './SiteHeader';
import {PortalBackdrop} from './PortalBackdrop';
import {WarcraftMotion} from './WarcraftMotion';
import {FooterSocialLinks} from './FooterSocialLinks';
import {WarcraftVisualEffects} from './WarcraftVisualEffects';
import {useAuth} from '@/context/AuthContext';
export function SiteShell({children}:{children:React.ReactNode}){
 const ui=useInterfaceCopy();
 const path=usePathname();const home=path==='/';const {t}=useTranslation();const {accessToken,canManageDashboard,logout}=useAuth();
 return <WarcraftMotion><div className={`site-shell ${home?'site-shell-home':'portal-page'}`} data-route={path.replace(/\/$/,'')}>
 <a href="#site-main" className="site-skip">{ui("Ir al contenido")}</a><SiteHeader/>{!home&&<PortalBackdrop path={path}/>}
 <main id="site-main" className={home?'site-main':'portal-main'}>{children}</main><WarcraftVisualEffects/>
 <footer className="site-footer"><div className="site-footer-top"><Link href="/" className="site-brand"><Image src="/warcraft/crest.webp" width={96} height={72} sizes="110px" quality={85} alt=""/><span>BLACKOUT<small>{ui("ÚNICO.")}<br/>{ui("SIN LÍMITES.")}</small></span></Link><p>BLACKOUT-WOW<br/><span>{ui("Nivel 255 · PvE & PvP · Custom")}</span></p><FooterSocialLinks/></div>
 <div className="site-footer-links"><Link href="/servidor">{t('nav.server')}</Link><Link href="/como-conectarme">{t('nav.connect')}</Link>{!accessToken&&<><Link href="/registro">{t('nav.register')}</Link><Link href="/login">{t('nav.login')}</Link></>}<Link href="/recuperar">{t('auth.login.forgotPassword')}</Link><Link href="/terminos-y-condiciones">{t('footer.terms')}</Link>{accessToken&&<Link href="/cuenta">{t('nav.account')}</Link>}{canManageDashboard&&<Link href="/dashboard/productos">{t('nav.dashboard')}</Link>}{accessToken&&<button onClick={logout}>{t('nav.logout')}</button>}</div>
 <div className="site-footer-bottom"><div className="site-footer-legal"><p className="site-footer-copyright">© {new Date().getUTCFullYear()} Blackout-WoW.</p><p>{t('footer.rightsReserved')}</p></div><a href="#site-main" aria-label={ui("Volver arriba")}>↑</a></div></footer></div></WarcraftMotion>;
}
