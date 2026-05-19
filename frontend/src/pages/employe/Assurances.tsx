import { useMutation, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { GET_ASSURANCES, DELETE_ASSURANCE } from '../../graphql/assurances';

const fmt = (iso: string) => new Date(iso).toLocaleDateString('fr-FR');
const fmtPrime = (n: number) => n.toLocaleString('fr-FR') + ' FCFA';

export default function Assurances() {
  const { data, loading, error } = useQuery(GET_ASSURANCES);
  const [deleteAssurance] = useMutation(DELETE_ASSURANCE, {
    refetchQueries: [{ query: GET_ASSURANCES }],
  });

  const handleDelete = (id: string) => {
    if (!confirm('Supprimer ce contrat ?')) return;
    deleteAssurance({ variables: { id } });
  };

  if (loading) return <p>Chargement...</p>;
  if (error)   return <p className="error">{error.message}</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Contrats d'assurance</h1>
        <Link to="/assurances/new" className="btn btn-primary">+ Nouveau contrat</Link>
      </div>

      {!data?.assurances.length ? (
        <p className="empty">Aucun contrat enregistré.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Type</th><th>Client</th><th>Agence</th>
              <th>Prime</th><th>Début</th><th>Fin</th><th>Statut</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.assurances.map((a: any) => (
              <tr key={a.id}>
                <td>{a.type}</td>
                <td>{a.client.nom} {a.client.prenom}</td>
                <td>{a.client.agence.nom}</td>
                <td>{fmtPrime(a.prime)}</td>
                <td>{fmt(a.dateDebut)}</td>
                <td>{fmt(a.dateFin)}</td>
                <td>
                  <span className={`badge ${a.statut === 'ACTIF' ? 'badge-green' : 'badge-red'}`}>
                    {a.statut}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <Link to={`/assurances/${a.id}/edit`} className="btn btn-secondary btn-sm">Modifier</Link>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
