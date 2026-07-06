import { useState, useEffect } from 'react';
import { getParametrosDebitos, updateParametroDebito } from '../services/api';
import pageStyles from './RubrosPage.module.css';
import styles from './ParametrosDebitosPage.module.css';

const ParametrosDebitosPage = ({ showToast }) => {
    const [parametros, setParametros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editando, setEditando] = useState(null); // nombre de la fila en edicion
    const [formData, setFormData] = useState({ CodComercio: '', Sucursal: '' });
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        cargar();
    }, []);

    const cargar = async () => {
        setLoading(true);
        try {
            const data = await getParametrosDebitos();
            setParametros(data);
        } catch (err) {
            showToast('Error al cargar parámetros', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEditar = (p) => {
        setEditando(p.Nombre);
        setFormData({ CodComercio: p.CodComercio, Sucursal: p.Sucursal });
    };

    const handleCancelar = () => {
        setEditando(null);
        setFormData({ CodComercio: '', Sucursal: '' });
    };

    const handleGuardar = async (nombre) => {
        setGuardando(true);
        try {
            await updateParametroDebito(nombre, formData);
            showToast('Parámetro actualizado correctamente', 'success');
            setEditando(null);
            cargar();
        } catch (err) {
            showToast('Error al actualizar parámetro', 'error');
        } finally {
            setGuardando(false);
        }
    };

    if (loading) {
        return (
            <div className={pageStyles.page}>
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando parámetros...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={pageStyles.page}>
            <div className={pageStyles.header}>
                <h2 className={pageStyles.title}>Parámetros de Débitos</h2>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Financiera</th>
                            <th>Código de Comercio</th>
                            <th>Sucursal</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {parametros.map((p) => (
                            <tr key={p.Nombre}>
                                <td className={styles.nameCell}>{p.Nombre}</td>
                                <td>
                                    {editando === p.Nombre ? (
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={formData.CodComercio}
                                            onChange={(e) => setFormData({ ...formData, CodComercio: e.target.value })}
                                            maxLength={8}
                                        />
                                    ) : (
                                        p.CodComercio
                                    )}
                                </td>
                                <td>
                                    {editando === p.Nombre ? (
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={formData.Sucursal}
                                            onChange={(e) => setFormData({ ...formData, Sucursal: e.target.value })}
                                            maxLength={4}
                                        />
                                    ) : (
                                        p.Sucursal
                                    )}
                                </td>
                                <td className={styles.actionsCell}>
                                    {editando === p.Nombre ? (
                                        <>
                                            <button className="btn-primary" onClick={() => handleGuardar(p.Nombre)} disabled={guardando}>
                                                {guardando ? 'Guardando...' : 'Guardar'}
                                            </button>
                                            <button className="btn-secondary" onClick={handleCancelar} style={{ marginLeft: '8px' }}>
                                                Cancelar
                                            </button>
                                        </>
                                    ) : (
                                        <button className="btn-primary" onClick={() => handleEditar(p)}>
                                            Editar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ParametrosDebitosPage;