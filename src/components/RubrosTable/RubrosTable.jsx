import { useState } from 'react';
import { deleteItem } from '../../services/api';
import { TableActions, ConfirmDialog } from '../ui';
import styles from './RubrosTable.module.css';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(value || 0);
};

const RubrosTable = ({ rubros, onView, onEdit, onDeleted }) => {
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const requestDelete = (rubro) => {
        setDeleteError('');
        setDeleteTarget(rubro);
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
            await deleteItem('rubros', deleteTarget.IdRubro);
            setDeleteTarget(null);
            onDeleted?.();
        } catch (err) {
            console.error('Error deleting rubro:', err);
            setDeleteError('No se pudo eliminar el rubro. Intentá nuevamente.');
        } finally {
            setDeleting(false);
        }
    };

    if (!rubros || rubros.length === 0) {
        return (
            <div className={styles.emptyState}>
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4z" />
                </svg>
                <p>No hay rubros para mostrar</p>
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
                        <th>Importe</th>
                        <th className={styles.actionsHeader}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {rubros.map((rubro) => (
                        <tr key={rubro.IdRubro} onClick={() => onView(rubro)} title="Ver detalle del rubro">
                            <td className={styles.muted}>{rubro.IdRubro}</td>
                            <td className={styles.nameCell}>{rubro.Nombre?.trim()}</td>
                            <td className={styles.amount}>{formatCurrency(rubro.Importe)}</td>
                            <td className={styles.actionsCell}>
                                <TableActions
                                    onView={() => onView(rubro)}
                                    onEdit={() => onEdit(rubro)}
                                    onDelete={() => requestDelete(rubro)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="¿Eliminar rubro?"
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
                            <span>Código {deleteTarget.IdRubro}</span>
                        </div>
                    </div>
                )}
                {deleteError && <p className={styles.confirmError}>{deleteError}</p>}
            </ConfirmDialog>
        </div>
    );
};

export default RubrosTable;
