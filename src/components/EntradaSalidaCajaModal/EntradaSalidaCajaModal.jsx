import { useState, useEffect } from 'react';
import { crearEntradaCaja, crearSalidaCaja, crearCobranzaEspecial } from '../../services/api';
import { Button } from '../ui';
import styles from './EntradaSalidaCajaModal.module.css';

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

const CloseIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const TIPO_CONFIG = {
    'Entrada Caja': { titulo: 'Entrada de Caja', accion: crearEntradaCaja, icon: EntradaIcon, tono: 'success' },
    'Salida Caja': { titulo: 'Salida de Caja', accion: crearSalidaCaja, icon: SalidaIcon, tono: 'warning' },
    'Cobranza Especial': { titulo: 'Cobranza Especial', accion: crearCobranzaEspecial, icon: CobranzaIcon, tono: 'primary' },
};

const EntradaSalidaCajaModal = ({ isOpen, tipo, onClose, onSuccess, caja, usuario, showToast }) => {
    const [monto, setMonto] = useState('');
    const [detalle, setDetalle] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setMonto('');
            setDetalle('');
        }
    }, [isOpen, tipo]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape' && !saving) onClose?.();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, saving]);

    if (!isOpen) return null;

    const { titulo, accion, icon, tono } = TIPO_CONFIG[tipo] || {};

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !saving) onClose?.();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const montoNum = parseFloat(monto);
        if (!montoNum || montoNum <= 0) {
            showToast('Ingrese un monto válido', 'error');
            return;
        }
        if (!detalle.trim()) {
            showToast('Ingrese un detalle', 'error');
            return;
        }

        setSaving(true);
        try {
            await accion({ caja, usuario, monto: montoNum, detalle: detalle.trim() });
            showToast(`${titulo} registrada correctamente`, 'success');
            onSuccess();
        } catch (err) {
            showToast(err.response?.data?.error || `Error al registrar ${titulo.toLowerCase()}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={handleBackdropClick}>
            <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="entrada-salida-title">
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <span className={`${styles.iconWrap} ${styles[tono] || styles.primary}`}>{icon}</span>
                        <h3 id="entrada-salida-title" className={styles.title}>{titulo}</h3>
                    </div>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Cerrar"
                    >
                        {CloseIcon}
                    </button>
                </div>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="monto">Monto</label>
                        <input
                            type="number"
                            id="monto"
                            className={styles.input}
                            value={monto}
                            onChange={(e) => setMonto(e.target.value)}
                            min="0"
                            step="0.01"
                            required
                            autoFocus
                            placeholder="0.00"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="detalle">Detalle</label>
                        <input
                            type="text"
                            id="detalle"
                            className={styles.input}
                            value={detalle}
                            onChange={(e) => setDetalle(e.target.value)}
                            required
                            placeholder="Motivo del movimiento"
                        />
                    </div>
                    <div className={styles.actions}>
                        <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" loading={saving}>
                            Registrar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EntradaSalidaCajaModal;
