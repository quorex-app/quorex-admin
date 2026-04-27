require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  console.log('Cleaning existing data...');

  // Delete in dependency order
  await prisma.invitation.deleteMany();
  await prisma.scaleBlocker.deleteMany();
  await prisma.scaleAction.deleteMany();
  await prisma.scalePhase.deleteMany();
  await prisma.coldEmailRule.deleteMany();
  await prisma.emailTemplate.deleteMany();
  await prisma.todoItem.deleteMany();
  await prisma.user.deleteMany();

  // ─── Superadmin ────────────────────────────────────────────────────────────
  const password_hash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'Admin1234!', 12);
  await prisma.user.create({
    data: { email: 'admin@quorex.io', password_hash, name: 'Admin', role: 'superadmin' },
  });

  console.log('Created superadmin user');

  // ─── Todos ─────────────────────────────────────────────────────────────────
  await prisma.todoItem.createMany({
    data: [
      // FIRE
      { title: "Créer un Stripe Payment Link à $49/mois", note: "stripe.com → Payment Links → 5 min. Pas besoin de code. C'est le seul produit qui existe aujourd'hui.", phase: 'fire', tag: 'Maintenant', position: 1 },
      { title: "Rédiger les 3 emails de la séquence cold (hook peur, cas concret, breakup)", note: "Copier les templates de la stratégie de contenu. S'inspirer du hook #1 et #5 de la hook bank.", phase: 'fire', tag: 'Maintenant', position: 2 },
      { title: "Envoyer 10 cold emails à la main à des CTOs LinkedIn — sans outil", note: "Pas d'Instantly pour l'instant. 10 emails personnalisés à la main = 10x plus fort. Objectif : 3 réponses en 48h.", phase: 'fire', tag: 'Maintenant', position: 3 },
      { title: "Créer la landing page presell (Carrd ou Framer)", note: "Titre : 'Votre ex-employé a encore accès à votre GitHub'. CTA : lien Stripe. 1 heure max. Pas de design.", phase: 'fire', tag: "Aujourd'hui", position: 4 },
      { title: "Publier le premier post LinkedIn (confession + chiffre)", note: "Hook #2 ou #5 de la hook bank. Lien landing en commentaire épinglé. Publier à 8h ou 12h.", phase: 'fire', tag: "Aujourd'hui", position: 5 },
      // BUILD
      { title: "Configurer le domaine email dédié pour le cold email", note: "Ex: hello@quorex.io. Protège ta réputation email principale. Namecheap + MX Cloudflare.", phase: 'build', tag: "Aujourd'hui", position: 1 },
      { title: "Charger les 300 CTOs dans Instantly et lancer la séquence automatisée", note: "Scraper LinkedIn Sales Nav : CTO + startup + 10-60 sal. + Seed ou Série A.", phase: 'build', tag: 'Semaine 1', position: 2 },
      { title: "Init projet Next.js 14 + Supabase + Prisma + deploy Vercel", note: "npx create-next-app@latest. Connecter Supabase. Schéma DB : users, orgs, connected_apps, members, offboarding_events.", phase: 'build', tag: 'Semaine 1', position: 3 },
      { title: "Auth Supabase (email + password) + protection des routes", note: "Pages : /login, /signup, /dashboard. Middleware Supabase pour protéger les routes authentifiées.", phase: 'build', tag: 'Semaine 1', position: 4 },
      { title: "Intégration Stripe dans l'app (webhook → activer compte post-paiement)", note: "Stripe Checkout + webhook stripe pour passer le compte en 'actif' après paiement réussi.", phase: 'build', tag: 'Semaine 1', position: 5 },
      { title: "OAuth GitHub : connexion Org + pull membres + révocation", note: "SDK Octokit. Flow : bouton connecter → OAuth callback → stocker token chiffré → pull membres → révocation API.", phase: 'build', tag: 'Semaine 1', position: 6 },
      { title: "Rejoindre 5 communautés Slack/Discord CTOs et observer 48h avant de poster", note: "CTO Craft, French Tech, Indie Hackers, Rands Leadership Slack.", phase: 'build', tag: 'Semaine 1', position: 7 },
      // GROW
      { title: "OAuth Notion : connexion workspace + pull membres + révocation", note: "SDK @notionhq/client. Même pattern que GitHub.", phase: 'grow', tag: 'Semaine 2', position: 1 },
      { title: "OAuth Slack : connexion workspace + désactivation membres", note: "SDK @slack/web-api. Attention : nécessite un token admin Slack avec scope users:write.", phase: 'grow', tag: 'Semaine 2', position: 2 },
      { title: "Vue inventaire consolidée (1 tableau : nom / email / apps / statut)", note: "Afficher tous les membres de toutes les apps connectées dans une seule vue.", phase: 'grow', tag: 'Semaine 2', position: 3 },
      { title: "Flow offboarding complet : sélection → preview → révocation cascade → feedback temps réel", note: "Le core du produit. GitHub + Notion + Slack en séquence.", phase: 'grow', tag: 'Semaine 2', position: 4 },
      { title: "Génération PDF rapport avec React-PDF", note: "@react-pdf/renderer. Template simple. Fonctionnel > beau.", phase: 'grow', tag: 'Semaine 2', position: 5 },
      { title: "Email automatique post-offboarding avec PDF en PJ (Resend)", note: "Resend setup en 15 min.", phase: 'grow', tag: 'Semaine 2', position: 6 },
      { title: "Poster dans 1 communauté Slack (format retour terrain)", note: "Histoire anonymisée. Lien en commentaire si quelqu'un demande.", phase: 'grow', tag: 'Semaine 2', position: 7 },
      { title: "Page historique offboardings (liste + lien PDF)", note: "Vue simple. Date, nom, apps révoquées, télécharger PDF.", phase: 'grow', tag: 'Semaine 3', position: 8 },
      { title: "Onboarding flow (steps : connecter app → importer membres → offboarding test)", note: "3 étapes visuelles après signup.", phase: 'grow', tag: 'Semaine 3', position: 9 },
      { title: "Beta test avec 2-3 presell clients — call Loom 15 min chacun", note: "Observer sans guider. Note chaque hésitation.", phase: 'grow', tag: 'Semaine 3', position: 10 },
      { title: "Passer de $49 presell à $99/mois officiel sur Stripe", note: "Créer le nouveau Payment Link + mettre à jour la landing.", phase: 'grow', tag: 'Semaine 3', position: 11 },
      { title: "Post LinkedIn 'on est live' (J21)", note: "1 seul post. Lien direct vers la landing $99/mois. Publier à 8h un mardi ou jeudi.", phase: 'grow', tag: 'Semaine 3', position: 12 },
      // LATER
      { title: "Contacter 20 consultants SOC2 pour partenariat (25% commission)", note: "Seulement après avoir un client qui a utilisé le rapport PDF pour un audit SOC2 réel.", phase: 'later', position: 1 },
      { title: "Emails de nurturing automatiques (J+3 si pas connecté d'app, J+7 si pas d'offboarding)", note: "Resend séquences.", phase: 'later', position: 2 },
      { title: "Programme referral client (1 mois offert pour chaque client référé)", note: "Rewardful ou Partnero. Activer à 15+ clients.", phase: 'later', position: 3 },
      { title: "Ajouter intégrations Figma + Linear + Vercel", note: "Uniquement si 5+ clients demandent la même intégration.", phase: 'later', position: 4 },
      { title: "LinkedIn Ads retargeting ($10/jour, visiteurs landing)", note: "Activer uniquement si trafic landing > 500 visiteurs/mois.", phase: 'later', position: 5 },
      { title: "Détecter shadow IT / OAuth grants tiers lors de l'offboarding", note: "Feature haute valeur. V2 minimum.", phase: 'later', position: 6 },
      { title: "Alertes post-départ si un accès se reconnecte", note: "Webhook-based monitoring. Version 2.", phase: 'later', position: 7 },
      { title: "Premier article SEO (offboarding IT startup SOC2)", note: "ROI à 90 jours minimum.", phase: 'later', position: 8 },
      { title: "Recruter un freelance 20h/semaine si $3K MRR stable", note: "Budget $800-1 200/mois. Ne pas recruter avant.", phase: 'later', position: 9 },
      { title: "Plan Scale $199 + API publique + onboarding 1:1", note: "Proposer uniquement si un client le demande.", phase: 'later', position: 10 },
    ],
  });
  console.log('Inserted 32 todos');

  // ─── Email templates ────────────────────────────────────────────────────────
  await prisma.emailTemplate.createMany({
    data: [
      {
        email_number: 1,
        name: 'Email 1 — Hook (Peur)',
        subject: JSON.stringify([
          "Les accès de [Prénom ex-employé] chez [Startup]",
          "Vos ex-employés ont encore accès à quoi ?",
          "Question rapide sur [Startup] + GitHub",
        ]),
        body: `[Prénom],

Est-ce que [Startup] a un process pour révoquer les accès quand quelqu'un part ?

GitHub, Notion, Slack, AWS — les accès techniques en particulier.

Je pose la question parce que 71% des startups n'ont aucun process formel pour ça. Et dans la plupart des cas, les CTOs découvrent les accès oubliés par accident — ou pas du tout.

Je construis un outil qui règle ça en 5 minutes. Je cherche des fondateurs tech qui veulent l'essayer en avant-première.

Vous avez eu des départs récents chez [Startup] ?

[Ton prénom]`,
      },
      {
        email_number: 2,
        name: 'Email 2 — Preuve (Cas concret)',
        subject: JSON.stringify(["Re: Les accès de [Startup]"]),
        body: `[Prénom],

En 2022, un ex-employé de Cash App a téléchargé les données de 8,2 millions de clients après son départ. Personne ne l'a détecté pendant 4 mois. Résultat : class action lawsuit + $500K d'amende.

Son accès n'avait pas été révoqué.

Voilà ce que fait l'outil que je construis :

→ Vous connectez GitHub, Notion et Slack en 30 min
→ Quand quelqu'un part, 1 clic révoque tout en cascade
→ Un rapport PDF horodaté est généré automatiquement — utilisable directement si vous préparez un audit SOC2

Je cherche 30 fondateurs early adopters pour le tester avant le lancement officiel.

Prix : 49€/mois à vie (vs 99€ au lancement). Garanti remboursé sous 30 jours si ça ne vous convient pas.

[Lien Stripe]

Ça vous parle ?

[Ton prénom]`,
      },
      {
        email_number: 3,
        name: 'Email 3 — Breakup',
        subject: JSON.stringify(["Dernière tentative — [Startup]"]),
        body: `[Prénom],

Je referme l'accès early adopter cette semaine — il me reste 8 places au tarif $49/mois.

Deux cas de figure :

1. Le sujet ne vous concerne pas — aucun problème, je ne vous recontacte plus.

2. Vous savez que vous devriez avoir un process d'offboarding IT mais vous n'avez pas encore pris le temps — dans ce cas, c'est le bon moment. $49/mois, garanti remboursé 30 jours, accès immédiat.

[Lien Stripe]

Dans tous les cas, bonne continuation.

[Ton prénom]

P.S. Si vous avez quelqu'un dans votre réseau pour qui c'est plus urgent, je suis preneur d'une intro.`,
      },
    ],
  });
  console.log('Inserted email templates');

  // ─── Cold email rules ───────────────────────────────────────────────────────
  await prisma.coldEmailRule.createMany({
    data: [
      { type: 'absolute_rule', content: "Ces emails sont courts par design. Pas de présentation de l'entreprise. Pas de liste de features. Pas de 'j'espère que ce message vous trouve bien.' Le CTO qui reçoit ça lit en 20 secondes et répond ou pas. Un email plus long = moins de réponses, pas plus.", position: 1 },
      { type: 'personalization_rule', content: "Remplacer [Prénom] par le prénom du prospect — jamais 'Bonjour' seul", position: 1 },
      { type: 'personalization_rule', content: "Remplacer [Startup] par le vrai nom de l'entreprise — visible sur LinkedIn", position: 2 },
      { type: 'personalization_rule', content: "Remplacer [app spécifique] par une app que tu sais qu'ils utilisent", position: 3 },
      { type: 'personalization_rule', content: "Ton prénom en signature = ton vrai prénom. Pas 'L'équipe Quorex'", position: 4 },
      { type: 'personalization_rule', content: "Envoyer depuis un domaine dédié (ex: prenom@quorex.io) — jamais depuis Gmail perso", position: 5 },
      { type: 'sending_rule', content: "Email 1 : Mardi ou jeudi, 8h-9h ou 17h-18h. Éviter lundi matin et vendredi après-midi.", position: 1 },
      { type: 'sending_rule', content: "Email 2 : J+3 exactement. Si réponse reçue à E1 → ne pas envoyer E2.", position: 2 },
      { type: 'sending_rule', content: "Email 3 : J+7. Dernier contact. Si pas de réponse → relance dans 3 mois.", position: 3 },
    ],
  });
  console.log('Inserted cold email rules');

  // ─── Scale phases ───────────────────────────────────────────────────────────
  const phasesData = [
    {
      phase_number: 1,
      title: 'Valider & Presell',
      subtitle: 'Trouver les premiers acheteurs',
      period: 'J1 → J30',
      badge_color: 'blue',
      mrr_target: '$245 – $735',
      kpi_label: 'Presell payés',
      kpi_description: "Le seul chiffre qui compte en Phase 1 : combien de personnes ont payé avant que le produit existe. Objectif : 5-15 presell à $49/mois = validation que le problème est réel.",
      actions: [
        { week_label: 'J1-J3', title: 'Stripe Payment Link $49/mois', body: 'Créer le lien de paiement. Pas de code, pas de site. Juste un lien Stripe qui peut encaisser.', position: 1 },
        { week_label: 'J1-J3', title: '3 emails cold (hook, preuve, breakup)', body: "Rédiger les 3 emails de la séquence. S'inspirer de la hook bank. Courts, directs, personnalisés.", position: 2 },
        { week_label: 'J3-J7', title: '10 cold emails manuels à des CTOs', body: "Pas d'outil. 10 emails personnalisés à la main. Objectif : 3 réponses en 48h.", position: 3 },
        { week_label: 'J3-J7', title: 'Landing presell (Carrd ou Framer)', body: "1 heure max. Titre : 'Votre ex-employé a encore accès à votre GitHub'. CTA : lien Stripe.", position: 4 },
        { week_label: 'J7-J14', title: 'Post LinkedIn (confession + chiffre)', body: "Hook #2 ou #5 de la hook bank. Publier à 8h ou 12h. Lien landing en commentaire épinglé.", position: 5 },
        { week_label: 'J14-J30', title: '300 CTOs dans Instantly + séquence', body: "Scraper LinkedIn Sales Nav. Lancer la séquence automatisée.", position: 6 },
      ],
      blockers: [
        { severity: 1, title: 'Pas de presell après 30 jours', description: "Si 0 vente après 30 jours et 10 cold emails, le problème est dans le message ou la cible, pas dans le produit.", fix_text: "Retravailler le hook de l'Email 1. Tester 3 nouvelles lignes d'objet. Interviewer 5 CTOs pour comprendre leur vraie douleur.", position: 1 },
        { severity: 2, title: 'Taux de réponse cold < 3%', description: "En dessous de 3% de réponses, la séquence ne convertira jamais assez pour atteindre les objectifs.", fix_text: "Personnaliser davantage les 10 premiers mots. Tester un email encore plus court (3 phrases max). Vérifier le domaine d'envoi (SPF/DKIM).", position: 2 },
        { severity: 3, title: 'Blocage psychologique sur la vente', description: "Peur de 'déranger', d'envoyer trop d'emails, d'être rejeté. Ce blocker mental est plus dangereux que les obstacles techniques.", fix_text: "Se rappeler : 10 CTOs qui ne répondent pas = 0 problème. 1 CTO qui répond 'non merci' = data précieuse. Envoyer quand même.", position: 3 },
      ],
    },
    {
      phase_number: 2,
      title: 'Construire & Livrer',
      subtitle: 'Transformer les presell en vrais clients',
      period: 'J31 → J60',
      badge_color: 'indigo',
      mrr_target: '$750 – $1 500',
      kpi_label: "Taux d'activation",
      kpi_description: "% de clients presell qui ont connecté au moins une app (GitHub, Notion ou Slack). Objectif : > 70% des presell activés = le produit délivre sa promesse.",
      actions: [
        { week_label: 'J31-J35', title: 'Init Next.js 14 + Supabase + Vercel', body: "Stack tech : Next.js 14, Supabase (auth + DB), Prisma (ORM), deploy Vercel. 1 jour de setup.", position: 1 },
        { week_label: 'J31-J35', title: 'Auth + Stripe webhook', body: "Supabase Auth. Stripe Checkout + webhook pour activer le compte après paiement.", position: 2 },
        { week_label: 'J35-J45', title: 'OAuth GitHub (pull + révocation)', body: "Octokit SDK. Stocker token chiffré. Pull membres. Révocation API.", position: 3 },
        { week_label: 'J35-J45', title: 'OAuth Notion + Slack', body: "Même pattern que GitHub. Slack nécessite scope admin users:write.", position: 4 },
        { week_label: 'J45-J55', title: 'Flow offboarding complet', body: "Sélection → preview → révocation cascade (GitHub + Notion + Slack) → feedback temps réel.", position: 5 },
        { week_label: 'J55-J60', title: 'PDF rapport + email Resend', body: "@react-pdf/renderer. Template simple. Email automatique post-offboarding avec PDF en PJ.", position: 6 },
      ],
      blockers: [
        { severity: 1, title: "Aucun client n'active après avoir payé", description: "Si les presell payent mais n'utilisent pas le produit, le revenu ne sera pas récurrent.", fix_text: "Appeler chaque client presell. Faire l'onboarding à la main en screen share. Identifier et supprimer le premier point de friction.", position: 1 },
        { severity: 2, title: 'OAuth trop complexe à mettre en place', description: "Les intégrations OAuth peuvent prendre 3-5x plus de temps que prévu.", fix_text: "Commencer par GitHub uniquement. Un seul outil fonctionnel > 3 outils cassés. Livrer la valeur minimale d'abord.", position: 2 },
        { severity: 3, title: "Sur-engineering du produit", description: "Vouloir builder plus que ce qui a été vendu. Le presell a promis révocation + PDF, pas un dashboard ultra-complexe.", fix_text: "Relire les emails presell. Livrer exactement ce qui a été promis. Rien de plus.", position: 3 },
      ],
    },
    {
      phase_number: 3,
      title: 'Acquérir',
      subtitle: 'Scaler le canal qui convertit',
      period: 'J61 → J90',
      badge_color: 'green',
      mrr_target: '$2 000 – $3 500',
      kpi_label: 'Nouveaux clients / semaine',
      kpi_description: "Objectif : 2-4 nouveaux clients par semaine au tarif $99/mois à partir de J75. Mesurer le canal source pour chaque client (cold email, LinkedIn, referral).",
      actions: [
        { week_label: 'J61-J65', title: 'Passer à $99/mois + nouvelle landing', body: "Créer le Payment Link $99/mois. Mettre à jour la landing. Les presell gardent $49/mois à vie.", position: 1 },
        { week_label: 'J61-J70', title: "Post LinkedIn 'on est live'", body: "1 seul post. Lien direct vers la landing $99/mois. Publier à 8h un mardi ou jeudi.", position: 2 },
        { week_label: 'J65-J75', title: 'Beta test 2-3 clients (call Loom)', body: "Observer sans guider. 15 min par client. Note chaque hésitation et blocage.", position: 3 },
        { week_label: 'J70-J90', title: 'Rejoindre 5 communautés CTOs', body: "CTO Craft, French Tech, Indie Hackers, Rands Leadership Slack. Observer 48h avant de poster.", position: 4 },
        { week_label: 'J75-J90', title: 'Posts communauté (retour terrain)', body: "Histoire anonymisée. Pas de pitch direct. Lien en commentaire si quelqu'un demande.", position: 5 },
        { week_label: 'J80-J90', title: 'Onboarding flow (3 étapes visuelles)', body: "Connecter app → importer membres → premier offboarding test. Réduire le temps to value.", position: 6 },
      ],
      blockers: [
        { severity: 1, title: 'Croissance stagnante après les presell', description: "Les presell sont épuisés et le cold email ne génère pas assez de nouveaux clients.", fix_text: "Analyser le canal source de chaque client. Doubler sur le canal qui convertit. Demander des introductions à chaque client satisfait.", position: 1 },
        { severity: 2, title: 'Churn sur les premiers clients', description: "Si des clients annulent en Phase 3, le MRR ne pourra pas scaler.", fix_text: "Appeler chaque client qui annule. Comprendre la vraie raison. Souvent : pas eu le temps de l'utiliser = problème d'onboarding.", position: 2 },
        { severity: 3, title: 'Trop de features en parallèle', description: "Tentations d'ajouter Figma, Linear, Vercel avant d'avoir un canal d'acquisition stable.", fix_text: "Règle : 0 nouvelle intégration avant 15 clients actifs. Se concentrer sur l'acquisition, pas le produit.", position: 3 },
      ],
    },
    {
      phase_number: 4,
      title: '$5K MRR',
      subtitle: 'Consolider et préparer la suite',
      period: 'J91 → J150',
      badge_color: 'purple',
      mrr_target: '$5 000+',
      kpi_label: 'MRR net',
      kpi_description: "MRR net = nouveaux MRR - churned MRR. Objectif : $5K MRR net stable pendant 2 mois consécutifs avant de recruter ou de lever des fonds.",
      actions: [
        { week_label: 'J91-J105', title: 'Programme referral (1 mois offert)', body: "Rewardful ou Partnero. Activer uniquement à 15+ clients. 25% commission pour les consultants SOC2.", position: 1 },
        { week_label: 'J91-J120', title: 'Article SEO (offboarding IT SOC2)', body: "Premier article ciblé. ROI à 90 jours minimum. Ne pas attendre des résultats immédiats.", position: 2 },
        { week_label: 'J100-J120', title: 'Contacter 20 consultants SOC2', body: "Partenariat 25% commission. Seulement après avoir un client qui a utilisé le PDF pour un audit réel.", position: 3 },
        { week_label: 'J110-J130', title: 'LinkedIn Ads retargeting ($10/jour)', body: "Activer uniquement si trafic landing > 500 visiteurs/mois. Pas avant.", position: 4 },
        { week_label: 'J120-J150', title: 'Plan Scale $199 + API publique', body: "Proposer uniquement si un client le demande explicitement. Ne pas construire dans le vide.", position: 5 },
        { week_label: 'J130-J150', title: 'Recruter freelance 20h/sem si $3K MRR stable', body: "Budget $800-1 200/mois. Ne pas recruter avant. Profil : dev fullstack avec expérience SaaS.", position: 6 },
      ],
      blockers: [
        { severity: 1, title: 'MRR plafonné à $2-3K', description: "Le cold email seul ne peut pas scaler indéfiniment. Le canal se sature.", fix_text: "Activer le referral. Démarrer le SEO. Tester LinkedIn Ads à petit budget. Diversifier les sources.", position: 1 },
        { severity: 2, title: 'Recruter trop tôt', description: "Recruter avant $3K MRR stable met en danger la trésorerie.", fix_text: "Règle stricte : 0 recrutement avant 2 mois consécutifs à $3K+ MRR. Rester solo jusqu'à ce point.", position: 2 },
        { severity: 3, title: "Lever des fonds avant product-market fit", description: "Tentation de lever à $2K MRR pour accélérer. Mauvaise idée : la dilution n'est pas justifiée.", fix_text: "Attendre $5K MRR net stable. À ce niveau, la levée est possible avec un cap table propre et une valorisation correcte.", position: 3 },
      ],
    },
  ];

  for (const phaseData of phasesData) {
    const { actions, blockers, ...phaseFields } = phaseData;
    const phase = await prisma.scalePhase.create({
      data: {
        ...phaseFields,
        actions: { createMany: { data: actions } },
        blockers: { createMany: { data: blockers } },
      },
    });
    console.log(`Inserted phase ${phase.phase_number}: ${phase.title}`);
  }

  console.log('\nSeed complete!');
}

seed()
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
