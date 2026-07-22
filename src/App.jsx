import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HeaderNav from './components/HeaderNav/HeaderNav';
import Footer from './components/Footer/Footer';
import Toast from './components/Toast/Toast';
import Home from './pages/Home';
import RubrosPage from './pages/RubrosPage';
import RadiosPage from './pages/RadiosPage';
import FormaPagoPage from './pages/FormaPagoPage';
import MediosPagoPage from './pages/MediosPagoPage';
import ParametrosPage from './pages/ParametrosPage';
import AddSocioPage from './pages/AddSocioPage';
import SociosPage from './pages/SociosPage';
import SociosHistoricosPage from './pages/SociosHistoricosPage';
import DashboardPage from './pages/DashboardPage';
import CategoriasSociosPage from './pages/CategoriasSociosPage';
import GruposFamiliaresPage from './pages/GruposFamiliaresPage';
import GrupoFamiliarDetailPage from './pages/GrupoFamiliarDetailPage';
import MotivosBajaPage from './pages/MotivosBajaPage';
import SocioDetailsPage from './pages/SocioDetailsPage';
import SocioEditPage from './pages/SocioEditPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GenerarCuotasPage from './pages/GenerarCuotasPage';
import RechazosPage from './pages/RechazosPage';
import CajaPage from './pages/CajaPage';
import CajaHistoricoPage from './pages/CajaHistoricoPage';
import GeneracionArchivosPage from './pages/GeneracionArchivosPage';
import ParametrosDebitosPage from './pages/ParametrosDebitosPage';
import PortalSocioLoginPage from './pages/PortalSocioLoginPage';
import PortalSocioPage from './pages/PortalSocioPage';
import UsuariosPage from './pages/UsuariosPage';
import UtilidadesPage from './pages/UtilidadesPage';
import InformeSociosContactoPage from './pages/InformeSociosContactoPage';
import InformeSociosDeudasPage from './pages/InformeSociosDeudasPage';
import InformePlanillaSociosPage from './pages/InformePlanillaSociosPage';
import InformeCobranzaPeriodoPage from './pages/InformeCobranzaPeriodoPage';
import ControlAccesoPage from './pages/ControlAccesoPage';
import './App.css';

const getUsuarioGuardado = () => {
  try {
    const data = localStorage.getItem('usuario');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

function PrivateRoute({ usuario, children }) {
  if (!usuario) return <Navigate to="/login" replace />;
  return children;
}

function AppInner() {
  const [usuario, setUsuario] = useState(getUsuarioGuardado);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const hideToast = () => setToastVisible(false);

  const handleLogin = (u) => {
    setUsuario(u);
    localStorage.setItem('usuario', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
  };

  const [socio, setSocio] = useState(() => {
    try {
      const data = localStorage.getItem('socio');
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  });

  const handleLoginSocio = (s) => {
    setSocio(s);
    localStorage.setItem('socio', JSON.stringify(s));
  };

  const handleLogoutSocio = () => {
    setSocio(null);
    localStorage.removeItem('socio');
  };

  return (
    <Router>
      <AppContent
        usuario={usuario}
        socio={socio}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        handleLoginSocio={handleLoginSocio}
        handleLogoutSocio={handleLogoutSocio}
        showToast={showToast}
        toastMessage={toastMessage}
        toastType={toastType}
        toastVisible={toastVisible}
        hideToast={hideToast}
      />
    </Router>
  );
}

// Layout: decide qué chrome (header/footer/título de pestaña) mostrar según
// la sección en la que se está. El portal del socio es una web aparte desde
// el punto de vista del usuario: no debe verse el header ni el footer del
// staff, ni depender de que haya sesión de "gestion-de-socios" iniciada.
function AppContent({
  usuario,
  socio,
  handleLogin,
  handleLogout,
  handleLoginSocio,
  handleLogoutSocio,
  showToast,
  toastMessage,
  toastType,
  toastVisible,
  hideToast,
}) {
  const location = useLocation();
  const isPortalSocio = location.pathname.startsWith('/portal-socio');

  useEffect(() => {
    document.title = isPortalSocio ? 'Portal del Socio' : 'Gestión de socios';
  }, [isPortalSocio]);

  return (
    <div className={isPortalSocio ? 'app app--portal-socio' : 'app'}>
      {!isPortalSocio && !location.pathname.startsWith('/control-acceso') && usuario && <HeaderNav usuario={usuario} onLogout={handleLogout} />}
      <main className="main-content"><Routes>
        <Route path="/login" element={usuario ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={usuario ? <Navigate to="/" replace /> : <RegisterPage />} />

        <Route path="/" element={<PrivateRoute usuario={usuario}><DashboardPage usuario={usuario} /></PrivateRoute>} />
        <Route path="/rubros" element={<PrivateRoute usuario={usuario}><RubrosPage showToast={showToast} /></PrivateRoute>} />
        <Route path="/radios" element={<PrivateRoute usuario={usuario}><RadiosPage showToast={showToast} /></PrivateRoute>} />
        <Route path="/formapago" element={<PrivateRoute usuario={usuario}><FormaPagoPage showToast={showToast} /></PrivateRoute>} />
        <Route path="/mediospago" element={<PrivateRoute usuario={usuario}><MediosPagoPage showToast={showToast} /></PrivateRoute>} />
        <Route path="/parametros" element={<PrivateRoute usuario={usuario}><ParametrosPage showToast={showToast} /></PrivateRoute>} />
        <Route path="/agregar-socio" element={<PrivateRoute usuario={usuario}><AddSocioPage showToast={showToast} /></PrivateRoute>} />
        <Route path="/socios" element={<PrivateRoute usuario={usuario}><SociosPage showToast={showToast} /></PrivateRoute>} />
        <Route path="/socios-historicos" element={<PrivateRoute usuario={usuario}><SociosHistoricosPage showToast={showToast} /></PrivateRoute>} />
        <Route path="/socios-historicos/:id" element={<PrivateRoute usuario={usuario}><SocioDetailsPage isHistorical={true} /></PrivateRoute>} />
        <Route path="/grupos-familiares" element={<PrivateRoute usuario={usuario}><GruposFamiliaresPage showToast={showToast} /></PrivateRoute>} />
        <Route path="/grupos-familiares/:socDocIde" element={<PrivateRoute usuario={usuario}><GrupoFamiliarDetailPage showToast={showToast} /></PrivateRoute>} />
        <Route path="/categorias-socios" element={<PrivateRoute usuario={usuario}><CategoriasSociosPage showToast={showToast} /></PrivateRoute>} />
        <Route path="/motivos-baja" element={<PrivateRoute usuario={usuario}><MotivosBajaPage showToast={showToast} /></PrivateRoute>} />
        <Route path="/generar-cuotas" element={<PrivateRoute usuario={usuario}><GenerarCuotasPage showToast={showToast} /></PrivateRoute>} />
        <Route path="/rechazos" element={<PrivateRoute usuario={usuario}><RechazosPage showToast={showToast} /></PrivateRoute>} />
        <Route path="/caja" element={<PrivateRoute usuario={usuario}><CajaPage usuario={usuario} showToast={showToast} /></PrivateRoute>} />
        <Route path="/caja/historico" element={<PrivateRoute usuario={usuario}><CajaHistoricoPage usuario={usuario} showToast={showToast} /></PrivateRoute>} />
        <Route path="/socios/:id" element={<PrivateRoute usuario={usuario}><SocioDetailsPage usuario={usuario} showToast={showToast} /></PrivateRoute>} />
        <Route path="/socios/edit/:id" element={<PrivateRoute usuario={usuario}><SocioEditPage showToast={showToast} /></PrivateRoute>} />
        <Route path="/generacion-archivos" element={<PrivateRoute usuario={usuario}><GeneracionArchivosPage showToast={showToast} /></PrivateRoute>} />
        <Route path="/parametros-debitos" element={<PrivateRoute usuario={usuario}><ParametrosDebitosPage showToast={showToast} /></PrivateRoute>} />
        <Route path="/portal-socio/login" element={socio ? <Navigate to="/portal-socio" replace /> : <PortalSocioLoginPage onLogin={handleLoginSocio} />} />
        <Route path="/portal-socio" element={socio ? <PortalSocioPage socio={socio} onLogout={handleLogoutSocio} showToast={showToast} /> : <Navigate to="/portal-socio/login" replace />} />
        <Route path="/usuarios" element={<PrivateRoute usuario={usuario}>{usuario?.tipo === 'Administrador' ? <UsuariosPage showToast={showToast} /> : <Navigate to="/" replace />}</PrivateRoute>} />
        <Route path="/utilidades" element={<PrivateRoute usuario={usuario}><UtilidadesPage usuario={usuario} /></PrivateRoute>} />
        <Route path="/informe-socios-contacto" element={<PrivateRoute usuario={usuario}><InformeSociosContactoPage showToast={showToast} /></PrivateRoute>} />
        <Route path="/informe-socios-deudas" element={<PrivateRoute usuario={usuario}><InformeSociosDeudasPage showToast={showToast} /></PrivateRoute>} />
        <Route path="/informe-planilla-socios" element={<PrivateRoute usuario={usuario}><InformePlanillaSociosPage showToast={showToast} /></PrivateRoute>} />
        <Route path="/informe-cobranza-periodo" element={<PrivateRoute usuario={usuario}><InformeCobranzaPeriodoPage showToast={showToast} /></PrivateRoute>} />
        <Route path="/control-acceso/login" element={usuario ? <Navigate to="/control-acceso" replace /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="/control-acceso" element={usuario ? <ControlAccesoPage usuario={usuario} onLogout={handleLogout} showToast={showToast} /> : <Navigate to="/control-acceso/login" replace />} />
      </Routes></main>
      {!isPortalSocio && usuario && <Footer />}
      {isPortalSocio && socio && <Footer label="Portal del Socio" />}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={hideToast}
      />
    </div>
  );
}

export default AppInner;