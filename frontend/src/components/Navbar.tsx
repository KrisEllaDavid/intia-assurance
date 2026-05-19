import { Link, useNavigate } from 'react-router-dom';
import { clearAuth, getUser, isAdmin } from '../lib/auth';
import { apolloClient } from '../apollo/client';

export default function Navbar() {
  const navigate  = useNavigate();
  const user      = getUser() as any;

  const logout = () => {
    clearAuth();
    apolloClient.clearStore();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <span className="brand">INTIA Assurance</span>
      <div className="nav-links">
        <Link to="/clients">Clients</Link>
        <Link to="/assurances">Contrats</Link>
        {isAdmin() && <Link to="/employes">Employés</Link>}
      </div>
      <div className="nav-user">
        <span>{user?.prenom} {user?.nom} — {user?.agence?.nom ?? 'Global'}</span>
        <button className="btn btn-sm" onClick={logout}>Déconnexion</button>
      </div>
    </nav>
  );
}
