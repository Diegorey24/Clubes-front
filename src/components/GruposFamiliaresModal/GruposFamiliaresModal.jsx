import { useState, useEffect } from 'react';
import { Button } from '../ui';
import styles from './GruposFamiliaresModal.module.css';

const FamilyIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM14.5 9a2 2 0 100-4 2 2 0 000 4zM2.5 16.5c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5a1 1 0 01-1 1H3.5a1 1 0 01-1-1zM12.5 12.35c1.762.372 3.05 1.98 3.05 3.9a1 1 0 01-.083.35H14.5a1 1 0 01-1-1c0-1.212-.395-2.33-1.062-3.24.02-.003.041-.007.062-.01z" />
    </svg>
);

const CloseIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const emptyForm = {
    GruFamTit: '',
    GruMasVie: '',
    GruCntInt: '',
};

// GruMasVie viene tal cual de la tabla gruposfamiliares y todavía no tiene
// validación propia ni significado confirmado en el backend (por el nombre,
// probablemente el socio de mayor edad del grupo). Se deja como texto libre
// hasta confirmar con la base; se termina de pulir más adelante.
const GruposFamiliaresModal = ({ isOpen, mode = 'edit', onClose, onSubmit, onRequestEdit, initialData }) => {
    const isView = mode === 'view';

    const [formData, setFormData] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setFormError('');
        if (initialData) {
            setFormData({
                GruFamTit: (typeof initialData.GruFamTit === 'string' ? initialData.GruFamTit.trim() : initialData.GruFamTit) || '',
                GruMasVie: initialData.GruMasVie ?? '',
                GruCntInt: initialData.GruCntInt ?? '',
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
        if (!formData.GruFamTit.trim()) {
            setFormError('El titular del grupo es requerido');
            return;
        }
        setFormError('');
        setSaving(true);
        try {
            const payload = {
                GruFamTit: formData.GruFamTit.trim(),
                GruMasVie: formData.GruMasVie === '' ? null : formData.GruMasVie,
                GruCntInt: formData.GruCntInt === '' ? null : Number(formData.GruCntInt),
            };
            await onSubmit(payload);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={handleBackdropClick}>
            <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="grupo-familiar-modal-title">
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <span className={styles.iconWrap}>{FamilyIcon}</span>
                        <h3 id="grupo-familiar-modal-title" className={styles.title}>
                            {isView ? 'Ver Grupo Familiar' : initialData ? 'Editar Grupo Familiar' : 'Nuevo Grupo Familiar'}
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
                                <label htmlFor="GruFamNro">Número</label>
                                <input
                                    type="text"
                                    id="GruFamNro"
                                    className={styles.input}
                                    value={initialData.GruFamNro}
                                    disabled
                                />
                            </div>
                        )}

                        <div className={`${styles.formGroup} ${initialData ? styles.formGroupFull2 : styles.formGroupFull}`}>
                            <label htmlFor="GruFamTit">Titular del grupo <span className={styles.required}>*</span></label>
                            <input
                                type="text"
                                id="GruFamTit"
                                name="GruFamTit"
                                className={styles.input}
                                value={formData.GruFamTit}
                                onChange={handleChange}
                                required
                                placeholder="Nombre del titular"
                                disabled={isView}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="GruCntInt">Cantidad de integrantes</label>
                            <input
                                type="number"
                                id="GruCntInt"
                                name="GruCntInt"
                                className={styles.input}
                                value={formData.GruCntInt}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                                disabled={isView}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="GruMasVie">GruMasVie</label>
                            <input
                                type="text"
                                id="GruMasVie"
                                name="GruMasVie"
                                className={styles.input}
                                value={formData.GruMasVie}
                                onChange={handleChange}
                                placeholder="A confirmar con la base"
                                disabled={isView}
                            />
                        </div>

                        {!initialData && (
                            <p className={styles.autoCodeHint}>
                                El número de grupo se asigna automáticamente al guardar.
                            </p>
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
                                    {initialData ? 'Actualizar' : 'Crear'} Grupo
                                </Button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GruposFamiliaresModal;
