import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteSocio, fetchItems } from '../../services/api';
import { TableActions, Badge, ConfirmDialog } from '../ui';
import styles from './SociosTable.module.css';

const SociosTable = ({ socios, onSocioDeleted, readOnly = false, detailPath = '/socios' }) => {
    const navigate = useNavigate();
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [motivos, setMotivos] = useState([]);
    const [motivoBaja, setMotivoBaja] = useState('');

    useEffect(() => {
        const loadMotivos = async () => {
            try {
                const data = await fetchItems('motivos-baja');
                setMotivos(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error loading motivos de baja:', error);
            }
        };
        loadMotivos();
    }, []);

    const handleRowClick = (id) => {
        navigate(`${detailPath}/${id}`);
    };

    const requestDelete = (socio) => {
        setDeleteError('');
        setMotivoBaja('');
        setDeleteTarget(socio);
    };

    const closeConfirm = () => {
        if (deleting) return;
        setDeleteTarget(null);
        setDeleteError('');
        setMotivoBaja('');
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        if (!motivoBaja) {
            setDeleteError('Seleccioná el motivo de la baja para continuar.');
            return;
        }
        const motivoSeleccionado = motivos.find((m) => String(m.Id) === String(motivoBaja));
        const motivoTexto = motivoSeleccionado?.Descripcion?.trim();
        if (!motivoTexto) {
            setDeleteError('Seleccioná el motivo de la baja para continuar.');
            return;
        }
        setDeleting(true);
        setDeleteError('');
        try {
            await deleteSocio(deleteTarget.SocNro, motivoTexto);
            setDeleteTarget(null);
            setMotivoBaja('');
            if (onSocioDeleted) onSocioDeleted();
        } catch (error) {
            console.error('Error deleting socio:', error);
            setDeleteError('No se pudo dar de baja al socio. Intentá nuevamente.');
        } finally {
            setDeleting(false);
        }
    };

    if (!socios || socios.length === 0) {
        return (
            <div className={styles.tableContainer}>
                <div className={styles.emptyState}>
                    <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p>No hay socios registrados</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>N° Socio</th>
                        <th>Cédula</th>
                        <th>Nombre Completo</th>
                        <th>Categoría</th>
                        <th>Radio</th>
                        {!readOnly && <th className={styles.actionsHeader}>Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {socios.map((socio) => (
                        <tr
                            key={socio.SocNro}
                            onClick={() => handleRowClick(socio.SocNro)}
                            title="Ver detalles del socio"
                        >
                            <td className={styles.muted}>{socio.SocNro}</td>
                            <td>{socio.SocDocIde}</td>
                            <td className={styles.nameCell}>{socio.PrimerNombre} {socio.PrimerApellido}</td>
                            <td>
                                {socio.CategoriaNombre
                                    ? <Badge variant="primary">{socio.CategoriaNombre}</Badge>
                                    : <span className={styles.muted}>-</span>}
                            </td>
                            <td className={styles.muted}>{socio.RadioNombre || '-'}</td>
                            {!readOnly && (
                                <td className={styles.actionsCell}>
                                    <TableActions
                                        onView={() => navigate(`${detailPath}/${socio.SocNro}`)}
                                        onEdit={() => navigate(`/socios/edit/${socio.SocNro}`)}
                                        onDelete={() => requestDelete(socio)}
                                    />
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="¿Dar de baja al socio?"
                description="Esta acción moverá al socio al histórico. Vas a poder consultarlo ahí más adelante."
                confirmLabel="Sí, dar de baja"
                cancelLabel="Cancelar"
                variant="danger"
                loading={deleting}
                onConfirm={confirmDelete}
                onCancel={closeConfirm}
            >
                {deleteTarget && (
                    <div className={styles.confirmSummary}>
                        <div className={styles.confirmName}>
                            {deleteTarget.PrimerNombre} {deleteTarget.PrimerApellido}
                        </div>
                        <div className={styles.confirmMeta}>
                            <span>N.° {deleteTarget.SocNro}</span>
                            <span>·</span>
                            <span>CI {deleteTarget.SocDocIde}</span>
                        </div>
                    </div>
                )}

                <div className={styles.motivoField}>
                    <label htmlFor="motivoBaja">
                        Motivo de la baja <span className={styles.required}>*</span>
                    </label>
                    <select
                        id="motivoBaja"
                        className={styles.motivoSelect}
                        value={motivoBaja}
                        onChange={(e) => {
                            setMotivoBaja(e.target.value);
                            if (deleteError) setDeleteError('');
                        }}
                        disabled={deleting}
                    >
                        <option value="">Seleccione un motivo...</option>
                        {motivos.map((m) => (
                            <option key={m.Id} value={m.Id}>{m.Descripcion?.trim()}</option>
                        ))}
                    </select>
                </div>

                {deleteError && <p className={styles.confirmError}>{deleteError}</p>}
            </ConfirmDialog>
        </div>
    );
};

export default SociosTable;
