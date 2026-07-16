import { useState } from 'react';
import { deleteItem } from '../../services/api';
import { TableActions, ConfirmDialog } from '../ui';
import styles from './GruposFamiliaresTable.module.css';

const GruposFamiliaresTable = ({ grupos, onView, onEdit, onDeleted }) => {
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const requestDelete = (grupo) => {
        setDeleteError('');
        setDeleteTarget(grupo);
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
            await deleteItem('grupos-familiares', deleteTarget.GruFamNro);
            setDeleteTarget(null);
            onDeleted?.();
        } catch (err) {
            console.error('Error deleting grupo familiar:', err);
            setDeleteError('No se pudo eliminar el grupo familiar. Intentá nuevamente.');
        } finally {
            setDeleting(false);
        }
    };

    if (!grupos || grupos.length === 0) {
        return (
            <div className={styles.emptyState}>
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4" />
                </svg>
                <p>No hay grupos familiares para mostrar</p>
            </div>
        );
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Número</th>
                        <th>Titular</th>
                        <th>Integrantes</th>
                        <th className={styles.actionsHeader}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {grupos.map((grupo) => (
                        <tr key={grupo.GruFamNro} onClick={() => onView(grupo)} title="Ver detalle del grupo familiar">
                            <td className={styles.muted}>{grupo.GruFamNro}</td>
                            <td className={styles.nameCell}>{grupo.GruFamTit?.trim?.() || grupo.GruFamTit}</td>
                            <td>{grupo.GruCntInt ?? '-'}</td>
                            <td className={styles.actionsCell}>
                                <TableActions
                                    onView={() => onView(grupo)}
                                    onEdit={() => onEdit(grupo)}
                                    onDelete={() => requestDelete(grupo)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="¿Eliminar grupo familiar?"
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
                        <div className={styles.confirmName}>{deleteTarget.GruFamTit?.trim?.() || deleteTarget.GruFamTit}</div>
                        <div className={styles.confirmMeta}>
                            <span>Número {deleteTarget.GruFamNro}</span>
                        </div>
                    </div>
                )}
                {deleteError && <p className={styles.confirmError}>{deleteError}</p>}
            </ConfirmDialog>
        </div>
    );
};

export default GruposFamiliaresTable;
