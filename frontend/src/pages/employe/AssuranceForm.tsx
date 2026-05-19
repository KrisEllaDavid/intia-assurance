import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import { GET_ASSURANCE, GET_ASSURANCES, CREATE_ASSURANCE, UPDATE_ASSURANCE } from '../../graphql/assurances';
import { GET_CLIENTS } from '../../graphql/clients';

const TYPES = ['Auto', 'Habitation', 'Santé', 'Vie', 'Voyage', 'Professionnel'];

const toDateInput = (iso: string) => iso?.split('T')[0] ?? '';

export default function AssuranceForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit  = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    type: '', prime: '', dateDebut: '', dateFin: '', statut: 'ACTIF', clientId: '',
  });
  const [errMsg, setErrMsg] = useState('');

  const { data: clientsData } = useQuery(GET_CLIENTS);
  const { data: assuranceData } = useQuery(GET_ASSURANCE, { variables: { id }, skip: !isEdit });

  useEffect(() => {
    if (assuranceData?.assurance) {
      const a = assuranceData.assurance;
      setForm({
        type: a.type, prime: String(a.prime), statut: a.statut,
        dateDebut: toDateInput(a.dateDebut), dateFin: toDateInput(a.dateFin),
        clientId: a.client.id,
      });
    }
  }, [assuranceData]);

  const refetchQueries = [{ query: GET_ASSURANCES }];

  const [createAssurance, { loading: creating }] = useMutation(CREATE_ASSURANCE, {
    refetchQueries,
    onCompleted: () => navigate('/assurances'),
    onError: err => setErrMsg(err.message),
  });
  const [updateAssurance, { loading: updating }] = useMutation(UPDATE_ASSURANCE, {
    refetchQueries,
    onCompleted: () => navigate('/assurances'),
    onError: err => setErrMsg(err.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg('');
    const input = {
      type: form.type, prime: parseFloat(form.prime),
      dateDebut: form.dateDebut, dateFin: form.dateFin,
      statut: form.statut, clientId: form.clientId,
    };
    if (isEdit) updateAssurance({ variables: { id, input } });
    else        createAssurance({ variables: { input } });
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="card" style={{ maxWidth: 700 }}>
      <h1>{isEdit ? 'Modifier le contrat' : 'Nouveau contrat'}</h1>
      <form onSubmit={submit}>
        <div className="form-row">
          <div className="form-group">
            <label>Type d'assurance *</label>
            <select value={form.type} onChange={set('type')} required>
              <option value="">— Choisir —</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Statut</label>
            <select value={form.statut} onChange={set('statut')}>
              <option value="ACTIF">ACTIF</option>
              <option value="RESILIE">RÉSILIÉ</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Prime (FCFA) *</label>
          <input type="number" min="0" value={form.prime} onChange={set('prime')} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Date de début *</label>
            <input type="date" value={form.dateDebut} onChange={set('dateDebut')} required />
          </div>
          <div className="form-group">
            <label>Date de fin *</label>
            <input type="date" value={form.dateFin} onChange={set('dateFin')} required />
          </div>
        </div>
        <div className="form-group">
          <label>Client *</label>
          <select value={form.clientId} onChange={set('clientId')} required>
            <option value="">— Choisir un client —</option>
            {clientsData?.clients.map((c: any) => (
              <option key={c.id} value={c.id}>{c.nom} {c.prenom} — {c.agence.nom}</option>
            ))}
          </select>
        </div>

        {errMsg && <p className="error">{errMsg}</p>}

        <div className="actions" style={{ marginTop: 16 }}>
          <button type="submit" className="btn btn-primary" disabled={creating || updating}>
            {creating || updating ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/assurances')}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
