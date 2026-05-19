import { Navigate } from 'react-router-dom';
import { getToken, getUserType } from '../lib/auth';

export function EmployeRoute({ children }: { children: React.ReactNode }) {
  if (!getToken() || getUserType() !== 'employe') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function ClientRoute({ children }: { children: React.ReactNode }) {
  if (!getToken() || getUserType() !== 'client') return <Navigate to="/client/login" replace />;
  return <>{children}</>;
}
