import { useState, useEffect } from 'react';
import styles from './GruposFamiliaresModal.module.css';

const GruposFamiliaresModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const defaultForm = { GruFamTit: '', GruMasVie: '', GruCntInt: '' };

    const [formData, setFormData] = useState(defaultForm);

    useEffect(() => {
        if (initialData) {
            setFormData({
                GruFamTit: initialData.GruFamTit?.trim() || '',
                GruMasVie: initialData.GruMasVie ?? '',
                GruCntInt: initialData.GruCntInt ?? '',
            });
        } else {
            setFormData(defaultForm);
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.GruFamTit.trim()) {
            alert('El título es requerido');
            return;
        }
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3 className={styles.title}>
                        {initialData ? 'Editar Grupo Familiar' : 'Nuevo Grupo Familiar'}
                    </h3>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGrid}>
                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label htmlFor="GruFamTit">
                                Título <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                id="GruFamTit"
                                name="GruFamTit"
                                value={formData.GruFamTit}
                                onChange={handleChange}
                                required
                                placeholder="Ingrese el título del grupo familiar"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="GruMasVie">Mas Vie</label>
                            <input
                                type="text"
                                id="GruMasVie"
                                name="GruMasVie"
                                value={formData.GruMasVie}
                                onChange={handleChange}
                                placeholder="Ingrese valor"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="GruCntInt">Cant. Integrantes</label>
                            <input
                                type="number"
                                id="GruCntInt"
                                name="GruCntInt"
                                value={formData.GruCntInt}
                                onChange={handleChange}
                                min="0"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button type="button" className={styles.btnCancel} onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.btnSubmit}>
                            {initialData ? 'Actualizar' : 'Crear'} Grupo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GruposFamiliaresModal;
