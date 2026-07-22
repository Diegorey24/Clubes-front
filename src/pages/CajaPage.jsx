import { useState, useEffect, useCallback } from 'react';
import { getCajaMovimientosHoy, getSaldoPorMedioPago, cerrarCaja } from '../services/api';
import EntradaSalidaCajaModal from '../components/EntradaSalidaCajaModal/EntradaSalidaCajaModal';
import CobroSocioModal from '../components/CobroSocioModal/CobroSocioModal';
import { Button, PageHeader, ConfirmDialog } from '../components/ui';
import styles from './CajaPage.module.css';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(amount || 0);
};

const WalletIcon = (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a2 2 0 00-2-2H7a2 2 0 00-2 2m16 0v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6m16 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v3m14 3h.01" />
    </svg>
);

const CobrarIcon = (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2m9-8a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const EntradaIcon = (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v13m0 0l-4.5-4.5M12 17l4.5-4.5M4 21h16" />
    </svg>
);

const SalidaIcon = (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20V7m0 0l-4.5 4.5M12 7l4.5 4.5M4 3h16" />
    </svg>
);

const CobranzaIcon = (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const HistoryIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
);

const CerrarIcon = (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const CajaPage = ({ usuario, showToast }) => {
    const caja = usuario?.nroCaja;
    const [movimientos, setMovimientos] = useState([]);
    const [saldoPorMedioPago, setSaldoPorMedioPago] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalTipo, setModalTipo] = useState(null);
    const [showCobroModal, setShowCobroModal] = useState(false);
    const [confirmCerrar, setConfirmCerrar] = useState(false);
    const [cerrando, setCerrando] = useState(false);

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
        setCerrando(true);
        try {
            const resumen = await cerrarCaja({ caja, usuario: usuario?.nombre });
            showToast(`Caja cerrada (cierre N° ${resumen.nroCierre}). Saldo final: ${formatCurrency(resumen.saldoFinal)}`, 'success');
            setConfirmCerrar(false);
            loadMovimientos();
        } catch (err) {
            showToast(err.response?.data?.error || 'Error al cerrar la caja', 'error');
        } finally {
            setCerrando(false);
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
            <PageHeader title={`Caja N° ${caja}`} subtitle="Movimientos y cobros del día" />

            <div className={styles.statsRow}>
                <div className={`${styles.saldoCard} ${saldo < 0 ? styles.negativo : ''}`}>
                    <span className={styles.saldoIconWrap}>{WalletIcon}</span>
                    <div className={styles.saldoText}>
                        <span className={styles.statLabel}>Saldo actual</span>
                        <span className={styles.saldoValue}>{formatCurrency(saldo)}</span>
                    </div>
                </div>

                {saldoPorMedioPago.map((mp) => (
                    <div className={styles.medioPagoCard} key={mp.medioPago}>
                        <span className={styles.statLabel}>{mp.descripcion || `Medio ${mp.medioPago}`}</span>
                        <span className={styles.medioPagoValue}>{formatCurrency(mp.total)}</span>
                    </div>
                ))}
            </div>

            <div className={styles.actionsRow}>
                <div className={styles.actionsGroup}>
                    <Button
                        variant="soft-success"
                        icon={EntradaIcon}
                        className={styles.actionBtn}
                        onClick={() => setModalTipo('Entrada Caja')}
                    >
                        Entrada de Caja
                    </Button>
                    <Button
                        variant="soft-warning"
                        icon={SalidaIcon}
                        className={styles.actionBtn}
                        onClick={() => setModalTipo('Salida Caja')}
                    >
                        Salida de Caja
                    </Button>
                    {/* <Button
                        variant="soft"
                        icon={CobranzaIcon}
                        className={styles.actionBtn}
                        onClick={() => setModalTipo('Cobranza Especial')}
                    >
                        Cobranza Especial
                    </Button> */}
                    <Button
                        variant="soft-danger"
                        icon={CerrarIcon}
                        className={styles.actionBtn}
                        onClick={() => setConfirmCerrar(true)}
                    >
                        Cerrar Caja
                    </Button>
                </div>

                <Button
                    variant="primary"
                    icon={CobrarIcon}
                    className={styles.actionBtn}
                    onClick={() => setShowCobroModal(true)}
                >
                    Cobrar cuota a socio
                </Button>
            </div>

            <div className={styles.tableToolbar}>
                <Button variant="ghost" size="sm" icon={HistoryIcon} to="/caja/historico">
                    Ver Histórico
                </Button>
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
                                <th>N.° Doc</th>
                                <th>Usuario</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movimientos.map((m) => (
                                <tr key={m.ID}>
                                    <td>{m.TipoDoc?.trim()}</td>
                                    <td className={styles.nameCell}>{m.Nombre?.trim() || m.Detalle?.trim() || '-'}</td>
                                    <td className={styles.debe}>{m.TotalDebe ? formatCurrency(m.TotalDebe) : '-'}</td>
                                    <td className={styles.haber}>{m.TotalHaber ? formatCurrency(m.TotalHaber) : '-'}</td>
                                    <td className={styles.muted}>{m.NroDoc || '-'}</td>
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
                    loadMovimientos();
                }}
                caja={caja}
                usuario={usuario?.nombre}
                showToast={showToast}
            />

            <ConfirmDialog
                isOpen={confirmCerrar}
                title="¿Cerrar caja del día?"
                description="Los movimientos se archivarán y no se van a poder modificar."
                confirmLabel="Sí, cerrar caja"
                cancelLabel="Cancelar"
                variant="danger"
                loading={cerrando}
                onConfirm={handleCerrarCaja}
                onCancel={() => setConfirmCerrar(false)}
            />
        </div>
    );
};

export default CajaPage;
