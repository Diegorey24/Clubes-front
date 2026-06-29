import styles from './ResponsableModal.module.css';

const ResponsableModal = ({ isOpen, onClose, socio }) => {
    if (!isOpen || !socio) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Datos del Responsable</h3>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div className={styles.body}>
                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <span className={styles.label}>Nombre</span>
                            <span className={styles.value}>{socio.ResponsableNombre || '-'}</span>
                        </div>
                        <div className={styles.field}>
                            <span className={styles.label}>Apellido</span>
                            <span className={styles.value}>{socio.ResponsableApellido || '-'}</span>
                        </div>
                        <div className={styles.field}>
                            <span className={styles.label}>Cédula de Identidad</span>
                            <span className={styles.value}>{socio.ResponsableCI || '-'}</span>
                        </div>
                        <div className={styles.field}>
                            <span className={styles.label}>Presentó DJ</span>
                            <span className={styles.value}>{socio.ResponsablePresentoDJ ? 'Sí' : 'No'}</span>
                        </div>
                        <div className={styles.field}>
                            <span className={styles.label}>Domicilio</span>
                            <span className={styles.value}>{socio.ResponsableDomicilio || '-'}</span>
                        </div>
                        <div className={styles.field}>
                            <span className={styles.label}>N° Puerta</span>
                            <span className={styles.value}>{socio.ResponsableDomicilioNroPuerta || '-'}</span>
                        </div>
                        <div className={styles.field}>
                            <span className={styles.label}>Apto</span>
                            <span className={styles.value}>{socio.ResponsableDomicilioApto || '-'}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.btnClose} onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResponsableModal;
