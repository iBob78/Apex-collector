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

export default function LandingPage() {
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
    <main className="min-h-screen bg-[#050505] text-white overflow-hidden">
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
        className="relative z-50 flex justify-between items-center px-8 py-6 backdrop-blur-xl bg-black/20 border-b border-white/5"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"
          >
            <SparklesIcon size={20} className="text-white" />
          </motion.div>
          <h1 className="text-xl font-black uppercase italic tracking-tighter">Apex Collector</h1>
        </div>
        <Link
          href="/login"
          className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors px-6 py-2 rounded-full border border-white/10 hover:border-white/30"
        >
          Connexion
        </Link>
      </motion.header>

      <div className="relative z-10">
        {/* Hero Section */}
        <motion.section
          style={{ y: heroY, opacity: heroOpacity }}
          className="min-h-screen flex flex-col justify-center items-center px-8 relative"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-5 py-2.5 mb-10"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <ZapIcon size={16} className="text-blue-500" />
              </motion.div>
              <span className="text-xs font-black uppercase tracking-widest text-blue-400">Saison 1 · Édition Limitée</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-8xl font-black uppercase italic tracking-tighter mb-8 leading-none"
            >
              <span className="bg-gradient-to-r from-white via-blue-200 to-indigo-300 bg-clip-text text-transparent">
                Collectionnez
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                l'Élite Automobile
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-2xl text-gray-400 max-w-3xl mx-auto mb-16 leading-relaxed font-light"
            >
              Ouvrez des packs premium, construisez votre garage légendaire et dominez le marché mondial.
              Chaque carte est une icône automobile rare.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex items-center justify-center gap-6"
            >
              <Link
                href="/login"
                className="group relative bg-blue-600 hover:bg-blue-500 px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-blue-500/40 flex items-center gap-4 overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-20"
                  animate={{ x: [-100, 100] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="relative z-10">Commencer Gratuitement</span>
                <ArrowRightIcon size={20} className="relative z-10 group-hover:translate-x-2 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-10 py-6"
          >
            <StatItem value="500+" label="Cartes Uniques" />
            <div className="w-px h-12 bg-white/10" />
            <StatItem value="∞" label="Possibilités" />
            <div className="w-px h-12 bg-white/10" />
            <StatItem value="24/7" label="Marketplace" />
          </motion.div>
        </motion.section>

        {/* Features Deep Dive */}
        <section className="py-32 px-8 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h3 className="text-5xl font-black uppercase italic tracking-tighter mb-4">
                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Trois Piliers d'Excellence
                </span>
              </h3>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Une expérience de collection premium avec des mécaniques de jeu avancées
              </p>
            </motion.div>

            <div className="space-y-32">
              <DetailedFeature
                icon={<PackageIcon size={40} />}
                title="Système de Boosters Premium"
                description="Des packs exclusifs pour tous les collectionneurs"
                image="/showcase-boosters.png"
                features={[
                  { icon: <CrownIcon size={18} />, text: "Pack Carbon, Icon & Legendary avec raretés exclusives" },
                  { icon: <SparklesIcon size={18} />, text: "Animation d'ouverture cinématique immersive" },
                  { icon: <TrophyIcon size={18} />, text: "Cartes garanties selon la rareté du pack" },
                  { icon: <ZapIcon size={18} />, text: "Distribution équilibrée avec anti-doublon intelligent" }
                ]}
                gradient="from-blue-500/20 to-cyan-500/20"
                index={0}
              />

              <DetailedFeature
                icon={<StoreIcon size={40} />}
                title="Marketplace Mondial"
                description="Achetez, vendez et dominez l'économie"
                image="/showcase-marketplace.png"
                features={[
                  { icon: <CoinsIcon size={18} />, text: "Transactions en Apex Points (AP) - Monnaie premium" },
                  { icon: <TrendingUpIcon size={18} />, text: "Fixez vos propres prix et stratégies de vente" },
                  { icon: <ShieldCheckIcon size={18} />, text: "Système anti-fraude et transactions sécurisées" },
                  { icon: <UsersIcon size={18} />, text: "Marché en temps réel avec autres collectionneurs" }
                ]}
                gradient="from-indigo-500/20 to-purple-500/20"
                index={1}
                reverse
              />

              <DetailedFeature
                icon={<TrophyIcon size={40} />}
                title="Missions & Contrats"
                description="Complétez des défis pour gagner des récompenses"
                image="/showcase-missions.png"
                features={[
                  { icon: <TargetIcon size={18} />, text: "Contrats quotidiens avec objectifs progressifs" },
                  { icon: <CoinsIcon size={18} />, text: "Récompenses en AP pour chaque mission complétée" },
                  { icon: <ZapIcon size={18} />, text: "Suivi automatique de progression en temps réel" },
                  { icon: <CrownIcon size={18} />, text: "Défis spéciaux pour débloquer des cartes exclusives" }
                ]}
                gradient="from-purple-500/20 to-pink-500/20"
                index={2}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-8 relative">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative bg-gradient-to-br from-blue-600/20 via-indigo-600/20 to-purple-600/20 border border-white/10 rounded-[40px] p-16 text-center overflow-hidden"
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
                <h3 className="text-5xl font-black uppercase italic tracking-tighter mb-6">
                  <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    Rejoignez l'Élite
                  </span>
                </h3>
                <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                  Créez votre compte gratuitement et recevez votre premier pack de bienvenue pour démarrer votre collection.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-4 bg-white text-black hover:bg-blue-50 px-12 py-6 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-white/20 group"
                >
                  Créer mon Garage Elite
                  <ArrowRightIcon size={20} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-8 border-t border-white/5 text-center text-gray-500 text-sm">
          <p>© 2026 Apex Collector · Saison 1</p>
        </footer>
      </div>
    </main>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-black text-white mb-1">{value}</div>
      <div className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</div>
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
        className={`relative bg-gradient-to-br ${gradient} border border-white/10 rounded-3xl p-12 overflow-hidden ${reverse ? 'md:order-2' : ''}`}
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
        <h4 className="text-3xl font-black uppercase tracking-tight mb-3">{title}</h4>
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
            className="flex items-start gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 group hover:border-blue-500/30 transition-all"
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