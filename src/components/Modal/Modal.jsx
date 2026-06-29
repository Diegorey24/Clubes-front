import { useState, useEffect } from 'react';
import styles from './Modal.module.css';

const Modal = ({ isOpen, onClose, onSubmit, title, initialValue = '' }) => {
    const [nombre, setNombre] = useState(initialValue);

    useEffect(() => {
        setNombre(initialValue);
    }, [initialValue, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (nombre.trim()) {
            onSubmit(nombre);
            setNombre('');
        }
    };

    const handleClose = () => {
        setNombre('');
        onClose();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`${styles.modal} ${isOpen ? styles.active : ''}`} onClick={handleBackdropClick}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>{title}</h3>
                    <button className={styles.modalClose} onClick={handleClose}>
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="nombre-input">Nombre</label>
                        <input
                            type="text"
                            id="nombre-input"
                            className={styles.formInput}
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                            placeholder="Ingrese el nombre"
                            autoFocus
                        />
                    </div>
                    <div className={styles.modalActions}>
                        <button type="button" className="btn-secondary" onClick={handleClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Modal;
