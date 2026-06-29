import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getCajaMovimientosHoy, getSaldoPorMedioPago, cerrarCaja } from '../services/api';
import EntradaSalidaCajaModal from '../components/EntradaSalidaCajaModal/EntradaSalidaCajaModal';
import CobroSocioModal from '../components/CobroSocioModal/CobroSocioModal';
import styles from './CajaPage.module.css';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(amount || 0);
};

const CajaPage = ({ usuario, showToast }) => {
    const caja = usuario?.nroCaja;
    const [movimientos, setMovimientos] = useState([]);
    const [saldoPorMedioPago, setSaldoPorMedioPago] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalTipo, setModalTipo] = useState(null);
    const [showCobroModal, setShowCobroModal] = useState(false);

    const loadMovimientos = useCallback(async () => {
        if (!caja) return;
        setLoading(true);
        setError(null);
        try {
            const [data, medioPagoData] = await Promise.all([
                getCajaMovimientosHoy(caja),
                getSaldoPorMedioPago(caja),
            ]);
            setMovimientos(Array.isArray(data) ? data : []);
            setSaldoPorMedioPago(Array.isArray(medioPagoData) ? medioPagoData : []);
        } catch (err) {
            console.error('Error loading movimientos de caja:', err);
            setError('Error al cargar los movimientos de la caja');
        } finally {
            setLoading(false);
        }
    }, [caja]);

    useEffect(() => {
        loadMovimientos();
    }, [loadMovimientos]);

    const saldo = movimientos.reduce(
        (acc, m) => acc + (parseFloat(m.TotalDebe) || 0) - (parseFloat(m.TotalHaber) || 0),
        0
    );

    const handleCerrarCaja = async () => {
        if (!window.confirm('¿Confirma el cierre de caja del día? Los movimientos se archivarán y no se podrán modificar.')) {
            return;
        }
        try {
            const resumen = await cerrarCaja({ caja, usuario: usuario?.nombre });
            showToast(`Caja cerrada (cierre N° ${resumen.nroCierre}). Saldo final: ${formatCurrency(resumen.saldoFinal)}`, 'success');
            loadMovimientos();
        } catch (err) {
            showToast(err.response?.data?.error || 'Error al cerrar la caja', 'error');
        }
    };

    if (!caja) {
        return (
            <div className={styles.page}>
                <p className={styles.error}>Tu usuario no tiene una caja asignada (nroCaja).</p>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Caja N° {caja}</h1>
                <div className={`${styles.saldoBox} ${saldo < 0 ? styles.negativo : ''}`}>
                    Saldo actual: {formatCurrency(saldo)}
                </div>
            </div>

            {saldoPorMedioPago.length > 0 && (
                <div className={styles.medioPagoBox}>
                    {saldoPorMedioPago.map((mp) => (
                        <div className={styles.medioPagoItem} key={mp.medioPago}>
                            <span className={styles.nombre}>{mp.descripcion || `Medio ${mp.medioPago}`}</span>
                            <span className={styles.monto}>{formatCurrency(mp.total)}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.actions}>
                <button className="btn-primary" onClick={() => setShowCobroModal(true)}>
                    Cobrar Cuota a Socio
                </button>
                <button className="btn-secondary" onClick={() => setModalTipo('Entrada Caja')}>
                    Entrada de Caja
                </button>
                <button className="btn-secondary" onClick={() => setModalTipo('Salida Caja')}>
                    Salida de Caja
                </button>
                <button className="btn-secondary" onClick={() => setModalTipo('Cobranza Especial')}>
                    Cobranza Especial
                </button>
                <Link to="/caja/historico" className="btn-secondary">
                    Ver Histórico
                </Link>
                <button className={styles.btnDanger} onClick={handleCerrarCaja}>
                    Cerrar Caja
                </button>
            </div>

            {error ? (
                <p className={styles.error}>{error}</p>
            ) : loading ? (
                <p className={styles.noData}>Cargando movimientos...</p>
            ) : movimientos.length === 0 ? (
                <p className={styles.noData}>No hay movimientos registrados hoy.</p>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Nombre / Detalle</th>
                                <th>Debe</th>
                                <th>Haber</th>
                                <th>NroDoc</th>
                                <th>Usuario</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movimientos.map((m) => (
                                <tr key={m.ID}>
                                    <td>{m.TipoDoc?.trim()}</td>
                                    <td>{m.Nombre?.trim() || m.Detalle?.trim() || '-'}</td>
                                    <td className={styles.debe}>{m.TotalDebe ? formatCurrency(m.TotalDebe) : '-'}</td>
                                    <td className={styles.haber}>{m.TotalHaber ? formatCurrency(m.TotalHaber) : '-'}</td>
                                    <td>{m.NroDoc || '-'}</td>
                                    <td>{m.Usuario?.trim() || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <EntradaSalidaCajaModal
                isOpen={!!modalTipo}
                tipo={modalTipo}
                onClose={() => setModalTipo(null)}
                onSuccess={() => {
                    setModalTipo(null);
                    loadMovimientos();
                }}
                caja={caja}
                usuario={usuario?.nombre}
                showToast={showToast}
            />

            <CobroSocioModal
                isOpen={showCobroModal}
                onClose={() => setShowCobroModal(false)}
                onSuccess={() => {
                    setShowCobroModal(false);
                    loadMovimientos();
                }}
                caja={caja}
                usuario={usuario?.nombre}
                showToast={showToast}
            />
        </div>
    );
};

export default CajaPage;
