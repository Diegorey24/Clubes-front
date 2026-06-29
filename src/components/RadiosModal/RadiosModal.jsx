import { useState, useEffect } from 'react';
import styles from './RadiosModal.module.css';

const RadiosModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        IdRadio: '',
        Nombre: '',
        OrdenImpresion: 0,
        DescripcionContable: '',
        RubroContable: 0,
        Basket: 0
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                IdRadio: initialData.IdRadio || '',
                Nombre: initialData.Nombre?.trim() || '',
                OrdenImpresion: initialData.OrdenImpresion || 0,
                DescripcionContable: initialData.DescripcionContable || '',
                RubroContable: initialData.RubroContable || 0,
                Basket: initialData.Basket || 0
            });
        } else {
            setFormData({
                IdRadio: '',
                Nombre: '',
                OrdenImpresion: 0,
                DescripcionContable: '',
                RubroContable: 0,
                Basket: 0
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
        if (!formData.IdRadio) {
            alert('El ID es requerido');
            return;
        }
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
                        {initialData ? 'Editar Radio' : 'Nuevo Radio'}
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
                            <label htmlFor="IdRadio">
                                ID <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="number"
                                id="IdRadio"
                                name="IdRadio"
                                value={formData.IdRadio}
                                onChange={handleChange}
                                required
                                placeholder="Ingrese el ID del radio"
                                autoFocus
                                disabled={!!initialData}
                            />
                        </div>

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
                                placeholder="Ingrese el nombre del radio"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="OrdenImpresion">Orden Impresión</label>
                            <input
                                type="number"
                                id="OrdenImpresion"
                                name="OrdenImpresion"
                                value={formData.OrdenImpresion}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="DescripcionContable">Descripción Contable</label>
                            <input
                                type="text"
                                id="DescripcionContable"
                                name="DescripcionContable"
                                value={formData.DescripcionContable}
                                onChange={handleChange}
                                placeholder="Ingrese descripción contable"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="RubroContable">Rubro Contable</label>
                            <input
                                type="number"
                                id="RubroContable"
                                name="RubroContable"
                                value={formData.RubroContable}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="Basket">Basket</label>
                            <input
                                type="number"
                                id="Basket"
                                name="Basket"
                                value={formData.Basket}
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
                            {initialData ? 'Actualizar' : 'Crear'} Radio
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RadiosModal;
