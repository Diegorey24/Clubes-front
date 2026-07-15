import { useState } from 'react';
import { deleteItem } from '../../services/api';
import { TableActions, Badge, ConfirmDialog } from '../ui';
import styles from './MediosPagoTable.module.css';

const TIPO_BADGE_VARIANT = {
    Efectivo: 'success',
    Cheque: 'neutral',
    Tarjeta: 'primary',
    Proceso: 'neutral',
};

const MediosPagoTable = ({ mediosPago, onView, onEdit, onDeleted }) => {
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const requestDelete = (medio) => {
        setDeleteError('');
        setDeleteTarget(medio);
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
            await deleteItem('mediospago', deleteTarget.IdMedioPago);
            setDeleteTarget(null);
            onDeleted?.();
        } catch (err) {
            console.error('Error deleting medio de pago:', err);
            setDeleteError('No se pudo eliminar el medio de pago. Intentá nuevamente.');
        } finally {
            setDeleting(false);
        }
    };

    if (!mediosPago || mediosPago.length === 0) {
        return (
            <div className={styles.emptyState}>
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3M3.75 6h16.5a1.5 1.5 0 011.5 1.5v9a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5v-9a1.5 1.5 0 011.5-1.5z" />
                </svg>
                <p>No hay medios de pago para mostrar</p>
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
                        <th>Tipo</th>
                        <th className={styles.actionsHeader}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {mediosPago.map((medio) => (
                        <tr key={medio.IdMedioPago} onClick={() => onView(medio)} title="Ver detalle del medio de pago">
                            <td className={styles.muted}>{medio.IdMedioPago}</td>
                            <td className={styles.nameCell}>{medio.Descripcion?.trim()}</td>
                            <td>
                                <Badge variant={TIPO_BADGE_VARIANT[medio.Tipo] || 'neutral'}>
                                    {medio.Tipo || '-'}
                                </Badge>
                            </td>
                            <td className={styles.actionsCell}>
                                <TableActions
                                    onView={() => onView(medio)}
                                    onEdit={() => onEdit(medio)}
                                    onDelete={() => requestDelete(medio)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="¿Eliminar medio de pago?"
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
                            <span>Código {deleteTarget.IdMedioPago}</span>
                        </div>
                    </div>
                )}
                {deleteError && <p className={styles.confirmError}>{deleteError}</p>}
            </ConfirmDialog>
        </div>
    );
};

export default MediosPagoTable;
