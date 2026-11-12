'use client';

import Link from 'next/link';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';

export default function HowToPlayPage() {
  const { t } = useSitePreferences();
  const steps = [
    { number: '01', title: 'Créez votre compte', description: 'Connectez-vous pour accéder à votre profil et aux actions réservées aux joueurs, comme l’ouverture de boosters, les missions et les transactions du marché.', href: '/login', linkLabel: 'Connexion' },
    { number: '02', title: 'Ouvrez des boosters', description: 'Choisissez un pack dans la boutique et dépensez les Apex Crédits (AC) affichés. Chaque pack contient un nombre de cartes aléatoires ; les cartes obtenues sont ajoutées à votre collection.', href: '/boosters', linkLabel: 'Voir les boosters' },
    { number: '03', title: 'Explorez votre garage', description: 'Le garage rassemble les véhicules et les circuits du catalogue. Recherchez et filtrez les cartes, puis ouvrez une carte pour consulter ses détails et votre nombre d’exemplaires.', href: '/collection', linkLabel: 'Ouvrir le garage' },
    { number: '04', title: 'Suivez vos missions', description: 'Les missions affichent leur objectif, leur progression et leur récompense. Lorsqu’une mission est terminée, récupérez les AC depuis cette page.', href: '/missions', linkLabel: 'Voir les missions' },
    { number: '05', title: 'Parcourez le marché', description: 'Consultez les cartes mises en vente par les joueurs, achetez-les avec vos AC ou proposez vos propres cartes à la vente.', href: '/marketplace', linkLabel: 'Visiter le marketplace' },
    { number: '06', title: 'Faites progresser votre écurie', description: 'Le niveau d’écurie dépend des véhicules différents possédés : niveau 0 avant 10, Rookie (1) dès 10, Débutant (3) dès 50, Amateur (4) dès 100, Confirmé (5) dès 200, Collectionneur (6) dès 500, Professionnel (7) dès 1 000, Célèbre (8) dès 2 000 et Légendaire (9) dès 5 000. Le niveau 2 est inutilisé. Les doublons, circuits, pilotes et succès ne comptent pas. Chaque rang atteint à partir du niveau 3 donne un booster aléatoire.', href: '/dashboard', linkLabel: 'Voir le tableau de bord' },
  ];

  return (
    <main className="min-h-screen bg-[#050505] px-5 py-16 text-white sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-blue-400">
            {t('Guide du pilote')}
          </p>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter sm:text-5xl">
            {t('How to play')}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
            {t('Constituez votre collection automobile, suivez vos missions et utilisez les Apex Crédits pour ouvrir des packs ou échanger des cartes.')}
          </p>
        </header>

        <ol className="space-y-4">
          {steps.map((step) => (
            <li
              key={step.number}
              className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-[3.5rem_1fr] sm:gap-6 sm:p-7"
            >
              <span className="text-sm font-black tracking-widest text-blue-400">
                {step.number}
              </span>
              <div>
                <h2 className="text-lg font-black uppercase italic tracking-tight">{t(step.title)}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  {t(step.description)}
                </p>
                <Link
                  href={step.href}
                  className="mt-4 inline-flex text-xs font-bold uppercase tracking-wider text-blue-400 transition-colors hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {t(step.linkLabel)}
                  <span aria-hidden="true" className="ml-2">→</span>
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
