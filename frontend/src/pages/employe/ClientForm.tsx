import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import { GET_CLIENT, GET_CLIENTS, CREATE_CLIENT, UPDATE_CLIENT } from '../../graphql/clients';
import { GET_AGENCES } from '../../graphql/agences';
import { getUser, isAdmin } from '../../lib/auth';

export default function ClientForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit  = Boolean(id);
  const navigate = useNavigate();
  const userInfo = getUser() as any;

  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', motDePasse: '',
    telephone: '', adresse: '', agenceId: '',
  });
  const [errMsg, setErrMsg] = useState('');

  const { data: agencesData } = useQuery(GET_AGENCES);
  const { data: clientData }  = useQuery(GET_CLIENT, { variables: { id }, skip: !isEdit });

  useEffect(() => {
    if (clientData?.client) {
      const c = clientData.client;
      setForm({
        nom: c.nom, prenom: c.prenom, email: c.email, motDePasse: '',
        telephone: c.telephone ?? '', adresse: c.adresse ?? '',
        agenceId: c.agence.id,
      });
    } else if (!isEdit) {
      // pre-fill agence for AGENT
      if (!isAdmin() && userInfo?.agence?.id) {
        setForm(f => ({ ...f, agenceId: userInfo.agence.id }));
      }
    }
  }, [clientData, isEdit, userInfo]);

  const refetchQueries = [{ query: GET_CLIENTS }];

  const [createClient, { loading: creating }] = useMutation(CREATE_CLIENT, {
    refetchQueries,
    onCompleted: () => navigate('/clients'),
    onError: err => setErrMsg(err.message),
  });

  const [updateClient, { loading: updating }] = useMutation(UPDATE_CLIENT, {
    refetchQueries,
    onCompleted: () => navigate('/clients'),
    onError: err => setErrMsg(err.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg('');
    const input: any = {
      nom: form.nom, prenom: form.prenom, email: form.email,
      telephone: form.telephone || undefined, adresse: form.adresse || undefined,
      agenceId: form.agenceId,
    };
    if (form.motDePasse) input.motDePasse = form.motDePasse;

    if (isEdit) updateClient({ variables: { id, input } });
    else        createClient({ variables: { input } });
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="card" style={{ maxWidth: 700 }}>
      <h1>{isEdit ? 'Modifier le client' : 'Nouveau client'}</h1>
      <form onSubmit={submit}>
        <div className="form-row">
          <div className="form-group">
            <label>Nom *</label>
            <input value={form.nom} onChange={set('nom')} required />
          </div>
          <div className="form-group">
            <label>Prénom *</label>
            <input value={form.prenom} onChange={set('prenom')} required />
          </div>
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input type="email" value={form.email} onChange={set('email')} required />
        </div>
        <div className="form-group">
          <label>Mot de passe portail {isEdit ? '(laisser vide = inchangé)' : '(optionnel)'}</label>
          <input type="password" value={form.motDePasse} onChange={set('motDePasse')} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Téléphone</label>
            <input value={form.telephone} onChange={set('telephone')} />
          </div>
          <div className="form-group">
            <label>Adresse</label>
            <input value={form.adresse} onChange={set('adresse')} />
          </div>
        </div>

        {isAdmin() && (
          <div className="form-group">
            <label>Agence *</label>
            <select value={form.agenceId} onChange={set('agenceId')} required>
              <option value="">— Choisir une agence —</option>
              {agencesData?.agences.map((a: any) => (
                <option key={a.id} value={a.id}>{a.nom}</option>
              ))}
            </select>
          </div>
        )}

        {errMsg && <p className="error">{errMsg}</p>}

        <div className="actions" style={{ marginTop: 16 }}>
          <button type="submit" className="btn btn-primary" disabled={creating || updating}>
            {creating || updating ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/clients')}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
