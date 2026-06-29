import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getCajaHistorico } from '../services/api';
import styles from './CajaHistoricoPage.module.css';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(amount || 0);
};

const CajaHistoricoPage = ({ usuario, showToast }) => {
    const caja = usuario?.nroCaja;
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fecha, setFecha] = useState('');
    const [nroCierre, setNroCierre] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getCajaHistorico({ caja, fecha, nroCierre });
            setMovimientos(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading caja historico:', err);
            showToast('Error al cargar el histórico de caja', 'error');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [caja, fecha, nroCierre]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Histórico de Caja N° {caja}</h1>
                <Link to="/caja" className="btn-secondary">
                    Volver a Caja
                </Link>
            </div>

            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <label htmlFor="fecha">Fecha</label>
                    <input
                        type="date"
                        id="fecha"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                    />
                </div>
                <div className={styles.filterGroup}>
                    <label htmlFor="nroCierre">N° Cierre</label>
                    <input
                        type="number"
                        id="nroCierre"
                        value={nroCierre}
                        onChange={(e) => setNroCierre(e.target.value)}
                        placeholder="Todos"
                    />
                </div>
            </div>

            {loading ? (
                <p className={styles.noData}>Cargando...</p>
            ) : movimientos.length === 0 ? (
                <p className={styles.noData}>No hay movimientos históricos para los filtros seleccionados.</p>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>N° Cierre</th>
                                <th>Tipo</th>
                                <th>Nombre / Detalle</th>
                                <th>Debe</th>
                                <th>Haber</th>
                                <th>NroDoc</th>
                                <th>Usuario</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movimientos.map((m) => (
                                <tr key={m.ID}>
                                    <td>{m.Fecha ? new Date(m.Fecha).toLocaleDateString() : '-'}</td>
                                    <td>{m.NroCierre}</td>
                                    <td>{m.TipoDoc?.trim()}</td>
                                    <td>{m.Nombre?.trim() || m.Detalle?.trim() || '-'}</td>
                                    <td className={styles.debe}>{m.TotalDebe ? formatCurrency(m.TotalDebe) : '-'}</td>
                                    <td className={styles.haber}>{m.TotalHaber ? formatCurrency(m.TotalHaber) : '-'}</td>
                                    <td>{m.NroDoc || '-'}</td>
                                    <td>{m.Usuario?.trim() || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CajaHistoricoPage;
