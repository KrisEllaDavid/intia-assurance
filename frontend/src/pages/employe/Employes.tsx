import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_EMPLOYES, CREATE_EMPLOYE, DELETE_EMPLOYE } from '../../graphql/employes';
import { GET_AGENCES } from '../../graphql/agences';

const BLANK = { nom: '', prenom: '', email: '', motDePasse: '', role: 'AGENT', agenceId: '' };

export default function Employes() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ ...BLANK });
  const [errMsg, setErrMsg]     = useState('');

  const { data }          = useQuery(GET_EMPLOYES);
  const { data: agences } = useQuery(GET_AGENCES);

  const refetchQueries = [{ query: GET_EMPLOYES }];

  const [createEmploye, { loading }] = useMutation(CREATE_EMPLOYE, {
    refetchQueries,
    onCompleted: () => { setForm({ ...BLANK }); setShowForm(false); },
    onError: err => setErrMsg(err.message),
  });

  const [deleteEmploye] = useMutation(DELETE_EMPLOYE, { refetchQueries });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg('');
    const input: any = { ...form };
    if (!input.agenceId) delete input.agenceId;
    createEmploye({ variables: { input } });
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div>
      <div className="page-header">
        <h1>Employés</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Annuler' : '+ Nouvel employé'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h2>Créer un employé</h2>
          <form onSubmit={submit}>
            <div className="form-row">
              <div className="form-group"><label>Nom *</label><input value={form.nom} onChange={set('nom')} required /></div>
              <div className="form-group"><label>Prénom *</label><input value={form.prenom} onChange={set('prenom')} required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Email *</label><input type="email" value={form.email} onChange={set('email')} required /></div>
              <div className="form-group"><label>Mot de passe *</label><input type="password" value={form.motDePasse} onChange={set('motDePasse')} required /></div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Rôle *</label>
                <select value={form.role} onChange={set('role')}>
                  <option value="AGENT">AGENT</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="form-group">
                <label>Agence {form.role === 'AGENT' ? '*' : '(optionnel)'}</label>
                <select value={form.agenceId} onChange={set('agenceId')} required={form.role === 'AGENT'}>
                  <option value="">— Choisir —</option>
                  {agences?.agences.map((a: any) => <option key={a.id} value={a.id}>{a.nom}</option>)}
                </select>
              </div>
            </div>
            {errMsg && <p className="error">{errMsg}</p>}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Création...' : 'Créer'}
            </button>
          </form>
        </div>
      )}

      <table>
        <thead>
          <tr><th>Nom</th><th>Prénom</th><th>Email</th><th>Rôle</th><th>Agence</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {data?.employes.map((e: any) => (
            <tr key={e.id}>
              <td>{e.nom}</td><td>{e.prenom}</td><td>{e.email}</td>
              <td><span className="badge badge-green">{e.role}</span></td>
              <td>{e.agence?.nom ?? 'Global'}</td>
              <td>
                <button className="btn btn-danger btn-sm"
                  onClick={() => confirm(`Supprimer ${e.nom} ?`) && deleteEmploye({ variables: { id: e.id } })}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
