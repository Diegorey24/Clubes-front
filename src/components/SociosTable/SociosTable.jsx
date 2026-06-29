import { useNavigate } from 'react-router-dom';
import { deleteSocio } from '../../services/api';
import styles from './SociosTable.module.css';

const SociosTable = ({ socios, onSocioDeleted, readOnly = false, detailPath = '/socios' }) => {
    const navigate = useNavigate();
    console.log(socios);
    const handleRowClick = (id) => {
        navigate(`${detailPath}/${id}`);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('¿Está seguro que desea dar de baja a este socio? Esta acción moverá al socio al histórico.')) {
            try {
                await deleteSocio(id);
                if (onSocioDeleted) onSocioDeleted();
            } catch (error) {
                console.error('Error deleting socio:', error);
                alert('Error al dar de baja al socio');
            }
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
                        {!readOnly && <th style={{ width: '80px', textAlign: 'center' }}>Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {socios.map((socio) => (
                        <tr
                            key={socio.SocNro}
                            onClick={() => handleRowClick(socio.SocNro)}
                            title="Ver detalles del socio"
                        >
                            <td>{socio.SocNro}</td>
                            <td>{socio.SocDocIde}</td>
                            <td>{socio.PrimerNombre} {socio.PrimerApellido}</td>
                            <td>{socio.CategoriaNombre || '-'}</td>
                            <td>{socio.RadioNombre || '-'}</td>
                            {!readOnly && (
                                <td onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                                    <button
                                        className={styles.editButton}
                                        onClick={() => navigate(`/socios/edit/${socio.SocNro}`)}
                                        title="Editar socio"
                                    >
                                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        className={`${styles.editButton} ${styles.deleteButton}`}
                                        onClick={(e) => handleDelete(e, socio.SocNro)}
                                        title="Dar de Baja"
                                        style={{ color: '#ef4444' }}
                                    >
                                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SociosTable;
