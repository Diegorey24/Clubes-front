import styles from './RadiosTable.module.css';

const RadiosTable = ({ radios, onEdit, onDelete }) => {
    const formatNumber = (value) => {
        return new Intl.NumberFormat('es-UY').format(value || 0);
    };

    if (!radios || radios.length === 0) {
        return (
            <div className={styles.emptyState}>
                <svg width="64" height="64" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                <p>No hay radios para mostrar</p>
            </div>
        );
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Orden Impresión</th>
                        <th>Descripción Contable</th>
                        <th>Rubro Contable</th>
                        <th>Basket</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {radios.map((radio) => (
                        <tr key={radio.IdRadio}>
                            <td className={styles.idCell}>
                                <span className={styles.idBadge}>{radio.IdRadio}</span>
                            </td>
                            <td className={styles.nameCell}>{radio.Nombre?.trim()}</td>
                            <td className={styles.numberCell}>{formatNumber(radio.OrdenImpresion)}</td>
                            <td>{radio.DescripcionContable || '-'}</td>
                            <td className={styles.numberCell}>{formatNumber(radio.RubroContable)}</td>
                            <td className={styles.numberCell}>{formatNumber(radio.Basket)}</td>
                            <td className={styles.actionsCell}>
                                <button
                                    className={styles.btnEdit}
                                    onClick={() => onEdit(radio)}
                                    title="Editar"
                                >
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </button>
                                <button
                                    className={styles.btnDelete}
                                    onClick={() => onDelete(radio.IdRadio)}
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

export default RadiosTable;
