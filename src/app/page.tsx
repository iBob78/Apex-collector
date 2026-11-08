'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseBrowser';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Flag, Gauge, Layers3, ShoppingBag, Sparkles, Trophy, Zap } from 'lucide-react';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';

const sectors = [
  { id: '01', href: '/how-to-play', image: '/showcase-boosters.png', tag: 'PIT LANE / UNSEAL', key: 'Système de Boosters Premium', text: 'Des packs exclusifs pour tous les collectionneurs', icon: Zap },
  { id: '02', href: '/how-to-play', image: '/showcase-card.png', tag: 'GARAGE / ARCHIVE', key: 'MA COLLECTION', text: 'Collection complète des véhicules, circuits et pilotes d’exception.', icon: Layers3 },
  { id: '03', href: '/how-to-play', image: '/showcase-marketplace.png', tag: 'PADDOCK / TRADING', key: 'Marketplace Mondial', text: 'Achetez, vendez et dominez l’économie', icon: ShoppingBag },
];

export default function LandingPage() {
  const { t } = useSitePreferences();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (data.user) router.push('/dashboard');
      else setMounted(true);
    }).catch(() => {
      if (active) setMounted(true);
    });
    return () => { active = false; };
  }, [router, supabase]);

  if (!mounted) return null;

  return (
    <main className="apex-paddock paddock-landing min-h-screen overflow-hidden text-white">
      <header className="relative z-30 flex min-h-[76px] items-center justify-between gap-3 border-b border-white/20 bg-[#111613] px-4 sm:px-9 lg:px-14">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Apex Collector">
          <span className="flex h-10 w-10 items-center justify-center bg-[#dbff35] text-[#111510]">
            <Flag size={22} strokeWidth={2.8} aria-hidden="true"/>
          </span>
          <div className="font-['Barlow_Condensed'] text-[26px] font-black uppercase leading-[.76] tracking-[-.045em] sm:text-[31px]">
            APEX <span className="block text-[#dbff35]">COLLECTOR</span>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 font-['Barlow_Condensed'] text-[13px] font-extrabold uppercase tracking-[.14em] text-gray-300 md:flex" aria-label="Explorer">
          <a href="#concept" className="transition hover:text-[#dbff35]">THE CONCEPT</a>
          <a href="#race-journey" className="transition hover:text-[#dbff35]">THE GRID</a>
          <Link href="/how-to-play" className="transition hover:text-[#dbff35]">{t('How to play')}</Link>
        </nav>
        <Link href="/login" className="paddock-action min-h-10 shrink-0 px-4 sm:px-6">
          {t('Connexion')} <ArrowUpRight size={16} aria-hidden="true"/>
        </Link>
      </header>

      {/* Racing photography and diagonal overprint take over the entire first screen. */}
      <section className="relative isolate min-h-[min(790px,91dvh)] overflow-hidden bg-[#111713]" aria-label="Apex Collector Motorsport">
        <div className="race-photo absolute inset-0" aria-hidden="true" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,9,7,.94)_0%,rgba(8,11,9,.67)_50%,rgba(5,8,6,.24)_100%)]" aria-hidden="true" />
        <div className="absolute -right-14 -top-16 rotate-[-12deg] font-['Barlow_Condensed'] text-[230px] font-black leading-none tracking-[-.09em] text-white/[.08] sm:text-[470px]" aria-hidden="true">01</div>
        <div className="relative z-10 mx-auto flex min-h-[min(790px,91dvh)] max-w-[1600px] flex-col justify-end px-5 pb-12 pt-24 sm:px-10 sm:pb-16 lg:px-16">
          <motion.div initial={{ opacity: 0, x: -34 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .55 }} className="max-w-[960px]">
            <span className="race-poster-label">THE MOTORSPORT COLLECTION / 001</span>
            <p className="race-eyebrow mb-5 mt-7">COLLECT // COMPETE // CREATE YOUR LEGACY</p>
            <h1 className="font-['Barlow_Condensed'] text-[clamp(4.4rem,13vw,12rem)] font-black uppercase leading-[.71] tracking-[-.065em]">
              <span className="block">{t('Collectionnez')}</span>
              <span className="block text-[#dbff35]">{t('l’Élite Automobile')}</span>
            </h1>
            <p className="mt-7 max-w-[600px] border-l-[3px] border-[#f4523d] pl-4 text-[14px] font-medium leading-relaxed text-gray-200 sm:mt-10 sm:text-[18px]">
              {t('Ouvrez des packs premium, construisez votre garage légendaire et dominez le marché mondial. Chaque carte est une icône automobile rare.')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3 sm:mt-10">
              <Link href="/login" className="paddock-action min-h-[54px] px-7 sm:px-9">
                {t('Commencer Gratuitement')} <ArrowRight size={18} aria-hidden="true"/>
              </Link>
              <a href="#concept" className="paddock-ghost inline-flex min-h-[54px] items-center gap-3 px-6 font-['Barlow_Condensed'] text-[14px] font-black uppercase tracking-[.13em]">
                THE EXPERIENCE <ArrowUpRight size={17} aria-hidden="true"/>
              </a>
            </div>
          </motion.div>
          <div className="mt-16 flex items-center gap-4 border-t border-white/30 pt-5 font-mono text-[10px] font-bold uppercase tracking-[.12em] text-white/65">
            <span className="text-[#dbff35]">AC // RACING DEPARTMENT</span>
            <span className="h-px flex-1 bg-white/25"/>
            <span className="hidden sm:inline">GARAGE · BOOSTERS · MARKET</span>
            <span>01 / 03</span>
          </div>
        </div>
      </section>

      <div className="race-ticker" aria-label="Apex Collector, Garage, Boosters, Marketplace">
        <div className="race-ticker-track" aria-hidden="true">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i}>APEX COLLECTOR <span className="mx-7 text-[#f4523d]">✦</span> MOTORSPORT CULTURE <span className="mx-7">///</span> THE GARAGE <span className="mx-7 text-[#f4523d]">✦</span> OPEN THE PACKS <span className="mx-7">///</span></span>
          ))}
        </div>
      </div>

      <section id="concept" className="mx-auto max-w-[1600px] px-5 py-16 sm:px-10 sm:py-24 lg:px-16">
        <div className="grid items-end gap-7 border-b border-white/25 pb-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <p className="race-eyebrow">02 / THE CONCEPT</p>
            <h2 className="race-display mt-5 max-w-[900px]">BUILT FOR <span className="text-[#dbff35]">COLLECTORS.</span></h2>
          </div>
          <p className="border-l-4 border-[#f4523d] pl-5 text-[15px] font-medium leading-relaxed text-gray-300">
            {t('Une expérience de collection premium avec des mécaniques de jeu avancées')}
          </p>
        </div>

        <div className="mt-9 grid gap-3 lg:grid-cols-3">
          {sectors.map((sector, index) => {
            const Icon = sector.icon;
            return (
              <motion.article key={sector.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .4, delay: index * .08 }}
                className="group relative flex min-h-[420px] flex-col overflow-hidden border border-white/25 bg-[#161b17]">
                <div className="relative h-[205px] overflow-hidden bg-[#0b0e0c] sm:h-[250px]">
                  <img src={sector.image} alt="" loading="lazy" className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161b17] to-transparent"/>
                  <span className="absolute left-5 top-5 bg-[#dbff35] px-3 py-1 font-['Barlow_Condensed'] text-[13px] font-black text-black">{sector.id} / 03</span>
                  <div className="absolute bottom-0 right-2 font-['Barlow_Condensed'] text-[110px] font-black leading-[.75] text-white/10">{sector.id}</div>
                </div>
                <div className="relative flex flex-1 flex-col p-6">
                  <p className="race-eyebrow">{sector.tag}</p>
                  <h3 className="mt-3 font-['Barlow_Condensed'] text-[34px] font-black uppercase leading-[.87] text-white sm:text-[41px]">{t(sector.key)}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-400">{t(sector.text)}</p>
                  <Link href={sector.href} className="mt-7 flex items-center justify-between border-t border-white/25 pt-4 font-['Barlow_Condensed'] text-[13px] font-black uppercase tracking-[.12em] text-[#dbff35] hover:text-white">
                    <span>{t('How to play')}</span><Icon size={22} aria-hidden="true"/>
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section id="race-journey" className="bg-[#dbff35] px-5 py-16 text-[#0d120c] sm:px-10 sm:py-20 lg:px-16">
        <div className="mx-auto max-w-[1500px]">
          <p className="font-['Barlow_Condensed'] text-[12px] font-black uppercase tracking-[.2em]">03 / STARTING GRID</p>
          <h2 className="mt-3 font-['Barlow_Condensed'] text-[clamp(4rem,9vw,9rem)] font-black uppercase leading-[.77] tracking-[-.055em]">YOUR ROAD TO THE TOP<span className="text-[#f4523d]">.</span></h2>
          <div className="mt-12 grid gap-[2px] bg-[#0d130b]/25 md:grid-cols-4">
            {[
              { id:'01', label:t('Créez votre compte'), icon:Flag },
              { id:'02', label:t('Ouvrez des boosters'), icon:Zap },
              { id:'03', label:t('Explorez votre garage'), icon:Gauge },
              { id:'04', label:t('Suivez vos missions'), icon:Trophy },
            ].map(({ id, label, icon: Icon }) => (
              <div key={id} className="flex flex-col justify-between gap-7 bg-[#dbff35] p-5 sm:p-7">
                <div className="flex items-start justify-between"><span className="font-['Barlow_Condensed'] text-[65px] font-black leading-[.75]">{id}</span><Icon size={29} aria-hidden="true"/></div>
                <h3 className="max-w-[250px] font-['Barlow_Condensed'] text-[27px] font-black uppercase leading-[.88]">{label}</h3>
              </div>
            ))}
          </div>
          <Link href="/how-to-play" className="mt-8 inline-flex min-h-12 items-center gap-4 border border-[#0d120c] bg-[#111710] px-6 font-['Barlow_Condensed'] text-[14px] font-black uppercase tracking-[.15em] text-white transition hover:bg-[#2b3526]">
            {t('How to play')} <ArrowUpRight size={18} aria-hidden="true"/>
          </Link>
        </div>
      </section>

      <section className="race-photo-soft relative overflow-hidden border-y border-white/20">
        <div className="mx-auto flex min-h-[470px] max-w-[1500px] flex-col justify-end px-5 py-16 sm:px-10 lg:px-16">
          <p className="race-eyebrow">APEX / DRIVER ACCESS</p>
          <h2 className="race-display mt-4 max-w-[900px]">THE GRID <span className="text-[#dbff35]">IS WAITING.</span></h2>
          <p className="mt-6 max-w-xl text-base text-gray-300">{t('Créez votre compte gratuitement et recevez votre premier pack de bienvenue pour démarrer votre collection.')}</p>
          <Link href="/login" className="paddock-action mt-8 min-h-[52px] w-fit px-7">
            {t('Créer mon Garage Elite')} <ArrowRight size={18} aria-hidden="true"/>
          </Link>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4 bg-[#090c0a] px-5 py-6 text-[10px] font-extrabold uppercase tracking-[.14em] text-gray-500 sm:px-10">
        <span className="text-white">APEX <span className="text-[#dbff35]">COLLECTOR</span> / RACING DEPARTMENT</span>
        <span>COLLECT / DISCOVER / TRADE</span>
        <Link href="/how-to-play" className="hover:text-[#dbff35]">{t('How to play')} ↗</Link>
      </footer>
    </main>
  );
}
