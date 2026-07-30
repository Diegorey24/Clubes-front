import { useState } from 'react';
import { deleteItem } from '../../services/api';
import { TableActions, ConfirmDialog } from '../ui';
import styles from './FormaPagoTable.module.css';

const FormaPagoTable = ({ formasPago, onView, onEdit, onDeleted }) => {
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const requestDelete = (forma) => {
        setDeleteError('');
        setDeleteTarget(forma);
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
            await deleteItem('formapago', deleteTarget.IdFormaPago);
            setDeleteTarget(null);
            onDeleted?.();
        } catch (err) {
            console.error('Error deleting forma de pago:', err);
            setDeleteError('No se pudo eliminar la forma de pago. Intentá nuevamente.');
        } finally {
            setDeleting(false);
        }
    };

    if (!formasPago || formasPago.length === 0) {
        return (
            <div className={styles.emptyState}>
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3M3.75 6h16.5a1.5 1.5 0 011.5 1.5v9a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5v-9a1.5 1.5 0 011.5-1.5z" />
                </svg>
                <p>No hay formas de pago para mostrar</p>
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
                    {formasPago.map((forma) => (
                        <tr key={forma.IdFormaPago} onClick={() => onView(forma)} title="Ver detalle de la forma de pago">
                            <td className={styles.muted}>{forma.IdFormaPago}</td>
                            <td className={styles.nameCell}>{forma.Nombre?.trim()}</td>
                            <td className={styles.actionsCell}>
                                <TableActions
                                    onView={() => onView(forma)}
                                    onEdit={() => onEdit(forma)}
                                    onDelete={() => requestDelete(forma)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="¿Eliminar forma de pago?"
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
                            <span>Código {deleteTarget.IdFormaPago}</span>
                        </div>
                    </div>
                )}
                {deleteError && <p className={styles.confirmError}>{deleteError}</p>}
            </ConfirmDialog>
        </div>
    );
};

export default FormaPagoTable;
