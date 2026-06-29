import styles from './CategoriasSociosTable.module.css';

const CategoriasSociosTable = ({ categorias, onEdit, onDelete }) => {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-UY', {
            style: 'currency',
            currency: 'UYU'
        }).format(value || 0);
    };

    if (!categorias || categorias.length === 0) {
        return (
            <div className={styles.emptyState}>
                <svg width="64" height="64" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
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
                        <th>Cód</th>
                        <th>Nombre</th>
                        <th>Grupo</th>
                        <th>Importe 3</th>
                        <th>Activa</th>
                        <th>Es Colonia</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {categorias.map((cat) => (
                        <tr key={cat.CatCod}>
                            <td className={styles.idCell}>
                                <span className={styles.idBadge}>{cat.CatCod}</span>
                            </td>
                            <td className={styles.nameCell}>{cat.CatNom?.trim()}</td>
                            <td>{cat.GrpCatCod}</td>
                            <td className={styles.numberCell}>{formatCurrency(cat.Importe3)}</td>
                            <td>
                                <span className={`${styles.badge} ${cat.Activa ? styles.badgeActiva : styles.badgeInactiva}`}>
                                    {cat.Activa ? 'Activa' : 'Inactiva'}
                                </span>
                            </td>
                            <td>
                                <span className={`${styles.badge} ${cat.EsColonia ? styles.badgeActiva : styles.badgeInactiva}`}>
                                    {cat.EsColonia ? 'Sí' : 'No'}
                                </span>
                            </td>
                            <td className={styles.actionsCell}>
                                <button
                                    className={styles.btnEdit}
                                    onClick={() => onEdit(cat)}
                                    title="Editar"
                                >
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </button>
                                <button
                                    className={styles.btnDelete}
                                    onClick={() => onDelete(cat.CatCod)}
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

export default CategoriasSociosTable;
