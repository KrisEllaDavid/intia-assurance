import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Agences
  const [dg, douala, yaounde] = await Promise.all([
    prisma.agence.upsert({ where: { id: 'ag-dg'     }, update: {}, create: { id: 'ag-dg',     nom: 'Direction Générale', ville: 'Yaoundé' } }),
    prisma.agence.upsert({ where: { id: 'ag-douala' }, update: {}, create: { id: 'ag-douala', nom: 'INTIA-Douala',        ville: 'Douala'  } }),
    prisma.agence.upsert({ where: { id: 'ag-yde'    }, update: {}, create: { id: 'ag-yde',    nom: 'INTIA-Yaoundé',       ville: 'Yaoundé' } }),
  ]);

  const adminHash = await bcrypt.hash('Admin@1234', 10);
  const agentHash = await bcrypt.hash('Agent@1234', 10);

  // Employés
  await prisma.employe.upsert({
    where:  { email: 'admin@intia.cm' },
    update: {},
    create: { email: 'admin@intia.cm', motDePasse: adminHash, nom: 'Admin', prenom: 'INTIA', role: 'ADMIN', agenceId: null },
  });
  await prisma.employe.upsert({
    where:  { email: 'agent.douala@intia.cm' },
    update: {},
    create: { email: 'agent.douala@intia.cm', motDePasse: agentHash, nom: 'Agent', prenom: 'Douala', role: 'AGENT', agenceId: douala.id },
  });
  await prisma.employe.upsert({
    where:  { email: 'agent.yaounde@intia.cm' },
    update: {},
    create: { email: 'agent.yaounde@intia.cm', motDePasse: agentHash, nom: 'Agent', prenom: 'Yaoundé', role: 'AGENT', agenceId: yaounde.id },
  });

  console.log('Seed OK — Admin: admin@intia.cm / Admin@1234 | Agents: Agent@1234');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
