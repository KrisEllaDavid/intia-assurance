import { useMutation, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { GET_CLIENTS, DELETE_CLIENT } from '../../graphql/clients';

export default function Clients() {
  const { data, loading, error } = useQuery(GET_CLIENTS);
  const [deleteClient] = useMutation(DELETE_CLIENT, {
    refetchQueries: [{ query: GET_CLIENTS }],
  });

  const handleDelete = (id: string, nom: string) => {
    if (!confirm(`Supprimer le client ${nom} ?`)) return;
    deleteClient({ variables: { id } });
  };

  if (loading) return <p>Chargement...</p>;
  if (error)   return <p className="error">{error.message}</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Clients</h1>
        <Link to="/clients/new" className="btn btn-primary">+ Nouveau client</Link>
      </div>

      {!data?.clients.length ? (
        <p className="empty">Aucun client enregistré.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nom</th><th>Prénom</th><th>Email</th>
              <th>Téléphone</th><th>Agence</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.clients.map((c: any) => (
              <tr key={c.id}>
                <td>{c.nom}</td>
                <td>{c.prenom}</td>
                <td>{c.email}</td>
                <td>{c.telephone ?? '—'}</td>
                <td>{c.agence.nom}</td>
                <td>
                  <div className="actions">
                    <Link to={`/clients/${c.id}/edit`} className="btn btn-secondary btn-sm">Modifier</Link>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id, `${c.nom} ${c.prenom}`)}>
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
