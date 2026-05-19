import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GET_ASSURANCES } from '../../graphql/assurances';
import { clearAuth, getUser } from '../../lib/auth';
import { apolloClient } from '../../apollo/client';

const fmt = (iso: string) => new Date(iso).toLocaleDateString('fr-FR');

export default function MesAssurances() {
  const navigate = useNavigate();
  const user     = getUser() as any;
  const { data, loading, error } = useQuery(GET_ASSURANCES);

  const logout = () => {
    clearAuth();
    apolloClient.clearStore();
    navigate('/client/login');
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>Mes contrats d'assurance</h1>
          <p style={{ color: '#666', fontSize: 13 }}>
            {user?.prenom} {user?.nom} — {user?.agence?.nom}
          </p>
        </div>
        <button className="btn btn-secondary" onClick={logout}>Déconnexion</button>
      </div>

      {loading && <p>Chargement...</p>}
      {error   && <p className="error">{error.message}</p>}

      {!loading && !error && !data?.assurances.length && (
        <p className="empty">Aucun contrat trouvé.</p>
      )}

      {data?.assurances.length > 0 && (
        <table>
          <thead>
            <tr><th>Type</th><th>Prime</th><th>Début</th><th>Fin</th><th>Statut</th></tr>
          </thead>
          <tbody>
            {data.assurances.map((a: any) => (
              <tr key={a.id}>
                <td>{a.type}</td>
                <td>{a.prime.toLocaleString('fr-FR')} FCFA</td>
                <td>{fmt(a.dateDebut)}</td>
                <td>{fmt(a.dateFin)}</td>
                <td>
                  <span className={`badge ${a.statut === 'ACTIF' ? 'badge-green' : 'badge-red'}`}>
                    {a.statut}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
