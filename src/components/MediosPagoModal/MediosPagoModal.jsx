import { useState, useEffect } from 'react';
import { Button } from '../ui';
import styles from './MediosPagoModal.module.css';

const TagIcon = (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6h.008v.008H6V6z" />
    </svg>
);

const CloseIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ChevronIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const TIPO_OPTIONS = ['Efectivo', 'Cheque', 'Tarjeta', 'Proceso'];

const emptyForm = {
    IdMedioPago: '',
    Descripcion: '',
    Tipo: 'Efectivo',
};

const MediosPagoModal = ({ isOpen, mode = 'edit', onClose, onSubmit, onRequestEdit, initialData }) => {
    const isView = mode === 'view';

    const [formData, setFormData] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setFormError('');
        setShowAdvanced(false);
        if (initialData) {
            setFormData({
                IdMedioPago: initialData.IdMedioPago ?? '',
                Descripcion: initialData.Descripcion?.trim() || '',
                Tipo: initialData.Tipo || 'Efectivo',
            });
        } else {
            setFormData(emptyForm);
        }
    }, [initialData, isOpen]);

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

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !saving) onClose?.();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.Descripcion.trim()) {
            setFormError('La descripción es requerida');
            return;
        }
        setFormError('');
        setSaving(true);
        try {
            const payload = { ...formData };
            payload.IdMedioPago = formData.IdMedioPago === '' ? null : Number(formData.IdMedioPago);
            await onSubmit(payload);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={handleBackdropClick}>
            <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="mediopago-modal-title">
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <span className={styles.iconWrap}>{TagIcon}</span>
                        <h3 id="mediopago-modal-title" className={styles.title}>
                            {isView ? 'Ver Medio de Pago' : initialData ? 'Editar Medio de Pago' : 'Nuevo Medio de Pago'}
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
                    <div className={styles.formGrid}>
                        {initialData && (
                            <div className={styles.formGroup}>
                                <label htmlFor="IdMedioPago">Código</label>
                                <input
                                    type="number"
                                    id="IdMedioPago"
                                    className={styles.input}
                                    value={formData.IdMedioPago}
                                    disabled
                                />
                            </div>
                        )}

                        <div className={`${styles.formGroup} ${initialData ? '' : styles.formGroupFull}`}>
                            <label htmlFor="Descripcion">Descripción <span className={styles.required}>*</span></label>
                            <input
                                type="text"
                                id="Descripcion"
                                name="Descripcion"
                                className={styles.input}
                                value={formData.Descripcion}
                                onChange={handleChange}
                                required
                                placeholder="Descripción del medio de pago"
                                disabled={isView}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="Tipo">Tipo</label>
                            <select
                                id="Tipo"
                                name="Tipo"
                                className={styles.input}
                                value={formData.Tipo}
                                onChange={handleChange}
                                disabled={isView}
                            >
                                {TIPO_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        {!initialData && (
                            <div className={styles.formGroupFull}>
                                <button
                                    type="button"
                                    className={styles.advancedToggle}
                                    onClick={() => setShowAdvanced((v) => !v)}
                                    aria-expanded={showAdvanced}
                                >
                                    <span className={`${styles.chevron} ${showAdvanced ? styles.chevronOpen : ''}`}>
                                        {ChevronIcon}
                                    </span>
                                    {showAdvanced ? 'Ocultar' : 'Mostrar'} opciones avanzadas
                                </button>

                                {showAdvanced && (
                                    <div className={styles.advancedBox}>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="IdMedioPago">Código</label>
                                            <input
                                                type="number"
                                                id="IdMedioPago"
                                                name="IdMedioPago"
                                                className={styles.input}
                                                value={formData.IdMedioPago}
                                                onChange={handleChange}
                                                placeholder="Automático"
                                            />
                                        </div>
                                        <p className={styles.advancedHint}>
                                            Si lo dejás vacío, el sistema asigna automáticamente el próximo código disponible.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {formError && <p className={styles.formError}>{formError}</p>}

                    <div className={styles.actions}>
                        {isView ? (
                            <>
                                <Button type="button" variant="secondary" onClick={onClose}>
                                    Cerrar
                                </Button>
                                <Button type="button" variant="primary" onClick={onRequestEdit}>
                                    Editar
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
                                    Cancelar
                                </Button>
                                <Button type="submit" variant="primary" loading={saving}>
                                    {initialData ? 'Actualizar' : 'Crear'} Medio de Pago
                                </Button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MediosPagoModal;
