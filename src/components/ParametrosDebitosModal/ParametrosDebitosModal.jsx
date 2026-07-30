import { useState, useEffect } from 'react';
import { Button } from '../ui';
import styles from './ParametrosDebitosModal.module.css';

const TagIcon = (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3M3.75 6h16.5a1.5 1.5 0 011.5 1.5v9a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5v-9a1.5 1.5 0 011.5-1.5z" />
    </svg>
);

const CloseIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const emptyForm = {
    CodComercio: '',
    Sucursal: '',
};

const ParametrosDebitosModal = ({ isOpen, mode = 'view', onClose, onSubmit, onRequestEdit, initialData }) => {
    const isView = mode === 'view';

    const [formData, setFormData] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setFormError('');
        if (initialData) {
            setFormData({
                CodComercio: initialData.CodComercio || '',
                Sucursal: initialData.Sucursal || '',
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

    if (!isOpen || !initialData) return null;

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
        setFormError('');
        setSaving(true);
        try {
            await onSubmit(formData);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={handleBackdropClick}>
            <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="parametrodebito-modal-title">
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <span className={styles.iconWrap}>{TagIcon}</span>
                        <h3 id="parametrodebito-modal-title" className={styles.title}>
                            {isView ? 'Ver Parámetro' : 'Editar Parámetro'}
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
                        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                            <label htmlFor="Nombre">Financiera</label>
                            <input
                                type="text"
                                id="Nombre"
                                className={styles.input}
                                value={initialData.Nombre}
                                disabled
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="CodComercio">Código de Comercio</label>
                            <input
                                type="text"
                                id="CodComercio"
                                name="CodComercio"
                                className={styles.input}
                                value={formData.CodComercio}
                                onChange={handleChange}
                                maxLength={8}
                                placeholder="Código de comercio"
                                disabled={isView}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="Sucursal">Sucursal</label>
                            <input
                                type="text"
                                id="Sucursal"
                                name="Sucursal"
                                className={styles.input}
                                value={formData.Sucursal}
                                onChange={handleChange}
                                maxLength={4}
                                placeholder="Sucursal"
                                disabled={isView}
                            />
                        </div>
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
                                    Actualizar Parámetro
                                </Button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ParametrosDebitosModal;
