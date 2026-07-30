import { useState } from 'react';
import { deleteParametroDebito } from '../../services/api';
import { TableActions, ConfirmDialog } from '../ui';
import styles from './ParametrosDebitosTable.module.css';

const ParametrosDebitosTable = ({ parametros, onView, onEdit, onDeleted }) => {
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const requestDelete = (parametro) => {
        setDeleteError('');
        setDeleteTarget(parametro);
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
            await deleteParametroDebito(deleteTarget.Nombre);
            setDeleteTarget(null);
            onDeleted?.();
        } catch (err) {
            console.error('Error deleting parámetro de débito:', err);
            setDeleteError('No se pudo eliminar el parámetro. Intentá nuevamente.');
        } finally {
            setDeleting(false);
        }
    };

    if (!parametros || parametros.length === 0) {
        return (
            <div className={styles.emptyState}>
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3M3.75 6h16.5a1.5 1.5 0 011.5 1.5v9a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5v-9a1.5 1.5 0 011.5-1.5z" />
                </svg>
                <p>No hay parámetros de débitos para mostrar</p>
            </div>
        );
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Financiera</th>
                        <th>Código de Comercio</th>
                        <th>Sucursal</th>
                        <th className={styles.actionsHeader}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {parametros.map((p) => (
                        <tr key={p.Nombre} onClick={() => onView(p)} title="Ver detalle del parámetro">
                            <td className={styles.nameCell}>{p.Nombre}</td>
                            <td className={styles.muted}>{p.CodComercio || '-'}</td>
                            <td className={styles.muted}>{p.Sucursal || '-'}</td>
                            <td className={styles.actionsCell}>
                                <TableActions
                                    onView={() => onView(p)}
                                    onEdit={() => onEdit(p)}
                                    onDelete={() => requestDelete(p)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="¿Eliminar parámetro?"
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
                        <div className={styles.confirmName}>{deleteTarget.Nombre}</div>
                        <div className={styles.confirmMeta}>
                            <span>Código de comercio {deleteTarget.CodComercio || '-'}</span>
                        </div>
                    </div>
                )}
                {deleteError && <p className={styles.confirmError}>{deleteError}</p>}
            </ConfirmDialog>
        </div>
    );
};

export default ParametrosDebitosTable;
