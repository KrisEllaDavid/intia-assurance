/**
 * Crée un employé (ADMIN ou AGENT) et affiche ses credentials UNE SEULE FOIS.
 *
 * Usage :
 *   npm run create:user -- --role ADMIN --email admin@company.com
 *   npm run create:user -- --role AGENT --email agent@company.com --agenceId ag-douala
 *
 * Options :
 *   --role      ADMIN | AGENT        (requis)
 *   --email     adresse email        (requis)
 *   --agenceId  id de l'agence       (requis si AGENT)
 *   --nom       nom de famille       (optionnel, défaut : "Utilisateur")
 *   --prenom    prénom               (optionnel, défaut : "Nouveau")
 *   --password  mot de passe custom  (optionnel, généré si absent)
 */
import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
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

function parseArgs(): Record<string, string> {
  const argv = process.argv.slice(2);
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length - 1; i++) {
    if (argv[i].startsWith('--')) out[argv[i].slice(2)] = argv[i + 1];
  }
  return out;
}

function box(lines: string[], width = 60) {
  const hr = '═'.repeat(width);
  console.log(`\n╔${hr}╗`);
  lines.forEach(l => {
    const pad = ' '.repeat(Math.max(0, width - l.length));
    console.log(`║ ${l}${pad}║`);
  });
  console.log(`╚${hr}╝\n`);
}

async function main() {
  const args = parseArgs();
  const { role, email, agenceId, nom, prenom, password: rawPwd } = args;

  if (!role || !email) {
    console.error('\nUsage : npm run create:user -- --role ADMIN|AGENT --email <email> [--agenceId <id>] [--nom <nom>] [--prenom <prenom>] [--password <pwd>]\n');
    process.exit(1);
  }
  if (!['ADMIN', 'AGENT'].includes(role)) {
    console.error('\n--role doit être ADMIN ou AGENT\n');
    process.exit(1);
  }
  if (role === 'AGENT' && !agenceId) {
    console.error('\n--agenceId est requis pour un AGENT\n');
    process.exit(1);
  }

  const existing = await prisma.employe.findUnique({ where: { email } });
  if (existing) {
    console.error(`\n✗ Un utilisateur avec l'email "${email}" existe déjà.\n`);
    process.exit(1);
  }

  const password = rawPwd ?? generatePassword();
  const hashed   = await bcrypt.hash(password, 10);

  const user = await prisma.employe.create({
    data: {
      email,
      motDePasse: hashed,
      nom:        nom     ?? 'Utilisateur',
      prenom:     prenom  ?? 'Nouveau',
      role:       role as Role,
      agenceId:   agenceId ?? null,
    },
    include: { agence: true },
  });

  box([
    '  ✓  UTILISATEUR CRÉÉ',
    '',
    `  Email         : ${user.email}`,
    `  Mot de passe  : ${password}`,
    `  Rôle          : ${user.role}`,
    `  Agence        : ${user.agence?.nom ?? 'Globale (toutes agences)'}`,
    '',
    '  ⚠  Ces informations ne seront plus affichées.',
    '     Notez-les maintenant.',
  ]);
}

main()
  .catch(err => { console.error('\n✗ Erreur :', err.message, '\n'); process.exit(1); })
  .finally(() => prisma.$disconnect());
