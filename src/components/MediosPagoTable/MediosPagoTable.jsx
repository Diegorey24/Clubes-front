import styles from './MediosPagoTable.module.css';

const MediosPagoTable = ({ mediosPago, onEdit, onDelete }) => {
    const formatNumber = (value) => {
        return new Intl.NumberFormat('es-UY').format(value || 0);
    };

    if (!mediosPago || mediosPago.length === 0) {
        return (
            <div className={styles.emptyState}>
                <svg width="64" height="64" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0  002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
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
                        <th>ID</th>
                        <th>Descripción</th>
                        <th>Tipo</th>
                        <th>Rubro</th>
                        <th>Rubro ME</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {mediosPago.map((medio) => (
                        <tr key={medio.IdMedioPago}>
                            <td className={styles.idCell}>
                                <span className={styles.idBadge}>{medio.IdMedioPago}</span>
                            </td>
                            <td className={styles.nameCell}>{medio.Descripcion?.trim()}</td>
                            <td>{medio.Tipo}</td>
                            <td className={styles.numberCell}>{formatNumber(medio.Rubro)}</td>
                            <td className={styles.numberCell}>{formatNumber(medio.RubroME)}</td>
                            <td className={styles.actionsCell}>
                                <button
                                    className={styles.btnEdit}
                                    onClick={() => onEdit(medio)}
                                    title="Editar"
                                >
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </button>
                                <button
                                    className={styles.btnDelete}
                                    onClick={() => onDelete(medio.IdMedioPago)}
                                    title="Eliminar"
                                >
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MediosPagoTable;
