import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrarUsuario } from '../services/api';
import styles from './LoginPage.module.css';

const TIPOS = ['admin', 'operador', 'consulta'];

function RegisterPage() {
  const [nombre, setNombre] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [tipo, setTipo] = useState('operador');
  const [nroCaja, setNroCaja] = useState('1');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (contrasena !== confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await registrarUsuario(nombre, contrasena, tipo, nroCaja);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L4 8V14C4 22 16 30 16 30C16 30 28 22 28 14V8L16 2Z" fill="currentColor" />
            </svg>
          </div>
          <span className={styles.brandText}>Gestión de Clubes</span>
        </div>

        <h1 className={styles.title}>Crear cuenta</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Usuario</label>
            <input
              type="text"
              className={styles.input}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Elegí un nombre de usuario"
              required
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tipo</label>
            <select
              className={styles.input}
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>N° de Caja</label>
            <input
              type="number"
              className={styles.input}
              value={nroCaja}
              onChange={(e) => setNroCaja(e.target.value)}
              placeholder="Caja asignada a este usuario"
              min="1"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Contraseña</label>
            <input
              type="password"
              className={styles.input}
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirmar contraseña</label>
            <input
              type="password"
              className={styles.input}
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="Repetí la contraseña"
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p className={styles.footer}>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className={styles.link}>Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
