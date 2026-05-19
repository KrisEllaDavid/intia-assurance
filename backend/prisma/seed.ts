import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ── Agences ───────────────────────────────────────────────────────────────
  const [dg, douala, yaounde] = await Promise.all([
    prisma.agence.upsert({ where: { id: 'ag-dg'     }, update: {}, create: { id: 'ag-dg',     nom: 'Direction Générale', ville: 'Yaoundé' } }),
    prisma.agence.upsert({ where: { id: 'ag-douala' }, update: {}, create: { id: 'ag-douala', nom: 'INTIA-Douala',        ville: 'Douala'  } }),
    prisma.agence.upsert({ where: { id: 'ag-yde'    }, update: {}, create: { id: 'ag-yde',    nom: 'INTIA-Yaoundé',      ville: 'Yaoundé' } }),
  ]);

  // ── Employés ──────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@1234', 10);
  const agentHash = await bcrypt.hash('Agent@1234', 10);

  await prisma.employe.upsert({
    where: { email: 'admin@intia.cm' }, update: {},
    create: { email: 'admin@intia.cm', motDePasse: adminHash, nom: 'Admin', prenom: 'INTIA', role: 'ADMIN', agenceId: null },
  });
  await prisma.employe.upsert({
    where: { email: 'agent.douala@intia.cm' }, update: {},
    create: { email: 'agent.douala@intia.cm', motDePasse: agentHash, nom: 'Agent', prenom: 'Douala', role: 'AGENT', agenceId: douala.id },
  });
  await prisma.employe.upsert({
    where: { email: 'agent.yaounde@intia.cm' }, update: {},
    create: { email: 'agent.yaounde@intia.cm', motDePasse: agentHash, nom: 'Agent', prenom: 'Yaoundé', role: 'AGENT', agenceId: yaounde.id },
  });

  // ── Client de test E2E ────────────────────────────────────────────────────
  const clientHash = await bcrypt.hash('Client@1234', 10);
  const e2eClient = await prisma.client.upsert({
    where: { email: 'client.e2e@test.cm' }, update: {},
    create: {
      email:      'client.e2e@test.cm',
      motDePasse: clientHash,
      nom:        'TestClient',
      prenom:     'E2E',
      telephone:  '699000000',
      agenceId:   douala.id,
    },
  });

  // Assurance de test pour le client E2E
  await prisma.assurance.upsert({
    where: { id: 'ass-e2e-1' }, update: {},
    create: {
      id:        'ass-e2e-1',
      type:      'Auto',
      prime:     150000,
      dateDebut: new Date('2024-01-01'),
      dateFin:   new Date('2024-12-31'),
      statut:    'ACTIF',
      clientId:  e2eClient.id,
    },
  });

  console.log('Seed OK');
  console.log('  Admin   : admin@intia.cm        / Admin@1234');
  console.log('  Agent   : agent.douala@intia.cm / Agent@1234');
  console.log('  Agent   : agent.yaounde@intia.cm/ Agent@1234');
  console.log('  Client  : client.e2e@test.cm    / Client@1234');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
