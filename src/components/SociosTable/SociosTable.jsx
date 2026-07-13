import { useNavigate } from 'react-router-dom';
import { deleteSocio } from '../../services/api';
import { TableActions } from '../ui';
import styles from './SociosTable.module.css';

const SociosTable = ({ socios, onSocioDeleted, readOnly = false, detailPath = '/socios' }) => {
    const navigate = useNavigate();
    const handleRowClick = (id) => {
        navigate(`${detailPath}/${id}`);
    };

    const handleDelete = async (id) => {
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
                                    ? <span className={styles.pill}>{socio.CategoriaNombre}</span>
                                    : <span className={styles.muted}>-</span>}
                            </td>
                            <td className={styles.muted}>{socio.RadioNombre || '-'}</td>
                            {!readOnly && (
                                <td className={styles.actionsCell}>
                                    <TableActions
                                        onView={() => navigate(`${detailPath}/${socio.SocNro}`)}
                                        onEdit={() => navigate(`/socios/edit/${socio.SocNro}`)}
                                        onDelete={() => handleDelete(socio.SocNro)}
                                    />
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
