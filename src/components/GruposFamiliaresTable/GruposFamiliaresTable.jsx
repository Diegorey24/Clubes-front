import styles from './GruposFamiliaresTable.module.css';

const GruposFamiliaresTable = ({ grupos, onEdit, onDelete }) => {
    if (!grupos || grupos.length === 0) {
        return (
            <div className={styles.emptyState}>
                <svg width="64" height="64" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
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
                        <th>Nro.</th>
                        <th>Título</th>
                        <th>Mas Vie</th>
                        <th>Cant. Integrantes</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {grupos.map((grupo) => (
                        <tr key={grupo.GruFamNro}>
                            <td className={styles.idCell}>
                                <span className={styles.idBadge}>{grupo.GruFamNro}</span>
                            </td>
                            <td className={styles.nameCell}>{grupo.GruFamTit?.trim() || '-'}</td>
                            <td>{grupo.GruMasVie ?? '-'}</td>
                            <td className={styles.numberCell}>{grupo.GruCntInt ?? '-'}</td>
                            <td className={styles.actionsCell}>
                                <button
                                    className={styles.btnEdit}
                                    onClick={() => onEdit(grupo)}
                                    title="Editar"
                                >
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </button>
                                <button
                                    className={styles.btnDelete}
                                    onClick={() => onDelete(grupo.GruFamNro)}
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

export default GruposFamiliaresTable;
