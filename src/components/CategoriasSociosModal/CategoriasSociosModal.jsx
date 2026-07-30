import { useState, useEffect } from 'react';
import { Button } from '../ui';
import styles from './CategoriasSociosModal.module.css';

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

const emptyForm = {
    CatCod: '',
    CatNom: '',
    CatAniIni: '',
    CatAniFin: '',
    CatPrc: 0,
    Importe3: 0,
    Importe4: 0,
    Importe5: 0,
    Importe6: 0,
    Importe7: 0,
    Activa: true,
};

// Columnas numéricas en la base (CatCod incluido: es numeric, no nvarchar).
// Los <input type="number"> igual entregan strings vía e.target.value, así
// que hay que castear todo antes de mandarlo al backend.
const NUMERIC_FIELDS = ['CatCod', 'CatAniIni', 'CatAniFin', 'CatPrc', 'Importe3', 'Importe4', 'Importe5', 'Importe6', 'Importe7'];

const toNumberOrNull = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
};

const CategoriasSociosModal = ({ isOpen, mode = 'edit', onClose, onSubmit, onRequestEdit, initialData }) => {
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
                CatCod: initialData.CatCod ?? '',
                CatNom: initialData.CatNom?.trim() || '',
                CatAniIni: initialData.CatAniIni || '',
                CatAniFin: initialData.CatAniFin || '',
                CatPrc: initialData.CatPrc || 0,
                Importe3: initialData.Importe3 || 0,
                Importe4: initialData.Importe4 || 0,
                Importe5: initialData.Importe5 || 0,
                Importe6: initialData.Importe6 || 0,
                Importe7: initialData.Importe7 || 0,
                Activa: initialData.Activa ?? true,
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
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.CatNom.trim()) {
            setFormError('El nombre es requerido');
            return;
        }
        if (formData.CatPrc === '' || formData.CatPrc === null || formData.CatPrc === undefined) {
            setFormError('El importe es requerido');
            return;
        }
        setFormError('');
        setSaving(true);
        try {
            const payload = { ...formData, GrpCatCod: 0 };
            // GrpCatCod no se usa ni se muestra en el formulario, pero la
            // columna en la base no admite NULL: se manda siempre en 0,
            // sin importar nada que haya quedado cargado en formData.
            NUMERIC_FIELDS.forEach((key) => {
                payload[key] = toNumberOrNull(formData[key]);
            });
            await onSubmit(payload);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={handleBackdropClick}>
            <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="categoria-modal-title">
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <span className={styles.iconWrap}>{TagIcon}</span>
                        <h3 id="categoria-modal-title" className={styles.title}>
                            {isView ? 'Ver Categoría' : initialData ? 'Editar Categoría' : 'Nueva Categoría'}
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
                                <label htmlFor="CatCod">Código</label>
                                <input
                                    type="number"
                                    id="CatCod"
                                    name="CatCod"
                                    className={styles.input}
                                    value={formData.CatCod}
                                    onChange={handleChange}
                                    disabled
                                />
                            </div>
                        )}

                        <div className={`${styles.formGroup} ${initialData ? styles.formGroupFull2 : styles.formGroupFull}`}>
                            <label htmlFor="CatNom">Nombre <span className={styles.required}>*</span></label>
                            <input
                                type="text"
                                id="CatNom"
                                name="CatNom"
                                className={styles.input}
                                value={formData.CatNom}
                                onChange={handleChange}
                                required
                                placeholder="Nombre de la categoría"
                                disabled={isView}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="CatAniIni">Edad Inicial</label>
                            <input
                                type="number"
                                id="CatAniIni"
                                name="CatAniIni"
                                className={styles.input}
                                value={formData.CatAniIni}
                                onChange={handleChange}
                                placeholder="Sin mínimo"
                                min="0"
                                disabled={isView}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="CatAniFin">Edad Final</label>
                            <input
                                type="number"
                                id="CatAniFin"
                                name="CatAniFin"
                                className={styles.input}
                                value={formData.CatAniFin}
                                onChange={handleChange}
                                placeholder="Sin máximo"
                                min="0"
                                disabled={isView}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="CatPrc">Importe <span className={styles.required}>*</span></label>
                            <input
                                type="number"
                                id="CatPrc"
                                name="CatPrc"
                                className={styles.input}
                                value={formData.CatPrc}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                required
                                disabled={isView}
                            />
                        </div>

                        <p className={styles.sectionLabel}>Importes adicionales</p>

                        <div className={styles.formGroup}>
                            <label htmlFor="Importe3">Importe 3</label>
                            <input type="number" id="Importe3" name="Importe3" className={styles.input} value={formData.Importe3} onChange={handleChange} placeholder="0.00" step="0.01" disabled={isView} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="Importe4">Importe 4</label>
                            <input type="number" id="Importe4" name="Importe4" className={styles.input} value={formData.Importe4} onChange={handleChange} placeholder="0.00" step="0.01" disabled={isView} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="Importe5">Importe 5</label>
                            <input type="number" id="Importe5" name="Importe5" className={styles.input} value={formData.Importe5} onChange={handleChange} placeholder="0.00" step="0.01" disabled={isView} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="Importe6">Importe 6</label>
                            <input type="number" id="Importe6" name="Importe6" className={styles.input} value={formData.Importe6} onChange={handleChange} placeholder="0.00" step="0.01" disabled={isView} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="Importe7">Importe 7</label>
                            <input type="number" id="Importe7" name="Importe7" className={styles.input} value={formData.Importe7} onChange={handleChange} placeholder="0.00" step="0.01" disabled={isView} />
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
                                            <label htmlFor="CatCod">Código</label>
                                            <input
                                                type="number"
                                                id="CatCod"
                                                name="CatCod"
                                                className={styles.input}
                                                value={formData.CatCod}
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

                        <label
                            className={`${styles.activaRow} ${styles.formGroupFull} ${isView ? styles.activaRowDisabled : ''}`}
                            htmlFor="Activa"
                        >
                            <span>
                                <span className={styles.activaTitle}>Categoría activa</span>
                                <span className={styles.activaHint}>Las categorías inactivas no aparecen para asignar a nuevos socios.</span>
                            </span>
                            <input
                                type="checkbox"
                                id="Activa"
                                name="Activa"
                                className={styles.checkbox}
                                checked={formData.Activa}
                                onChange={handleChange}
                                disabled={isView}
                            />
                        </label>
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
                                    {initialData ? 'Actualizar' : 'Crear'} Categoría
                                </Button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoriasSociosModal;
