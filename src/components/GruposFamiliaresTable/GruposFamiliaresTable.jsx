import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteGrupoFamiliar } from '../../services/api';
import { TableActions, ConfirmDialog } from '../ui';
import styles from './GruposFamiliaresTable.module.css';

const GruposFamiliaresTable = ({ grupos, onDeleted }) => {
    const navigate = useNavigate();
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const handleRowClick = (grupo) => {
        navigate(`/grupos-familiares/${grupo.TitularSocDocIde}`);
    };

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
            await deleteGrupoFamiliar(deleteTarget.TitularSocDocIde);
            setDeleteTarget(null);
            onDeleted?.();
        } catch (err) {
            console.error('Error disolviendo el grupo familiar:', err);
            setDeleteError('No se pudo disolver el grupo familiar. Intentá nuevamente.');
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
                        <th>Titular</th>
                        <th>Cédula</th>
                        <th>Integrantes</th>
                        <th className={styles.actionsHeader}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {grupos.map((grupo) => (
                        <tr key={grupo.GruFamNro} onClick={() => handleRowClick(grupo)} title="Ver detalle del grupo familiar">
                            <td className={styles.nameCell}>{grupo.TitularNombre?.trim?.() || grupo.TitularNombre}</td>
                            <td className={styles.muted}>{grupo.TitularSocDocIde}</td>
                            <td>{grupo.CantidadIntegrantes ?? '-'}</td>
                            <td className={styles.actionsCell}>
                                <TableActions
                                    onView={() => handleRowClick(grupo)}
                                    onDelete={() => requestDelete(grupo)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="¿Disolver grupo familiar?"
                description="El titular y todos los integrantes quedan desvinculados del grupo. Esta acción no se puede deshacer."
                confirmLabel="Sí, disolver"
                cancelLabel="Cancelar"
                variant="danger"
                loading={deleting}
                onConfirm={confirmDelete}
                onCancel={closeConfirm}
            >
                {deleteTarget && (
                    <div className={styles.confirmSummary}>
                        <div className={styles.confirmName}>{deleteTarget.TitularNombre?.trim?.() || deleteTarget.TitularNombre}</div>
                        <div className={styles.confirmMeta}>
                            <span>CI {deleteTarget.TitularSocDocIde}</span>
                            <span>·</span>
                            <span>{deleteTarget.CantidadIntegrantes ?? 0} integrante{deleteTarget.CantidadIntegrantes !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                )}
                {deleteError && <p className={styles.confirmError}>{deleteError}</p>}
            </ConfirmDialog>
        </div>
    );
};

export default GruposFamiliaresTable;
