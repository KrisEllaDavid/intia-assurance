import bcrypt from 'bcryptjs';
import jwt    from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma }                              from '../models';
import { Context, requireAuth, requireAdmin, requireEmployee } from '../middleware/auth';

const sign = (payload: object) =>
  jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '8h' });

export const authController = {
  Query: {
    meEmploye: (_: unknown, __: unknown, { user }: Context) => {
      const u = requireEmployee(user);
      return prisma.employe.findUnique({ where: { id: u.id }, include: { agence: true } });
    },

    meClient: (_: unknown, __: unknown, { user }: Context) => {
      const u = requireAuth(user);
      if (u.type !== 'client') throw new Error('Accès réservé aux clients');
      return prisma.client.findUnique({ where: { id: u.id }, include: { agence: true, assurances: true } });
    },

    employes: (_: unknown, __: unknown, { user }: Context) => {
      requireAdmin(user);
      return prisma.employe.findMany({ include: { agence: true } });
    },
  },

  Mutation: {
    loginEmploye: async (_: unknown, { email, motDePasse }: { email: string; motDePasse: string }) => {
      const employe = await prisma.employe.findUnique({ where: { email }, include: { agence: true } });
      if (!employe || !(await bcrypt.compare(motDePasse, employe.motDePasse)))
        throw new Error('Identifiants invalides');

      const token = sign({ id: employe.id, email: employe.email, role: employe.role, agenceId: employe.agenceId, type: 'employe' });
      return { token, employe };
    },

    loginClient: async (_: unknown, { email, motDePasse }: { email: string; motDePasse: string }) => {
      const client = await prisma.client.findUnique({ where: { email }, include: { agence: true, assurances: true } });
      if (!client || !client.motDePasse || !(await bcrypt.compare(motDePasse, client.motDePasse)))
        throw new Error('Identifiants invalides');

      const token = sign({ id: client.id, email: client.email, role: 'CLIENT', agenceId: client.agenceId, type: 'client' });
      return { token, client };
    },

    createEmploye: async (
      _: unknown,
      { input }: { input: { email: string; motDePasse: string; nom: string; prenom: string; role: Role; agenceId?: string } },
      { user }: Context
    ) => {
      requireAdmin(user);
      const hashed = await bcrypt.hash(input.motDePasse, 10);
      return prisma.employe.create({
        data:    { ...input, motDePasse: hashed, agenceId: input.agenceId ?? null },
        include: { agence: true },
      });
    },

    deleteEmploye: (_: unknown, { id }: { id: string }, { user }: Context) => {
      requireAdmin(user);
      return prisma.employe.delete({ where: { id }, include: { agence: true } });
    },
  },
};
