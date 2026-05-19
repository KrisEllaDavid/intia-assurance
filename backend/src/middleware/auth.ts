import jwt from 'jsonwebtoken';

export interface JwtPayload {
  id:       string;
  email:    string;
  role:     'ADMIN' | 'AGENT' | 'CLIENT';
  agenceId: string | null;
  type:     'employe' | 'client';
}

export interface Context {
  user: JwtPayload | null;
}

export function buildContext(req: { headers: Record<string, string | string[] | undefined> }): Context {
  const header = req.headers['authorization'] as string | undefined;
  if (!header?.startsWith('Bearer ')) return { user: null };
  try {
    const token   = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    return { user: payload };
  } catch {
    return { user: null };
  }
}

export function requireAuth(user: JwtPayload | null): JwtPayload {
  if (!user) throw new Error('Non authentifié');
  return user;
}

export function requireEmployee(user: JwtPayload | null): JwtPayload {
  const u = requireAuth(user);
  if (u.type !== 'employe') throw new Error('Accès réservé aux employés');
  return u;
}

export function requireAdmin(user: JwtPayload | null): JwtPayload {
  const u = requireEmployee(user);
  if (u.role !== 'ADMIN') throw new Error('Accès réservé aux administrateurs');
  return u;
}
