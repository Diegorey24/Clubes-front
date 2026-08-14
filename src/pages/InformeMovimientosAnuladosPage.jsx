import { useState, useEffect, useCallback } from 'react';
import { getMovimientosAnuladosPorPeriodo } from '../services/api';
import { PageHeader, BackLink, Button } from '../components/ui';
import { formatFecha, formatMesAnio } from '../utils/date';
import styles from './InformeMovimientosAnuladosPage.module.css';

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
const getDefaultFechaDesde = () => {
    const d = new Date();
    d.setDate(1);
    return toIsoDate(d);
};
const getDefaultFechaHasta = () => toIsoDate(new Date());

// Informe "Movimientos Anulados". Consume GET /cuenta-corriente/movimientos-anulados?fechaDesde=&fechaHasta=,
// que no pagina: trae de una todos los cargos anulados (tabla MovimientosAnulados,
// ver CuentaCorrienteModel.anular) cuya FechaPago cae dentro del rango pedido,
// con joins a Rubros/CategoriasSocios/Socios (Rubro y Categoría llegan como
// descripción, no como código).
const InformeMovimientosAnuladosPage = ({ showToast }) => {
    const [fechaDesde, setFechaDesde] = useState(getDefaultFechaDesde());
    const [fechaHasta, setFechaHasta] = useState(getDefaultFechaHasta());
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);

    const rangoInvalido = fechaDesde && fechaHasta && fechaDesde > fechaHasta;

    const load = useCallback(async () => {
        if (!fechaDesde || !fechaHasta || rangoInvalido) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getMovimientosAnuladosPorPeriodo(fechaDesde, fechaHasta);
            setMovimientos(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading movimientos anulados:', err);
            const mensaje = err.response?.data?.error || 'Error al cargar el informe de movimientos anulados';
            setError(mensaje);
            setMovimientos([]);
            showToast?.(mensaje, 'error');
        } finally {
            setLoading(false);
        }
    }, [fechaDesde, fechaHasta, rangoInvalido, showToast]);

    useEffect(() => {
        load();
    }, [load]);

    const handleExport = async () => {
        if (exporting || rangoInvalido || !fechaDesde || !fechaHasta) return;
        setExporting(true);
        try {
            const { exportMovimientosAnuladosPorPeriodo } = await import('../services/api');
            const blob = await exportMovimientosAnuladosPorPeriodo(fechaDesde, fechaHasta);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `movimientos_anulados_${fechaDesde}_a_${fechaHasta}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Error exporting movimientos anulados:', err);
            const mensaje = err.response?.data?.error || 'Error al exportar el informe de movimientos anulados';
            showToast?.(mensaje, 'error');
        } finally {
            setExporting(false);
        }
    };

    const handleLimpiar = () => {
        setFechaDesde(getDefaultFechaDesde());
        setFechaHasta(getDefaultFechaHasta());
    };

    const isFiltered = fechaDesde !== getDefaultFechaDesde() || fechaHasta !== getDefaultFechaHasta();

    return (
        <div className={styles.page}>
            <BackLink to="/utilidades">Volver a Utilidades</BackLink>

            <PageHeader
                title="Movimientos Anulados"
                subtitle="Cargos anulados dentro del rango de fechas seleccionado"
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
                        {movimientos.length} movimiento{movimientos.length !== 1 ? 's' : ''} anulado{movimientos.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {rangoInvalido ? (
                <p className={styles.error}>La fecha "Desde" no puede ser posterior a la fecha "Hasta".</p>
            ) : error ? (
                <p className={styles.error}>{error}</p>
            ) : loading ? (
                <p className={styles.noData}>Cargando movimientos anulados...</p>
            ) : movimientos.length === 0 ? (
                <p className={styles.noData}>No hay movimientos anulados en ese período.</p>
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
                                    <th>Cédula</th>
                                    <th>Nombre</th>
                                    <th>Mes</th>
                                    <th>Rubro</th>
                                    <th>Categoría</th>
                                    <th className={styles.amountHeader}>Importe</th>
                                    <th>N.° Recibo</th>
                                    <th>Fecha de Anulación</th>
                                    <th>Aniomes</th>
                                    <th>Emitido</th>
                                    <th>Forma de Pago</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movimientos.map((m, idx) => (
                                    <tr key={`${m.CI}-${m.Mes}-${m.NroRecibo}-${idx}`}>
                                        <td className={`${styles.muted} ${styles.nowrap}`}>{m.CI}</td>
                                        <td className={styles.nameCell}>{trim(m.SocNom) || '-'}</td>
                                        <td className={styles.nowrap}>{formatMesAnio(m.Mes)}</td>
                                        <td>{trim(m.RubDsc) || '-'}</td>
                                        <td>{trim(m.CatNom) || '-'}</td>
                                        <td className={`${styles.amountCell} ${styles.nowrap}`}>{formatCurrency(m.Importe)}</td>
                                        <td className={`${styles.muted} ${styles.nowrap}`}>{m.NroRecibo || '-'}</td>
                                        <td className={styles.nowrap}>{formatFecha(m.FechaPago)}</td>
                                        <td className={`${styles.muted} ${styles.nowrap}`}>{m.Aniomes}</td>
                                        <td className={styles.nowrap}>{m.Emitido ? 'Sí' : 'No'}</td>
                                        <td>{trim(m.FormaPago) || '-'}</td>
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

export default InformeMovimientosAnuladosPage;
