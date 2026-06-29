import { useState, useEffect } from 'react';
import styles from './RubrosModal.module.css';

const RubrosModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        Nombre: '',
        RubTpo: '',
        Tipo: 'AMBOS',
        RubroContable: 0,
        RubroContable2: 0,
        Importe: 0,
        Recepcion: 0
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                Nombre: initialData.Nombre?.trim() || '',
                RubTpo: initialData.RubTpo || '',
                Tipo: initialData.Tipo || 'AMBOS',
                RubroContable: initialData.RubroContable || 0,
                RubroContable2: initialData.RubroContable2 || 0,
                Importe: initialData.Importe || 0,
                Recepcion: initialData.Recepcion || 0
            });
        } else {
            setFormData({
                Nombre: '',
                RubTpo: '',
                Tipo: 'AMBOS',
                RubroContable: 0,
                RubroContable2: 0,
                Importe: 0,
                Recepcion: 0
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.Nombre.trim()) {
            alert('El nombre es requerido');
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
                        {initialData ? 'Editar Rubro' : 'Nuevo Rubro'}
                    </h3>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label htmlFor="Nombre">
                                Nombre <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                id="Nombre"
                                name="Nombre"
                                value={formData.Nombre}
                                onChange={handleChange}
                                required
                                placeholder="Ingrese el nombre del rubro"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="Tipo">Tipo</label>
                            <select
                                id="Tipo"
                                name="Tipo"
                                value={formData.Tipo}
                                onChange={handleChange}
                            >
                                <option value="AMBOS">AMBOS</option>
                                <option value="INGRESO">INGRESO</option>
                                <option value="EGRESO">EGRESO</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="RubTpo">RubTpo</label>
                            <input
                                type="text"
                                id="RubTpo"
                                name="RubTpo"
                                value={formData.RubTpo}
                                onChange={handleChange}
                                maxLength={2}
                                placeholder="Ej: S, I, E"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="RubroContable">Rubro Contable</label>
                            <input
                                type="text"
                                id="RubroContable"
                                name="RubroContable"
                                value={formData.RubroContable}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="RubroContable2">Rubro Contable 2</label>
                            <input
                                type="text"
                                id="RubroContable2"
                                name="RubroContable2"
                                value={formData.RubroContable2}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="Importe">Importe</label>
                            <input
                                type="text"
                                id="Importe"
                                name="Importe"
                                value={formData.Importe}
                                onChange={handleChange}
                                placeholder="0.00"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="Recepcion">Recepción</label>
                            <input
                                type="text"
                                id="Recepcion"
                                name="Recepcion"
                                value={formData.Recepcion}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button type="button" className={styles.btnCancel} onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.btnSubmit}>
                            {initialData ? 'Actualizar' : 'Crear'} Rubro
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RubrosModal;
