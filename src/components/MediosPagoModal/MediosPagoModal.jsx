import { useState, useEffect } from 'react';
import styles from './MediosPagoModal.module.css';

const MediosPagoModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        IdMedioPago: '',
        Descripcion: '',
        Tipo: '',
        Rubro: 0,
        RubroME: 0
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                IdMedioPago: initialData.IdMedioPago || '',
                Descripcion: initialData.Descripcion?.trim() || '',
                Tipo: initialData.Tipo || '',
                Rubro: initialData.Rubro || 0,
                RubroME: initialData.RubroME || 0
            });
        } else {
            setFormData({
                IdMedioPago: '',
                Descripcion: '',
                Tipo: '',
                Rubro: 0,
                RubroME: 0
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
        if (!formData.IdMedioPago) {
            alert('El ID es requerido');
            return;
        }
        if (!formData.Descripcion.trim()) {
            alert('La descripción es requerida');
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
                        {initialData ? 'Editar Medio de Pago' : 'Nuevo Medio de Pago'}
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
                            <label htmlFor="IdMedioPago">
                                ID <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="number"
                                id="IdMedioPago"
                                name="IdMedioPago"
                                value={formData.IdMedioPago}
                                onChange={handleChange}
                                required
                                placeholder="Ingrese el ID"
                                autoFocus
                                disabled={!!initialData}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="Descripcion">
                                Descripción <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                id="Descripcion"
                                name="Descripcion"
                                value={formData.Descripcion}
                                onChange={handleChange}
                                required
                                placeholder="Ingrese la descripción"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="Tipo">Tipo</label>
                            <input
                                type="text"
                                id="Tipo"
                                name="Tipo"
                                value={formData.Tipo}
                                onChange={handleChange}
                                placeholder="Tipo"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="Rubro">Rubro</label>
                            <input
                                type="number"
                                id="Rubro"
                                name="Rubro"
                                value={formData.Rubro}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="RubroME">Rubro ME</label>
                            <input
                                type="number"
                                id="RubroME"
                                name="RubroME"
                                value={formData.RubroME}
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
                            {initialData ? 'Actualizar' : 'Crear'} Medio de Pago
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MediosPagoModal;
