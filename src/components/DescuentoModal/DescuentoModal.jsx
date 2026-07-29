import { useState, useEffect } from 'react';
import { createDescuento, updateDescuento } from '../../services/api';
import { Button } from '../ui';
import styles from './DescuentoModal.module.css';

const PercentIcon = (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M8 7a1 1 0 11-2 0 1 1 0 012 0zm10 10a1 1 0 11-2 0 1 1 0 012 0z" />
    </svg>
);

const CloseIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// Trim seguro para campos char fijo que a veces llegan rellenados con
// espacios en blanco.
const trim = (value) => (value || '').toString().trim();

// Alta/edición del descuento de un socio (Ci, Porcentaje -- un solo
// registro por CI). Si "descuentoActual" es null/undefined se hace un
// POST (alta); si ya tiene un valor cargado se hace un PUT (modificación).
const DescuentoModal = ({ isOpen, onClose, onSuccess, socio, descuentoActual, showToast }) => {
    const esEdicion = descuentoActual !== null && descuentoActual !== undefined;

    const [porcentaje, setPorcentaje] = useState('');
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setPorcentaje(esEdicion ? String(descuentoActual) : '');
        setFormError('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape' && !saving) onClose?.();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, saving, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !saving) onClose?.();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const valor = Number(porcentaje);
        if (porcentaje === '' || Number.isNaN(valor) || valor < 0 || valor > 100) {
            setFormError('Ingresá un porcentaje válido, entre 0 y 100');
            return;
        }
        setFormError('');
        setSaving(true);
        try {
            if (esEdicion) {
                await updateDescuento(socio.SocDocIde, valor);
                showToast?.('Descuento actualizado exitosamente', 'success');
            } else {
                await createDescuento(socio.SocDocIde, valor);
                showToast?.('Descuento agregado exitosamente', 'success');
            }
            onSuccess?.();
            onClose?.();
        } catch (err) {
            console.error('Error guardando el descuento:', err);
            const mensaje = err.response?.status === 409
                ? 'Ya existe un descuento cargado para este socio'
                : (err.response?.data?.error || 'Error al guardar el descuento');
            showToast?.(mensaje, 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={handleBackdropClick}>
            <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="descuento-title">
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <span className={styles.iconWrap}>{PercentIcon}</span>
                        <h3 id="descuento-title" className={styles.title}>
                            {esEdicion ? 'Editar Descuento' : 'Agregar Descuento'}
                        </h3>
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
                    <div className={styles.socioBox}>
                        <span className={styles.socioBoxLabel}>Socio</span>
                        <span className={styles.socioNombre}>
                            {[socio?.PrimerNombre, socio?.SegundoNombre, socio?.PrimerApellido, socio?.SegundoApellido]
                                .map(trim)
                                .filter(Boolean)
                                .join(' ')}
                        </span>
                        <span className={styles.socioMeta}>
                            Socio N.° {socio?.SocNro} · CI {socio?.SocDocIde}
                        </span>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="porcentaje">Porcentaje de descuento <span className={styles.required}>*</span></label>
                        <div className={styles.percentField}>
                            <input
                                type="number"
                                id="porcentaje"
                                className={styles.input}
                                value={porcentaje}
                                onChange={(e) => setPorcentaje(e.target.value)}
                                step="0.01"
                                min="0"
                                max="100"
                                placeholder="0.00"
                                required
                                disabled={saving}
                                autoFocus
                            />
                            <span className={styles.percentSign}>%</span>
                        </div>
                    </div>

                    {formError && <p className={styles.formError}>{formError}</p>}

                    <div className={styles.actions}>
                        <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" loading={saving}>
                            {esEdicion ? 'Guardar Cambios' : 'Agregar Descuento'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DescuentoModal;
