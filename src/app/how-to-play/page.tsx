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
    { number: '06', title: 'Faites progresser votre écurie', description: 'Progressez dans les rangs d’écurie en collectionnant des véhicules différents. Retrouvez les seuils, les règles et les boosters offerts dans le guide détaillé ci-dessous.', href: '/dashboard', linkLabel: 'Voir le tableau de bord' },
  ];
  const garageRanks = [
    { range: '0–9', level: 0, title: 'Non classé', reward: false },
    { range: '10–49', level: 1, title: 'Rookie', reward: false },
    { range: '50–99', level: 3, title: 'Débutant', reward: true },
    { range: '100–199', level: 4, title: 'Amateur', reward: true },
    { range: '200–499', level: 5, title: 'Confirmé', reward: true },
    { range: '500–999', level: 6, title: 'Collectionneur', reward: true },
    { range: '1 000–1 999', level: 7, title: 'Professionnel', reward: true },
    { range: '2 000–4 999', level: 8, title: 'Célèbre', reward: true },
    { range: '5 000+', level: 9, title: 'Légendaire', reward: true },
  ] as const;

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

        <section id="garage-levels" aria-labelledby="garage-levels-title" className="mt-14 scroll-mt-8 space-y-6">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-amber-300">{t('Progression de l’écurie')}</p>
            <h2 id="garage-levels-title" className="text-2xl font-black uppercase italic tracking-tight text-white sm:text-3xl">
              {t('Comprendre les niveaux d’écurie')}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">
              {t('Les rangs d’écurie récompensent la diversité des véhicules possédés, et non le nombre total d’exemplaires.')}
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
            <table className="w-full min-w-[480px] border-collapse text-left text-sm">
              <thead className="bg-white/[0.06] text-xs uppercase tracking-wider text-gray-300">
                <tr>
                  <th scope="col" className="px-4 py-3">{t('Véhicules distincts')}</th>
                  <th scope="col" className="px-4 py-3">{t('Niveau')}</th>
                  <th scope="col" className="px-4 py-3">{t('Rang')}</th>
                  <th scope="col" className="px-4 py-3">{t('Récompense du rang')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {garageRanks.map((rank) => (
                  <tr key={rank.level}>
                    <td className="px-4 py-3 font-mono tabular-nums text-slate-200">{rank.range}</td>
                    <td className="px-4 py-3 font-black tabular-nums text-amber-200">{rank.level}</td>
                    <td className="px-4 py-3 font-semibold text-white">{t(rank.title)}</td>
                    <td className="px-4 py-3 text-slate-300">{rank.reward ? t('1 booster offert') : t('Aucun booster')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs leading-6 text-gray-400">
            {t('Le niveau 2 est volontairement absent. Légendaire (niveau 9) est le rang maximum, même au-delà de 10 000 véhicules.')}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="text-base font-black text-white">{t('Quels véhicules comptent ?')}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                {t('Seuls les véhicules différents actuellement possédés comptent : un modèle compte une seule fois, même avec des doublons. Les circuits, pilotes, succès et améliorations ne comptent pas. Revendre son dernier exemplaire peut faire redescendre le rang.')}
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="text-base font-black text-white">{t('Comment suivre sa progression ?')}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                {t('Le tableau de bord indique le rang et la progression vers le prochain seuil. Exemple : avec 187 véhicules différents, vous êtes Amateur (niveau 4) ; 13 véhicules supplémentaires permettent d’atteindre Confirmé (niveau 5) à 200.')}
              </p>
            </article>
            <article className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.04] p-5 sm:col-span-2">
              <h3 className="text-base font-black text-amber-200">{t('Comment obtenir et ouvrir les boosters ?')}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-300">
                {t('À chaque nouveau rang atteint du niveau 3 au niveau 9, un booster de catégorie aléatoire est attribué automatiquement, une seule fois par rang et par joueur. Les niveaux 0 et 1 ne donnent aucun booster. Les cadeaux se trouvent dans la boutique et restent disponibles jusqu’à leur ouverture. Revendre puis récupérer une carte ne permet pas de gagner deux fois le même cadeau. Les boosters déjà gagnés avant le changement de barème sont conservés.')}
              </p>
            </article>
          </div>
          <p className="text-sm text-gray-400">
            {t('Le rang d’écurie est différent du niveau collectionneur du profil et du niveau d’amélioration des cartes.')}
          </p>
          <Link href="/dashboard" className="inline-flex min-h-10 items-center rounded-lg border border-amber-300/35 bg-amber-300/10 px-4 py-2 text-sm font-bold text-amber-200 transition hover:bg-amber-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
            {t('Voir mon niveau d’écurie')}
          </Link>
        </section>
      </div>
    </main>
  );
}
