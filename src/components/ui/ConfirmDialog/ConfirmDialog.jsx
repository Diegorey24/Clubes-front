import { useEffect } from 'react';
import Button from '../Button/Button';
import styles from './ConfirmDialog.module.css';

const WarningIcon = (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
);

/**
 * Modal de confirmación genérico. Pensado para reemplazar window.confirm/alert
 * en cualquier acción destructiva o sensible (eliminar, dar de baja, etc.).
 *
 * Ejemplo:
 *   <ConfirmDialog
 *     isOpen={!!target}
 *     title="¿Eliminar socio?"
 *     description="Esta acción moverá al socio al histórico."
 *     confirmLabel="Sí, eliminar"
 *     loading={deleting}
 *     onConfirm={handleConfirm}
 *     onCancel={() => setTarget(null)}
 *   >
 *     <div>{target?.nombre}</div>
 *   </ConfirmDialog>
 */
const ConfirmDialog = ({
    isOpen,
    title,
    description,
    children,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    variant = 'danger',
    loading = false,
    onConfirm,
    onCancel,
}) => {
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape' && !loading) onCancel?.();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, loading, onCancel]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !loading) onCancel?.();
    };

    return (
        <div className={styles.overlay} onClick={handleBackdropClick}>
            <div className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
                <div className={`${styles.iconWrap} ${styles[variant] || styles.danger}`}>
                    {WarningIcon}
                </div>
                <h3 id="confirm-dialog-title" className={styles.title}>{title}</h3>
                {description && <p className={styles.description}>{description}</p>}
                {children && <div className={styles.content}>{children}</div>}
                <div className={styles.actions}>
                    <Button variant="secondary" onClick={onCancel} disabled={loading}>
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        onClick={onConfirm}
                        loading={loading}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
