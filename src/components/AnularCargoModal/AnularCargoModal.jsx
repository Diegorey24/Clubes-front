import { useState, useEffect } from 'react';
import { getCargosAnulables, anularCargo } from '../../services/api';
import { ConfirmDialog } from '../ui';
import { formatFecha } from '../../utils/date';
import styles from './AnularCargoModal.module.css';

const CargoIcon = (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m-6 4h6m-6 4h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
    </svg>
);

const CloseIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const TrashIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(amount || 0);
};

// El campo "Mes" llega como fecha (ej. 2026-04-01T00:00:00.000Z) pero
// representa el período del cargo, así que se muestra como MM/AAAA.
const formatMonthYear = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${month}/${d.getUTCFullYear()}`;
};

// Modal para anular (eliminar) cargos de cuenta corriente que todavía no
// tienen recibo emitido (NroRecibo = 0). Lista los cargos anulables del
// socio, el usuario elige uno, confirma y se hace el DELETE.
const AnularCargoModal = ({ isOpen, onClose, onSuccess, socio, showToast }) => {
    const [cargos, setCargos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [cargoAAnular, setCargoAAnular] = useState(null);
    const [anulando, setAnulando] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setCargoAAnular(null);
        loadCargos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape' && !anulando && !cargoAAnular) onClose?.();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, anulando, cargoAAnular, onClose]);

    if (!isOpen) return null;

    const loadCargos = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getCargosAnulables(socio.SocDocIde);
            setCargos(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading cargos anulables:', err);
            setError('Error al cargar los cargos anulables');
        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !anulando && !cargoAAnular) onClose?.();
    };

    const handleConfirmarAnular = async () => {
        if (!cargoAAnular) return;
        setAnulando(true);
        try {
            await anularCargo(cargoAAnular.Id);
            showToast?.('Cargo anulado exitosamente', 'success');
            setCargoAAnular(null);
            onSuccess?.();
            loadCargos();
        } catch (err) {
            console.error('Error anulando cargo:', err);
            showToast?.(err.response?.data?.error || 'Error al anular el cargo', 'error');
        } finally {
            setAnulando(false);
        }
    };

    return (
        <>
            <div className={styles.overlay} onClick={handleBackdropClick}>
                <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="anular-cargo-title">
                    <div className={styles.header}>
                        <div className={styles.headerLeft}>
                            <span className={styles.iconWrap}>{CargoIcon}</span>
                            <h3 id="anular-cargo-title" className={styles.title}>Anular Cargo</h3>
                        </div>
                        <button
                            type="button"
                            className={styles.closeBtn}
                            onClick={onClose}
                            disabled={anulando}
                            aria-label="Cerrar"
                        >
                            {CloseIcon}
                        </button>
                    </div>

                    <div className={styles.body}>
                        {loading ? (
                            <p className={styles.loadingText}>Cargando cargos anulables...</p>
                        ) : error ? (
                            <p className={styles.error}>{error}</p>
                        ) : cargos.length === 0 ? (
                            <p className={styles.empty}>Este socio no tiene cargos que se puedan anular.</p>
                        ) : (
                            <div className={styles.cargosList}>
                                {cargos.map((cargo) => (
                                    <div className={styles.cargoRow} key={cargo.Id}>
                                        <div className={styles.cargoInfo}>
                                            <span className={styles.cargoRubro}>{cargo.RubDsc?.trim() || `Rubro ${cargo.Rubro}`}</span>
                                            <span className={styles.cargoMeta}>
                                                {formatMonthYear(cargo.Mes)} · Vto. {formatFecha(cargo.FechaVto)} · Emisión {cargo.Id}
                                            </span>
                                        </div>
                                        <span className={styles.cargoImporte}>{formatCurrency(cargo.Importe)}</span>
                                        <button
                                            type="button"
                                            className={styles.anularBtn}
                                            onClick={() => setCargoAAnular(cargo)}
                                            title="Anular este cargo"
                                            aria-label="Anular este cargo"
                                        >
                                            {TrashIcon}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={!!cargoAAnular}
                title="¿Anular este cargo?"
                description="Esta acción elimina el cargo de la cuenta corriente del socio y no se puede deshacer."
                confirmLabel="Sí, anular cargo"
                variant="danger"
                loading={anulando}
                onConfirm={handleConfirmarAnular}
                onCancel={() => setCargoAAnular(null)}
            >
                {cargoAAnular && (
                    <div className={styles.confirmDetail}>
                        <span>{cargoAAnular.RubDsc?.trim() || `Rubro ${cargoAAnular.Rubro}`}</span>
                        <span>{formatMonthYear(cargoAAnular.Mes)} · {formatCurrency(cargoAAnular.Importe)}</span>
                    </div>
                )}
            </ConfirmDialog>
        </>
    );
};

export default AnularCargoModal;
