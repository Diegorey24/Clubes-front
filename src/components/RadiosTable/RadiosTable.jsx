import { useState } from 'react';
import { deleteItem } from '../../services/api';
import { TableActions, ConfirmDialog } from '../ui';
import styles from './RadiosTable.module.css';

const RadiosTable = ({ radios, onView, onEdit, onDeleted }) => {
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const requestDelete = (radio) => {
        setDeleteError('');
        setDeleteTarget(radio);
    };

    const closeConfirm = () => {
        if (deleting) return;
        setDeleteTarget(null);
        setDeleteError('');
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        setDeleteError('');
        try {
            await deleteItem('radios', deleteTarget.IdRadio);
            setDeleteTarget(null);
            onDeleted?.();
        } catch (err) {
            console.error('Error deleting radio:', err);
            setDeleteError('No se pudo eliminar el radio. Intentá nuevamente.');
        } finally {
            setDeleting(false);
        }
    };

    if (!radios || radios.length === 0) {
        return (
            <div className={styles.emptyState}>
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 5.25h16.5M3.75 12h16.5M3.75 18.75h16.5" />
                </svg>
                <p>No hay radios para mostrar</p>
            </div>
        );
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th className={styles.actionsHeader}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {radios.map((radio) => (
                        <tr key={radio.IdRadio} onClick={() => onView(radio)} title="Ver detalle del radio">
                            <td className={styles.muted}>{radio.IdRadio}</td>
                            <td className={styles.nameCell}>{radio.Nombre?.trim()}</td>
                            <td className={styles.actionsCell}>
                                <TableActions
                                    onView={() => onView(radio)}
                                    onEdit={() => onEdit(radio)}
                                    onDelete={() => requestDelete(radio)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="¿Eliminar radio?"
                description="Esta acción no se puede deshacer."
                confirmLabel="Sí, eliminar"
                cancelLabel="Cancelar"
                variant="danger"
                loading={deleting}
                onConfirm={confirmDelete}
                onCancel={closeConfirm}
            >
                {deleteTarget && (
                    <div className={styles.confirmSummary}>
                        <div className={styles.confirmName}>{deleteTarget.Nombre?.trim()}</div>
                        <div className={styles.confirmMeta}>
                            <span>Código {deleteTarget.IdRadio}</span>
                        </div>
                    </div>
                )}
                {deleteError && <p className={styles.confirmError}>{deleteError}</p>}
            </ConfirmDialog>
        </div>
    );
};

export default RadiosTable;
