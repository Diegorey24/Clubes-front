import { useState, useEffect } from 'react';
import styles from './FormaPagoModal.module.css';

const FormaPagoModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        IdFormaPago: '',
        Nombre: '',
        FlagEmision: 0,
        FlagTodo: 0,
        Factor: 0,
        RubroContable: 0
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                IdFormaPago: initialData.IdFormaPago || '',
                Nombre: initialData.Nombre?.trim() || '',
                FlagEmision: initialData.FlagEmision || 0,
                FlagTodo: initialData.FlagTodo || 0,
                Factor: initialData.Factor || 0,
                RubroContable: initialData.RubroContable || 0
            });
        } else {
            setFormData({
                IdFormaPago: '',
                Nombre: '',
                FlagEmision: 0,
                FlagTodo: 0,
                Factor: 0,
                RubroContable: 0
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.IdFormaPago) {
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
                        {initialData ? 'Editar Forma de Pago' : 'Nueva Forma de Pago'}
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
                            <label htmlFor="IdFormaPago">
                                ID <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="number"
                                id="IdFormaPago"
                                name="IdFormaPago"
                                value={formData.IdFormaPago}
                                onChange={handleChange}
                                required
                                placeholder="Ingrese el ID"
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
                                placeholder="Ingrese el nombre"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="Factor">Factor</label>
                            <input
                                type="number"
                                id="Factor"
                                name="Factor"
                                value={formData.Factor}
                                onChange={handleChange}
                                placeholder="0"
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
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    name="FlagEmision"
                                    checked={formData.FlagEmision === 1}
                                    onChange={handleChange}
                                />
                                <span>Flag Emisión</span>
                            </label>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    name="FlagTodo"
                                    checked={formData.FlagTodo === 1}
                                    onChange={handleChange}
                                />
                                <span>Flag Todo</span>
                            </label>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button type="button" className={styles.btnCancel} onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.btnSubmit}>
                            {initialData ? 'Actualizar' : 'Crear'} Forma de Pago
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormaPagoModal;
