import { useState, useEffect, useCallback, useMemo } from 'react';
import { getMovimientosCaja } from '../services/api';
import { PageHeader, BackLink, Button } from '../components/ui';
import { formatFecha } from '../utils/date';
import styles from './InformeMovimientosCajaPage.module.css';

const ExportIcon = (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(amount || 0);
};

const trim = (value) => (value || '').toString().trim();

const toIsoDate = (d) => d.toISOString().slice(0, 10);
const getDefaultFecha = () => toIsoDate(new Date());

// El backend devuelve una fila por cada combinación de rubro/medio de pago
// del comprobante (por los LEFT JOIN contra CajaRubros/CajaMedioPago), así
// que un mismo comprobante (Caja+Fecha+TipoDoc+NroDoc) puede repetirse varias
// veces -- típicamente porque se cobró con dos formas de pago. Acá se
// agrupan esas filas en una sola, juntando los rubros y medios de pago
// distintos en una lista, para que el informe se lea como "un comprobante =
// una fila".
const agruparPorComprobante = (rows) => {
    const grupos = new Map();
    const orden = [];

    for (const m of rows) {
        const key = `${m.Caja}|${m.Fecha}|${m.TipoDoc}|${m.NroDoc}`;
        let grupo = grupos.get(key);
        if (!grupo) {
            grupo = {
                Caja: m.Caja,
                Fecha: m.Fecha,
                TipoDoc: m.TipoDoc,
                NroDoc: m.NroDoc,
                Detalle: m.Detalle,
                Nombre: m.Nombre,
                SOCDOCIDE: m.SOCDOCIDE,
                TotalDebe: m.TotalDebe,
                TotalHaber: m.TotalHaber,
                rubros: new Set(),
                mediosPago: new Set(),
            };
            grupos.set(key, grupo);
            orden.push(key);
        }
        const rubro = trim(m.RubDsc);
        if (rubro) grupo.rubros.add(rubro);
        const medioPago = trim(m.Descripcion);
        if (medioPago) grupo.mediosPago.add(medioPago);
    }

    return orden.map((key) => {
        const grupo = grupos.get(key);
        return {
            ...grupo,
            rubros: Array.from(grupo.rubros).join(', '),
            mediosPago: Array.from(grupo.mediosPago).join(', '),
        };
    });
};

// Informe "Movimientos de Caja". Consume GET /cajacab/movimientos, que no
// pagina: trae de una todos los comprobantes de CajaCab con Fecha dentro del
// rango [fechaDesde, fechaHasta] (BETWEEN inclusivo, igual que la consulta
// SQL original). El backend devuelve una fila por cada combinación de
// rubro/medio de pago del comprobante (por los LEFT JOIN); acá se reagrupan
// por comprobante (ver agruparPorComprobante) para que un cobro con dos
// formas de pago se vea en una sola fila. Debe/Haber son los del
// comprobante, ya sin duplicar por esa reagrupación.
const InformeMovimientosCajaPage = ({ showToast }) => {
    const [fechaDesde, setFechaDesde] = useState(getDefaultFecha());
    const [fechaHasta, setFechaHasta] = useState(getDefaultFecha());
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);

    const rangoInvalido = fechaDesde && fechaHasta && fechaDesde > fechaHasta;

    const comprobantes = useMemo(() => agruparPorComprobante(movimientos), [movimientos]);

    const load = useCallback(async () => {
        if (!fechaDesde || !fechaHasta || rangoInvalido) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getMovimientosCaja(fechaDesde, fechaHasta);
            setMovimientos(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading movimientos de caja:', err);
            const mensaje = err.response?.data?.error || 'Error al cargar los movimientos de caja';
            setError(mensaje);
            setMovimientos([]);
            showToast?.(mensaje, 'error');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fechaDesde, fechaHasta, rangoInvalido]);

    useEffect(() => {
        load();
    }, [load]);

    const handleLimpiar = () => {
        setFechaDesde(getDefaultFecha());
        setFechaHasta(getDefaultFecha());
    };

    const handleExport = async () => {
        if (exporting || rangoInvalido || !fechaDesde || !fechaHasta) return;
        setExporting(true);
        try {
            const { exportMovimientosCaja } = await import('../services/api');
            const blob = await exportMovimientosCaja(fechaDesde, fechaHasta);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `movimientos_caja_${fechaDesde}_a_${fechaHasta}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Error exporting movimientos de caja:', err);
            const mensaje = err.response?.data?.error || 'Error al exportar los movimientos de caja';
            showToast?.(mensaje, 'error');
        } finally {
            setExporting(false);
        }
    };

    const isFiltered = fechaDesde !== getDefaultFecha() || fechaHasta !== getDefaultFecha();

    return (
        <div className={styles.page}>
            <BackLink to="/utilidades">Volver a Utilidades</BackLink>

            <PageHeader
                title="Movimientos de Caja"
                subtitle="Comprobantes de caja dentro del rango de fechas seleccionado, agrupados por caja"
            />

            <div className={styles.filterBar}>
                <div className={styles.filterGroup}>
                    <label htmlFor="fechaDesde">Desde</label>
                    <input
                        type="date"
                        id="fechaDesde"
                        className={styles.input}
                        value={fechaDesde}
                        onChange={(e) => setFechaDesde(e.target.value)}
                    />
                </div>
                <div className={styles.filterGroup}>
                    <label htmlFor="fechaHasta">Hasta</label>
                    <input
                        type="date"
                        id="fechaHasta"
                        className={styles.input}
                        value={fechaHasta}
                        onChange={(e) => setFechaHasta(e.target.value)}
                    />
                </div>
                {isFiltered && (
                    <Button variant="ghost" size="sm" onClick={handleLimpiar}>
                        Limpiar
                    </Button>
                )}
                {!rangoInvalido && !error && !loading && (
                    <div className={styles.resultsCount}>
                        {comprobantes.length} comprobante{comprobantes.length !== 1 ? 's' : ''} en el período
                    </div>
                )}
            </div>

            {rangoInvalido ? (
                <p className={styles.error}>La fecha "Desde" no puede ser posterior a la fecha "Hasta".</p>
            ) : error ? (
                <p className={styles.error}>{error}</p>
            ) : loading ? (
                <p className={styles.noData}>Cargando movimientos...</p>
            ) : comprobantes.length === 0 ? (
                <p className={styles.noData}>No hay movimientos de caja registrados para el período seleccionado.</p>
            ) : (
                <>
                    <div className={styles.tableToolbar}>
                        <Button
                            variant="soft-success"
                            size="sm"
                            icon={ExportIcon}
                            loading={exporting}
                            onClick={handleExport}
                        >
                            {exporting ? 'Exportando...' : 'Descargar Excel'}
                        </Button>
                    </div>

                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Caja</th>
                                    <th>Fecha</th>
                                    <th>Tipo Doc.</th>
                                    <th>N.° Doc.</th>
                                    <th>Nombre</th>
                                    <th>Cédula</th>
                                    <th>Detalle</th>
                                    <th>Rubro</th>
                                    <th>Medio de Pago</th>
                                    <th className={styles.amountHeader}>Debe</th>
                                    <th className={styles.amountHeader}>Haber</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comprobantes.map((m) => (
                                    <tr key={`${m.Caja}-${m.Fecha}-${m.TipoDoc}-${m.NroDoc}`}>
                                        <td className={`${styles.muted} ${styles.nowrap}`}>{m.Caja}</td>
                                        <td className={styles.nowrap}>{formatFecha(m.Fecha)}</td>
                                        <td className={`${styles.muted} ${styles.nowrap}`}>{m.TipoDoc}</td>
                                        <td className={`${styles.muted} ${styles.nowrap}`}>{m.NroDoc}</td>
                                        <td className={styles.nameCell}>
                                            {trim(m.Nombre) || '-'}
                                            {m.SOCDOCIDE ? <div className={styles.muted}>CI {m.SOCDOCIDE}</div> : null}
                                        </td>
                                        <td className={`${styles.muted} ${styles.nowrap}`}>{m.SOCDOCIDE || '-'}</td>
                                        <td>{trim(m.Detalle) || '-'}</td>
                                        <td>{m.rubros || '-'}</td>
                                        <td>{m.mediosPago || '-'}</td>
                                        <td className={`${styles.amountCell} ${styles.nowrap}`}>{m.TotalDebe ? formatCurrency(m.TotalDebe) : '-'}</td>
                                        <td className={`${styles.amountCellHaber} ${styles.nowrap}`}>{m.TotalHaber ? formatCurrency(m.TotalHaber) : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default InformeMovimientosCajaPage;
