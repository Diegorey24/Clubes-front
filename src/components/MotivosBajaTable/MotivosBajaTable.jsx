import { useState } from 'react';
import { deleteItem } from '../../services/api';
import { TableActions, ConfirmDialog } from '../ui';
import styles from './MotivosBajaTable.module.css';

const MotivosBajaTable = ({ motivos, onView, onEdit, onDeleted }) => {
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const requestDelete = (motivo) => {
        setDeleteError('');
        setDeleteTarget(motivo);
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
            await deleteItem('motivos-baja', deleteTarget.Id);
            setDeleteTarget(null);
            onDeleted?.();
        } catch (err) {
            console.error('Error deleting motivo de baja:', err);
            setDeleteError('No se pudo eliminar el motivo de baja. Intentá nuevamente.');
        } finally {
            setDeleting(false);
        }
    };

    if (!motivos || motivos.length === 0) {
        return (
            <div className={styles.emptyState}>
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4z" />
                </svg>
                <p>No hay motivos de baja para mostrar</p>
            </div>
        );
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Descripción</th>
                        <th className={styles.actionsHeader}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {motivos.map((motivo) => (
                        <tr key={motivo.Id} onClick={() => onView(motivo)} title="Ver detalle del motivo de baja">
                            <td className={styles.muted}>{motivo.Id}</td>
                            <td className={styles.nameCell}>{motivo.Descripcion?.trim()}</td>
                            <td className={styles.actionsCell}>
                                <TableActions
                                    onView={() => onView(motivo)}
                                    onEdit={() => onEdit(motivo)}
                                    onDelete={() => requestDelete(motivo)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="¿Eliminar motivo de baja?"
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
                        <div className={styles.confirmName}>{deleteTarget.Descripcion?.trim()}</div>
                        <div className={styles.confirmMeta}>
                            <span>Código {deleteTarget.Id}</span>
                        </div>
                    </div>
                )}
                {deleteError && <p className={styles.confirmError}>{deleteError}</p>}
            </ConfirmDialog>
        </div>
    );
};

export default MotivosBajaTable;
