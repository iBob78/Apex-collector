'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseBrowser';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  TrophyIcon,
  PackageIcon,
  StoreIcon,
  ZapIcon,
  ArrowRightIcon,
  SparklesIcon,
  CrownIcon,
  CoinsIcon,
  TargetIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  UsersIcon
} from 'lucide-react';
import Link from 'next/link';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';

export default function LandingPage() {
  const { t } = useSitePreferences();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { scrollYProgress } = useScroll();

  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.push('/dashboard');
      } else {
        setUser(null);
      }
    });
  }, [router, supabase]);

  if (!mounted || user) return null;

  return (
    <main className="apex-paddock paddock-landing min-h-screen overflow-hidden text-white">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Animated Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-indigo-600/10 blur-[150px] rounded-full"
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-50 flex items-center justify-between gap-2 border-b border-cyan-100/15 bg-[#0b1827]/90 px-4 py-4 backdrop-blur-xl sm:px-8 sm:py-5"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-200/40 bg-gradient-to-br from-[#1a8ba5] to-[#123958]"
          >
            <SparklesIcon size={20} className="text-white" />
          </motion.div>
          <h1 className="text-[26px] font-normal uppercase leading-none tracking-wide" style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}>APEX <span className="text-[#e7c18a]">COLLECTOR</span></h1>
        </div>
        <Link
          href="/login"
          className="paddock-ghost rounded-lg px-4 py-2.5 text-[10px] font-black uppercase tracking-wider sm:px-6"
        >
          {t('Connexion')}
        </Link>
      </motion.header>

      <div className="relative z-10">
        {/* Hero Section */}
        <motion.section
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative flex min-h-[80dvh] flex-col items-center justify-center px-4 py-14 sm:px-8 sm:py-20 lg:py-24"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,.96fr)] lg:gap-16"
          >
            <div className="min-w-0 text-center lg:text-left">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-7 inline-flex items-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/[0.08] px-4 py-2.5"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <ZapIcon size={16} className="text-blue-500" />
              </motion.div>
              <span className="text-xs font-black uppercase tracking-widest text-blue-400">{t('Saison 1 · Édition Limitée')}</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="paddock-landing-title mb-5 uppercase sm:mb-7"
            >
              <span className="bg-gradient-to-r from-white via-blue-200 to-indigo-300 bg-clip-text text-transparent">
                {t('Collectionnez')}
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {t('l’Élite Automobile')}
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mb-7 max-w-xl text-base leading-relaxed text-[#b7cadc] sm:mb-10 sm:text-xl"
            >
              {t('Ouvrez des packs premium, construisez votre garage légendaire et dominez le marché mondial. Chaque carte est une icône automobile rare.')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-wrap items-center justify-center gap-4 lg:justify-start"
            >
              <Link
                href="/login"
                className="paddock-action group relative flex min-h-14 items-center gap-4 overflow-hidden px-6 py-4 sm:px-8"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-20"
                  animate={{ x: [-100, 100] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="relative z-10">{t('Commencer Gratuitement')}</span>
                <ArrowRightIcon size={20} className="relative z-10 group-hover:translate-x-2 transition-transform" />
              </Link>
            </motion.div>
            </div>
            <div className="relative mx-auto flex w-full max-w-[550px] items-center justify-center lg:max-w-none">
              <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-[90px]" aria-hidden="true" />
              <div className="absolute left-2 top-9 z-10 rounded-lg border border-[#e7c18a]/40 bg-[#101b2b]/90 px-3 py-2 font-mono text-[10px] uppercase tracking-[.18em] text-[#e7c18a] sm:left-6">APEX // 001</div>
              <div className="absolute bottom-6 right-0 z-10 rounded-lg border border-cyan-300/25 bg-[#0b1725]/95 px-4 py-3 shadow-2xl sm:bottom-12">
                <p className="text-[9px] font-black uppercase tracking-[.22em] text-cyan-300">GARAGE / COLLECTION</p>
                <p className="mt-1 text-sm font-bold uppercase text-white">{t('l’Élite Automobile')}</p>
              </div>
              <div className="relative w-[76%] max-w-[385px]">
                <div className="absolute -inset-8 rounded-full border border-cyan-200/10 sm:-inset-12" aria-hidden="true" />
                <img src="/showcase-card.png" alt={t('Carte')} className="paddock-landing-image relative w-full rounded-2xl" />
              </div>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="paddock-panel relative mx-auto mt-10 grid w-full max-w-5xl grid-cols-2 gap-2 p-2 backdrop-blur-xl sm:mt-12 sm:grid-cols-3 sm:gap-3 sm:p-3"
          >
            <StatItem value="03" label={t('Véhicules') + " / " + t('Circuits') + " / " + t('Pilotes')} />
            <StatItem value="∞" label={t('Possibilités')} />
            <StatItem value="24/7" label={t('Marketplace')} className="col-span-2 sm:col-span-1" />
          </motion.div>
        </motion.section>

        {/* Features Deep Dive */}
        <section className="relative px-4 py-20 sm:px-8 sm:py-28">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-14 text-center"
            >
              <h3 className="paddock-title mb-4">
                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  {t('Trois Piliers d’Excellence')}
                </span>
              </h3>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                {t('Une expérience de collection premium avec des mécaniques de jeu avancées')}
              </p>
            </motion.div>

            <div className="space-y-16 sm:space-y-24">
              <DetailedFeature
                icon={<PackageIcon size={40} />}
                title={t('Système de Boosters Premium')}
                description={t('Des packs exclusifs pour tous les collectionneurs')}
                image="/showcase-boosters.png"
                features={[
                  { icon: <CrownIcon size={18} />, text: t('Pack Carbon, Icon & Legendary avec raretés exclusives') },
                  { icon: <SparklesIcon size={18} />, text: t('Animation d’ouverture cinématique immersive') },
                  { icon: <TrophyIcon size={18} />, text: t('Cartes garanties selon la rareté du pack') },
                  { icon: <ZapIcon size={18} />, text: t('Distribution équilibrée avec anti-doublon intelligent') }
                ]}
                gradient="from-blue-500/20 to-cyan-500/20"
                index={0}
              />

              <DetailedFeature
                icon={<StoreIcon size={40} />}
                title={t('Marketplace Mondial')}
                description={t('Achetez, vendez et dominez l’économie')}
                image="/showcase-marketplace.png"
                features={[
                  { icon: <CoinsIcon size={18} />, text: t('Transactions en Apex Points (AP) - Monnaie premium') },
                  { icon: <TrendingUpIcon size={18} />, text: t('Fixez vos propres prix et stratégies de vente') },
                  { icon: <ShieldCheckIcon size={18} />, text: t('Système anti-fraude et transactions sécurisées') },
                  { icon: <UsersIcon size={18} />, text: t('Marché en temps réel avec autres collectionneurs') }
                ]}
                gradient="from-indigo-500/20 to-purple-500/20"
                index={1}
                reverse
              />

              <DetailedFeature
                icon={<TrophyIcon size={40} />}
                title={t('Missions & Contrats')}
                description={t('Complétez des défis pour gagner des récompenses')}
                image="/showcase-missions.png"
                features={[
                  { icon: <TargetIcon size={18} />, text: t('Contrats quotidiens avec objectifs progressifs') },
                  { icon: <CoinsIcon size={18} />, text: t('Récompenses en AP pour chaque mission complétée') },
                  { icon: <ZapIcon size={18} />, text: t('Suivi automatique de progression en temps réel') },
                  { icon: <CrownIcon size={18} />, text: t('Défis spéciaux pour débloquer des cartes exclusives') }
                ]}
                gradient="from-purple-500/20 to-pink-500/20"
                index={2}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative px-4 py-20 sm:px-8 sm:py-28">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="paddock-hero relative overflow-hidden p-7 text-center sm:p-16"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"
              />

              <div className="relative z-10">
                <h3 className="paddock-title mb-6">
                  <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    {t('Rejoignez l’Élite')}
                  </span>
                </h3>
                <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                  {t('Créez votre compte gratuitement et recevez votre premier pack de bienvenue pour démarrer votre collection.')}
                </p>
                <Link
                  href="/login"
                  className="paddock-action group inline-flex min-h-14 items-center gap-4 px-9 py-4"
                >
                  {t('Créer mon Garage Elite')}
                  <ArrowRightIcon size={20} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

      </div>
    </main>
  );
}

function StatItem({ value, label, className = '' }: { value: string; label: string; className?: string }) {
  return (
    <div className={'paddock-tile flex min-w-0 flex-col items-center justify-center px-3 py-4 text-center sm:px-4 sm:py-5 ' + className}>
      <div className="paddock-stat-number tabular-nums text-[#e7c18a]">{value}</div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 sm:text-xs">{label}</div>
    </div>
  );
}

function DetailedFeature({
  icon,
  title,
  description,
  image,
  features,
  gradient,
  index,
  reverse = false
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  image?: string;
  features: { icon: React.ReactNode; text: string }[];
  gradient: string;
  index: number;
  reverse?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`grid md:grid-cols-2 gap-12 items-center ${reverse ? 'md:flex-row-reverse' : ''}`}
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`paddock-hero relative overflow-hidden bg-gradient-to-br ${gradient} p-6 sm:p-9 ${reverse ? 'md:order-2' : ''}`}
      >
        {image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-8 rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
          >
            <img
              src={image}
              alt={title}
              className="w-full h-auto"
            />
          </motion.div>
        )}
        <motion.div
          whileHover={{ rotate: 5, scale: 1.1 }}
          className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-white mb-8"
        >
          {icon}
        </motion.div>
        <h4 className="paddock-section-title mb-3">{title}</h4>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </motion.div>

      <div className={`space-y-4 ${reverse ? 'md:order-1' : ''}`}>
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: reverse ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
            whileHover={{ x: reverse ? -10 : 10 }}
            className="paddock-tile group flex items-start gap-4 p-5 backdrop-blur-sm"
          >
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 flex-shrink-0 group-hover:scale-110 transition-transform">
              {feature.icon}
            </div>
            <p className="text-sm text-gray-300 leading-relaxed pt-1">{feature.text}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}