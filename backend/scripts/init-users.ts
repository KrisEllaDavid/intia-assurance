/**
 * Initialise les agences et les comptes employés par défaut.
 * Les mots de passe sont générés aléatoirement et affichés UNE SEULE FOIS.
 *
 * Usage : npm run setup:users
 *
 * Ce script est idempotent : il ne recrée pas les utilisateurs déjà existants.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function generatePassword(length = 14): string {
  const upper   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower   = 'abcdefghijklmnopqrstuvwxyz';
  const digits  = '0123456789';
  const special = '@#$%!';
  const all = upper + lower + digits + special;
  const mandatory = [
    upper  [Math.floor(Math.random() * upper.length)],
    lower  [Math.floor(Math.random() * lower.length)],
    digits [Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];
  const rest = Array.from({ length: length - 4 }, () => all[Math.floor(Math.random() * all.length)]);
  return [...mandatory, ...rest].sort(() => Math.random() - 0.5).join('');
}

interface UserResult {
  role:     string;
  email:    string;
  agence:   string;
  password: string;
  status:   'créé' | 'existant';
}

async function upsertEmploye(data: {
  email: string; nom: string; prenom: string;
  role: 'ADMIN' | 'AGENT'; agenceId: string | null; agenceNom: string;
}): Promise<UserResult> {
  const existing = await prisma.employe.findUnique({ where: { email: data.email } });
  if (existing) {
    return { role: data.role, email: data.email, agence: data.agenceNom, password: '(inchangé)', status: 'existant' };
  }
  const password = generatePassword();
  await prisma.employe.create({
    data: {
      email:      data.email,
      motDePasse: await bcrypt.hash(password, 10),
      nom:        data.nom,
      prenom:     data.prenom,
      role:       data.role,
      agenceId:   data.agenceId,
    },
  });
  return { role: data.role, email: data.email, agence: data.agenceNom, password, status: 'créé' };
}

async function main() {
  console.log('\n⏳ Initialisation des agences et utilisateurs...\n');

  // ── Agences ───────────────────────────────────────────────────────────────
  const [, douala, yaounde] = await Promise.all([
    prisma.agence.upsert({ where: { id: 'ag-dg'     }, update: {}, create: { id: 'ag-dg',     nom: 'Direction Générale', ville: 'Yaoundé' } }),
    prisma.agence.upsert({ where: { id: 'ag-douala' }, update: {}, create: { id: 'ag-douala', nom: 'INTIA-Douala',        ville: 'Douala'  } }),
    prisma.agence.upsert({ where: { id: 'ag-yde'    }, update: {}, create: { id: 'ag-yde',    nom: 'INTIA-Yaoundé',      ville: 'Yaoundé' } }),
  ]);
  console.log('  ✓  3 agences prêtes (Direction Générale, Douala, Yaoundé)');

  // ── Employés ──────────────────────────────────────────────────────────────
  const results = await Promise.all([
    upsertEmploye({ email: 'admin@votredomaine.cm',         nom: 'Admin',  prenom: 'Principal', role: 'ADMIN', agenceId: null,       agenceNom: 'Globale' }),
    upsertEmploye({ email: 'agent.douala@votredomaine.cm',  nom: 'Agent',  prenom: 'Douala',    role: 'AGENT', agenceId: douala.id,  agenceNom: 'INTIA-Douala' }),
    upsertEmploye({ email: 'agent.yaounde@votredomaine.cm', nom: 'Agent',  prenom: 'Yaoundé',   role: 'AGENT', agenceId: yaounde.id, agenceNom: 'INTIA-Yaoundé' }),
  ]);

  // ── Affichage des credentials ─────────────────────────────────────────────
  const W = 72;
  const hr = '═'.repeat(W);
  const sep = '─'.repeat(W);

  console.log(`\n╔${hr}╗`);
  console.log(`║${'  CREDENTIALS INITIAUX — AFFICHÉ UNE SEULE FOIS'.padEnd(W)}║`);
  console.log(`╠${hr}╣`);
  console.log(`║  ${'RÔLE'.padEnd(8)} ${'EMAIL'.padEnd(34)} ${'MOT DE PASSE'.padEnd(16)} ${'STATUT'.padEnd(8)}║`);
  console.log(`╠${sep.slice(0, W)}╣`);

  results.forEach(u => {
    const line = `  ${u.role.padEnd(8)} ${u.email.padEnd(34)} ${u.password.padEnd(16)} ${u.status.padEnd(8)}`;
    console.log(`║${line.padEnd(W)}║`);
  });

  console.log(`╠${hr}╣`);
  console.log(`║${'  ⚠  Sauvegardez ces mots de passe maintenant.'.padEnd(W)}║`);
  console.log(`║${'     Les mots de passe sont hashés en base — non récupérables.'.padEnd(W)}║`);
  console.log(`╚${hr}╝\n`);
}

main()
  .catch(err => { console.error('\n✗ Erreur :', err.message, '\n'); process.exit(1); })
  .finally(() => prisma.$disconnect());
