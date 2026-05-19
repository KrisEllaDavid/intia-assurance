const TOKEN_KEY     = 'intia_token';
const USER_TYPE_KEY = 'intia_user_type';
const USER_KEY      = 'intia_user';

export interface EmployeStored {
  id: string; nom: string; prenom: string; email: string;
  role: 'ADMIN' | 'AGENT';
  agenceId: string | null;
  agence: { id: string; nom: string } | null;
}
export interface ClientStored {
  id: string; nom: string; prenom: string; email: string;
  agenceId: string;
  agence: { id: string; nom: string };
}

export const saveEmployeAuth = (token: string, employe: EmployeStored) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_TYPE_KEY, 'employe');
  localStorage.setItem(USER_KEY, JSON.stringify(employe));
};

export const saveClientAuth = (token: string, client: ClientStored) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_TYPE_KEY, 'client');
  localStorage.setItem(USER_KEY, JSON.stringify(client));
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_TYPE_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getToken    = () => localStorage.getItem(TOKEN_KEY);
export const getUserType = () => localStorage.getItem(USER_TYPE_KEY) as 'employe' | 'client' | null;
export const getUser     = (): EmployeStored | ClientStored | null => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};
export const isAdmin = () => (getUser() as EmployeStored | null)?.role === 'ADMIN';
