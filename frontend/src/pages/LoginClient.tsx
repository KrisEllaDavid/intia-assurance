import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';
import { LOGIN_CLIENT } from '../graphql/auth';
import { saveClientAuth } from '../lib/auth';

export default function LoginClient() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', motDePasse: '' });
  const [errMsg, setErrMsg] = useState('');

  const [login, { loading }] = useMutation(LOGIN_CLIENT, {
    onCompleted: ({ loginClient }) => {
      saveClientAuth(loginClient.token, loginClient.client);
      navigate('/client/mes-assurances');
    },
    onError: (err) => setErrMsg(err.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg('');
    login({ variables: form });
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1>INTIA Assurance</h1>
        <p className="login-subtitle">Portail Client</p>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} required
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input type="password" value={form.motDePasse} required
              onChange={e => setForm(f => ({ ...f, motDePasse: e.target.value }))} />
          </div>
          {errMsg && <p className="error">{errMsg}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p style={{ marginTop: 16, textAlign: 'center', fontSize: 13 }}>
          Vous êtes employé ? <Link to="/login" className="link">Espace employé</Link>
        </p>
      </div>
    </div>
  );
}
