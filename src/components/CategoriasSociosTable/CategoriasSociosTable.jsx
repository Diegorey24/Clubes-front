import { useState } from 'react';
import { deleteItem } from '../../services/api';
import { TableActions, Badge, ConfirmDialog } from '../ui';
import styles from './CategoriasSociosTable.module.css';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(value || 0);
};

const CategoriasSociosTable = ({ categorias, onView, onEdit, onDeleted }) => {
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const requestDelete = (categoria) => {
        setDeleteError('');
        setDeleteTarget(categoria);
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
            await deleteItem('categoriaSocios', deleteTarget.CatCod);
            setDeleteTarget(null);
            onDeleted?.();
        } catch (err) {
            console.error('Error deleting categoria:', err);
            setDeleteError('No se pudo eliminar la categoría. Intentá nuevamente.');
        } finally {
            setDeleting(false);
        }
    };

    if (!categorias || categorias.length === 0) {
        return (
            <div className={styles.emptyState}>
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 6h.008v.008H6V6z" />
                </svg>
                <p>No hay categorías para mostrar</p>
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
                        <th>Estado</th>
                        <th className={styles.actionsHeader}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {categorias.map((cat) => (
                        <tr key={cat.CatCod} onClick={() => onView(cat)} title="Ver detalle de la categoría">
                            <td className={styles.muted}>{cat.CatCod}</td>
                            <td className={styles.nameCell}>{cat.CatNom?.trim()}</td>
                            <td className={styles.amount}>{formatCurrency(cat.CatPrc)}</td>
                            <td>
                                <Badge variant={cat.Activa ? 'success' : 'danger'}>
                                    {cat.Activa ? 'Activa' : 'Inactiva'}
                                </Badge>
                            </td>
                            <td className={styles.actionsCell}>
                                <TableActions
                                    onView={() => onView(cat)}
                                    onEdit={() => onEdit(cat)}
                                    onDelete={() => requestDelete(cat)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="¿Eliminar categoría?"
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
                        <div className={styles.confirmName}>{deleteTarget.CatNom?.trim()}</div>
                        <div className={styles.confirmMeta}>
                            <span>Código {deleteTarget.CatCod}</span>
                        </div>
                    </div>
                )}
                {deleteError && <p className={styles.confirmError}>{deleteError}</p>}
            </ConfirmDialog>
        </div>
    );
};

export default CategoriasSociosTable;
