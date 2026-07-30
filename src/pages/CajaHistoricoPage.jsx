import { useState, useEffect, useCallback } from 'react';
import { getCajaHistorico } from '../services/api';
import { Button, PageHeader, BackLink } from '../components/ui';
import { formatFecha } from '../utils/date';
import styles from './CajaHistoricoPage.module.css';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(amount || 0);
};

// Por defecto se filtra el histórico al día de ayer: el primer llamado de
// esta página NO debe pedir todo el histórico sin filtro (eso traía
// millones de movimientos), así que siempre arrancamos acotados a una fecha.
const getYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
};

const CajaHistoricoPage = ({ usuario, showToast }) => {
    const caja = usuario?.nroCaja;
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fecha, setFecha] = useState(getYesterday());

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getCajaHistorico({ caja, fecha });
            setMovimientos(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading caja historico:', err);
            showToast('Error al cargar el histórico de caja', 'error');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [caja, fecha]);

    useEffect(() => {
        load();
    }, [load]);

    const handleLimpiar = () => {
        setFecha(getYesterday());
    };

    const isFiltered = fecha !== getYesterday();

    return (
        <div className={styles.page}>
            <BackLink to="/caja">Volver a Caja</BackLink>

            <PageHeader
                title={`Histórico de Caja N° ${caja}`}
                subtitle="Movimientos de cierres anteriores"
            />

            <div className={styles.filterBar}>
                <div className={styles.filterGroup}>
                    <label htmlFor="fecha">Fecha</label>
                    <input
                        type="date"
                        id="fecha"
                        className={styles.input}
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                    />
                </div>
                {isFiltered && (
                    <Button variant="ghost" size="sm" onClick={handleLimpiar}>
                        Limpiar
                    </Button>
                )}
            </div>

            {loading ? (
                <p className={styles.noData}>Cargando movimientos...</p>
            ) : movimientos.length === 0 ? (
                <p className={styles.noData}>No hay movimientos históricos para los filtros seleccionados.</p>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Tipo</th>
                                <th>Nombre / Detalle</th>
                                <th>Debe</th>
                                <th>Haber</th>
                                <th>N.° Doc</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movimientos.map((m) => (
                                <tr key={m.ID}>
                                    <td>{formatFecha(m.Fecha)}</td>
                                    <td>{m.TipoDoc?.trim()}</td>
                                    <td className={styles.nameCell}>{m.Nombre?.trim() || m.Detalle?.trim() || '-'}</td>
                                    <td className={styles.debe}>{m.TotalDebe ? formatCurrency(m.TotalDebe) : '-'}</td>
                                    <td className={styles.haber}>{m.TotalHaber ? formatCurrency(m.TotalHaber) : '-'}</td>
                                    <td className={styles.muted}>{m.NroDoc || '-'}</td>
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
