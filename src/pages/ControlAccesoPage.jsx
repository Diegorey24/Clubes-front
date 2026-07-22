import { useState, useEffect, useRef } from 'react';
import { formatFecha } from '../utils/date';
import api from '../services/api';
import styles from './ControlAccesoPage.module.css';

const ControlAccesoPage = ({ usuario, onLogout, showToast }) => {
    const [ci, setCi] = useState('');
    const [buscando, setBuscando] = useState(false);
    const [resultado, setResultado] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (resultado) {
            const timer = setTimeout(() => {
                setResultado(null);
                setCi('');
                inputRef.current?.focus();
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [resultado]);

    const handleBuscar = async (e) => {
        e.preventDefault();
        if (!ci.trim()) return;
        setBuscando(true);
        setResultado(null);
        try {
            const response = await api.get(`/control-acceso/${ci.trim()}`);
            setResultado(response.data);
        } catch (err) {
            showToast('Error al verificar acceso', 'error');
        } finally {
            setBuscando(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <img
                    src={`${import.meta.env.BASE_URL}cliente.svg`}
                    alt="Logo del club"
                    className={styles.logo}
                />
                <div className={styles.headerRight}>
                    <span className={styles.usuarioNombre}>{usuario?.nombre}</span>
                    <button className={styles.logoutBtn} onClick={onLogout} title="Cerrar sesión">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h7a1 1 0 000-2H4V5h6a1 1 0 000-2H3zm11.293 4.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L15.586 12H9a1 1 0 010-2h6.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className={styles.container}>
                <h1 className={styles.title}>Control de Acceso</h1>

                <form onSubmit={handleBuscar} className={styles.form}>
                    <input
                        ref={inputRef}
                        type="number"
                        className={styles.ciInput}
                        value={ci}
                        onChange={e => setCi(e.target.value)}
                        placeholder="Ingresá la cédula"
                        disabled={buscando}
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        className={styles.btnBuscar}
                        disabled={buscando || !ci.trim()}
                    >
                        {buscando ? 'Verificando...' : 'Verificar'}
                    </button>
                </form>

                {resultado && (
                    <div className={`${styles.resultado} ${resultado.acceso ? styles.resultadoOk : styles.resultadoDenegado}`}>
                        <div className={styles.resultadoIcono}>
                            {resultado.acceso ? (
                                <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </div>
                        <div className={styles.resultadoEstado}>
                            {resultado.acceso ? 'ACCESO PERMITIDO' : 'ACCESO DENEGADO'}
                        </div>
                        <div className={styles.resultadoMotivo}>{resultado.motivo}</div>
                        {resultado.socio && (
                            <div className={styles.resultadoSocio}>
                                <div className={styles.socioNombre}>{resultado.socio.nombre}</div>
                                <div className={styles.socioInfo}>
                                    <span>{resultado.socio.categoria}</span>
                                    <span>Nacimiento: {formatFecha(resultado.socio.fechaNacimiento)}</span>
                                    {resultado.socio.fichaMediaVto && (
                                        <span>Ficha médica: {formatFecha(resultado.socio.fichaMediaVto)}</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ControlAccesoPage;