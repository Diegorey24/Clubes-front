import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginSocio } from '../services/api';
import styles from './LoginPage.module.css';

function PortalSocioLoginPage({ onLogin }) {
    const [ci, setCi] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await loginSocio(ci, contrasena);
            onLogin(data.socio);
            navigate('/portal-socio');
        } catch (err) {
            setError(err.response?.data?.error || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                <div className={styles.brand}>
                    <img
                        src={`${import.meta.env.BASE_URL}cliente.svg`}
                        alt="Logo del club"
                        style={{ height: '72px', marginBottom: '8px' }}
                    />
                    <span className={styles.brandText}>Portal del Socio</span>
                </div>

                <h1 className={styles.title}>Iniciar sesión</h1>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label className={styles.label}>Cédula de identidad</label>
                        <input
                            type="number"
                            className={styles.input}
                            value={ci}
                            onChange={(e) => setCi(e.target.value)}
                            placeholder="Ingresá tu cédula"
                            required
                            autoFocus
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Contraseña</label>
                        <input
                            type="password"
                            className={styles.input}
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            placeholder="Ingresá tu contraseña"
                            required
                        />
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                <p className={styles.footer}>
                    La contraseña inicial es tu número de cédula.
                </p>
            </div>
        </div>
    );
}

export default PortalSocioLoginPage;