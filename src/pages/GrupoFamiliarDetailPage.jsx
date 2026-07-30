import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGrupoFamiliar, deleteGrupoFamiliar, cambiarTitularGrupoFamiliar } from '../services/api';
import { nombreCompleto } from '../utils/socioNombre';
import { Button, Badge, Title, BackLink, ConfirmDialog } from '../components/ui';
import GrupoFamiliarIntegrantesModal from '../components/GrupoFamiliarIntegrantesModal/GrupoFamiliarIntegrantesModal';
import styles from './GrupoFamiliarDetailPage.module.css';

const EditIcon = (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const TrashIcon = (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const CrownIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l4 4 5-7 5 7 4-4-2 11H5L3 8z" />
    </svg>
);

const GrupoFamiliarDetailPage = ({ showToast }) => {
    const { socDocIde } = useParams();
    const navigate = useNavigate();
    const [grupo, setGrupo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [cambiarTitularTarget, setCambiarTitularTarget] = useState(null);
    const [cambiandoTitular, setCambiandoTitular] = useState(false);
    const [cambiarTitularError, setCambiarTitularError] = useState('');

    useEffect(() => {
        loadGrupo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socDocIde]);

    const loadGrupo = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getGrupoFamiliar(socDocIde);
            setGrupo(data);
        } catch (err) {
            console.error('Error loading grupo familiar:', err);
            if (err.response?.status === 404) {
                setError('Este socio no es titular de ningún grupo familiar.');
            } else {
                setError('Error al cargar el grupo familiar');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleIntegrantesActualizados = () => {
        setIsEditModalOpen(false);
        showToast('Integrantes actualizados exitosamente', 'success');
        loadGrupo();
    };

    const handleDisolver = async () => {
        setDeleting(true);
        setDeleteError('');
        try {
            await deleteGrupoFamiliar(socDocIde);
            showToast('Grupo familiar disuelto exitosamente', 'success');
            navigate('/grupos-familiares');
        } catch (err) {
            console.error('Error disolviendo el grupo familiar:', err);
            setDeleteError('No se pudo disolver el grupo familiar. Intentá nuevamente.');
        } finally {
            setDeleting(false);
        }
    };

    const requestCambiarTitular = (socio) => {
        setCambiarTitularError('');
        setCambiarTitularTarget(socio);
    };

    const closeCambiarTitularConfirm = () => {
        if (cambiandoTitular) return;
        setCambiarTitularTarget(null);
        setCambiarTitularError('');
    };

    const confirmCambiarTitular = async () => {
        if (!cambiarTitularTarget) return;
        setCambiandoTitular(true);
        setCambiarTitularError('');
        try {
            const nuevoSocDocIde = cambiarTitularTarget.SocDocIde;
            await cambiarTitularGrupoFamiliar(socDocIde, nuevoSocDocIde);
            // Cierra el diálogo antes de navegar: como la ruta reusa el mismo
            // componente (solo cambia :socDocIde), el estado no se resetea
            // solo y el diálogo quedaría abierto ofreciendo repetir la acción.
            setCambiarTitularTarget(null);
            showToast('Titular actualizado exitosamente', 'success');
            // El socDocIde viejo deja de existir como titular: hay que
            // reapuntar la URL a la cédula del nuevo titular.
            navigate(`/grupos-familiares/${nuevoSocDocIde}`, { replace: true });
        } catch (err) {
            console.error('Error cambiando el titular del grupo familiar:', err);
            const msg = err.response?.data?.error || err.response?.data?.message;
            if (err.response?.status === 400) {
                setCambiarTitularError(msg || 'No se pudo cambiar el titular con esos datos.');
            } else {
                setCambiarTitularError('No se pudo cambiar el titular. Intentá nuevamente.');
            }
        } finally {
            setCambiandoTitular(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando grupo familiar...</p>
                </div>
            </div>
        );
    }

    if (error || !grupo) {
        return (
            <div className={styles.page}>
                <div className={styles.pageInner}>
                    <BackLink to="/grupos-familiares">Volver al listado</BackLink>
                    <div className={styles.errorState}>
                        <h2>Error</h2>
                        <p>{error || 'No se pudo encontrar el grupo familiar'}</p>
                        <Button variant="secondary" onClick={() => navigate('/grupos-familiares')}>
                            Volver al listado
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const { titular, integrantes } = grupo;
    const filas = [
        { ...titular, esTitular: true },
        ...(integrantes || []).map((i) => ({ ...i, esTitular: false })),
    ];

    return (
        <div className={styles.page}>
            <div className={styles.pageInner}>
                <BackLink to="/grupos-familiares">Volver al listado</BackLink>

                <div className={styles.container}>
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.title}>{nombreCompleto(titular)}</h1>
                            <p className={styles.subtitle}>
                                Titular · CI {titular.SocDocIde} · Socio N.° {titular.SocNro}
                            </p>
                        </div>
                        <div className={styles.headerActions}>
                            <Button variant="glass" icon={EditIcon} onClick={() => setIsEditModalOpen(true)}>
                                Editar Integrantes
                            </Button>
                            <Button variant="glass" icon={TrashIcon} onClick={() => setIsDeleteConfirmOpen(true)}>
                                Disolver Grupo
                            </Button>
                        </div>
                    </div>

                    <div className={styles.content}>
                        <div className={styles.section}>
                            <Title variant="section">Integrantes del grupo</Title>

                            <div className={styles.tableContainer}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>N.° Socio</th>
                                            <th>Nombre</th>
                                            <th>Cédula</th>
                                            <th>Rol</th>
                                            <th className={styles.actionsHeader}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filas.map((s) => (
                                            <tr key={s.SocNro}>
                                                <td className={styles.muted}>{s.SocNro}</td>
                                                <td className={styles.nameCell}>{nombreCompleto(s)}</td>
                                                <td className={styles.muted}>{s.SocDocIde}</td>
                                                <td>
                                                    {s.esTitular
                                                        ? <Badge variant="primary">Titular</Badge>
                                                        : <Badge variant="neutral">Integrante</Badge>}
                                                </td>
                                                <td className={styles.actionsCell}>
                                                    {!s.esTitular && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            icon={CrownIcon}
                                                            onClick={() => requestCambiarTitular(s)}
                                                        >
                                                            Hacer Titular
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {(!integrantes || integrantes.length === 0) && (
                                <p className={styles.noData}>Este grupo todavía no tiene otros integrantes además del titular.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <GrupoFamiliarIntegrantesModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={handleIntegrantesActualizados}
                grupo={grupo}
            />

            <ConfirmDialog
                isOpen={!!cambiarTitularTarget}
                title="¿Cambiar el titular del grupo?"
                description="El grupo va a quedar identificado por la cédula del nuevo titular; el titular actual pasa a ser un integrante más. Esta acción no se puede deshacer."
                confirmLabel="Sí, cambiar titular"
                cancelLabel="Cancelar"
                variant="primary"
                loading={cambiandoTitular}
                onConfirm={confirmCambiarTitular}
                onCancel={closeCambiarTitularConfirm}
            >
                {cambiarTitularTarget && (
                    <div className={styles.confirmSummary}>
                        <div className={styles.confirmName}>{nombreCompleto(cambiarTitularTarget)}</div>
                        <div className={styles.confirmMeta}>
                            <span>CI {cambiarTitularTarget.SocDocIde}</span>
                            <span>·</span>
                            <span>Nuevo titular</span>
                        </div>
                    </div>
                )}
                {cambiarTitularError && <p className={styles.confirmError}>{cambiarTitularError}</p>}
            </ConfirmDialog>

            <ConfirmDialog
                isOpen={isDeleteConfirmOpen}
                title="¿Disolver grupo familiar?"
                description="El titular y todos los integrantes quedan desvinculados del grupo. Esta acción no se puede deshacer."
                confirmLabel="Sí, disolver"
                cancelLabel="Cancelar"
                variant="danger"
                loading={deleting}
                onConfirm={handleDisolver}
                onCancel={() => {
                    if (deleting) return;
                    setIsDeleteConfirmOpen(false);
                    setDeleteError('');
                }}
            >
                <div className={styles.confirmSummary}>
                    <div className={styles.confirmName}>{nombreCompleto(titular)}</div>
                    <div className={styles.confirmMeta}>
                        <span>CI {titular.SocDocIde}</span>
                        <span>·</span>
                        <span>{filas.length} integrante{filas.length !== 1 ? 's' : ''} en total</span>
                    </div>
                </div>
                {deleteError && <p className={styles.confirmError}>{deleteError}</p>}
            </ConfirmDialog>
        </div>
    );
};

export default GrupoFamiliarDetailPage;
