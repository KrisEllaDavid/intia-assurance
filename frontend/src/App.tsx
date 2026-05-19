import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar           from './components/Navbar';
import { EmployeRoute, ClientRoute } from './components/ProtectedRoute';
import { getUserType }  from './lib/auth';

import LoginEmploye     from './pages/LoginEmploye';
import LoginClient      from './pages/LoginClient';
import Clients          from './pages/employe/Clients';
import ClientForm       from './pages/employe/ClientForm';
import Assurances       from './pages/employe/Assurances';
import AssuranceForm    from './pages/employe/AssuranceForm';
import Employes         from './pages/employe/Employes';
import MesAssurances    from './pages/client/MesAssurances';

function EmployeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="container">{children}</main>
    </>
  );
}

function defaultRedirect() {
  const t = getUserType();
  if (t === 'client')  return '/client/mes-assurances';
  if (t === 'employe') return '/clients';
  return '/login';
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"        element={<LoginEmploye />} />
        <Route path="/client/login" element={<LoginClient />} />

        <Route path="/clients" element={
          <EmployeRoute><EmployeLayout><Clients /></EmployeLayout></EmployeRoute>
        }/>
        <Route path="/clients/new" element={
          <EmployeRoute><EmployeLayout><ClientForm /></EmployeLayout></EmployeRoute>
        }/>
        <Route path="/clients/:id/edit" element={
          <EmployeRoute><EmployeLayout><ClientForm /></EmployeLayout></EmployeRoute>
        }/>

        <Route path="/assurances" element={
          <EmployeRoute><EmployeLayout><Assurances /></EmployeLayout></EmployeRoute>
        }/>
        <Route path="/assurances/new" element={
          <EmployeRoute><EmployeLayout><AssuranceForm /></EmployeLayout></EmployeRoute>
        }/>
        <Route path="/assurances/:id/edit" element={
          <EmployeRoute><EmployeLayout><AssuranceForm /></EmployeLayout></EmployeRoute>
        }/>

        <Route path="/employes" element={
          <EmployeRoute><EmployeLayout><Employes /></EmployeLayout></EmployeRoute>
        }/>

        <Route path="/client/mes-assurances" element={
          <ClientRoute><MesAssurances /></ClientRoute>
        }/>

        <Route path="*" element={<Navigate to={defaultRedirect()} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
