import { useState, useEffect, useCallback } from 'react';
import { getEmisionPorPeriodo } from '../services/api';
import { PageHeader, BackLink, Button } from '../components/ui';
import { formatFecha, formatMesAnio } from '../utils/date';
import styles from './InformeEmisionPage.module.css';

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

// Informe "Emisión". Consume GET /cuenta-corriente/emision?fechaDesde=&fechaHasta=,
// que no pagina: trae de una todos los cargos de CuentaCorriente cuya
// FechaCargo cae dentro del rango pedido, con joins a Rubros/CategoriasSocios/
// Socios (Rubro y Categoría llegan como descripción, no como código).
const InformeEmisionPage = ({ showToast }) => {
    const [fechaDesde, setFechaDesde] = useState(getDefaultFechaDesde());
    const [fechaHasta, setFechaHasta] = useState(getDefaultFechaHasta());
    const [cargos, setCargos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);

    const rangoInvalido = fechaDesde && fechaHasta && fechaDesde > fechaHasta;

    const load = useCallback(async () => {
        if (!fechaDesde || !fechaHasta || rangoInvalido) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getEmisionPorPeriodo(fechaDesde, fechaHasta);
            setCargos(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading emisión:', err);
            const mensaje = err.response?.data?.error || 'Error al cargar el informe de emisión';
            setError(mensaje);
            setCargos([]);
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
            const { exportEmisionPorPeriodo } = await import('../services/api');
            const blob = await exportEmisionPorPeriodo(fechaDesde, fechaHasta);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `emision_${fechaDesde}_a_${fechaHasta}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Error exporting emisión:', err);
            const mensaje = err.response?.data?.error || 'Error al exportar el informe de emisión';
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
                title="Listado de Emisión"
                subtitle="Cargos de cuenta corriente generados dentro del rango de fechas seleccionado"
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
                        {cargos.length} cargo{cargos.length !== 1 ? 's' : ''} emitido{cargos.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {rangoInvalido ? (
                <p className={styles.error}>La fecha "Desde" no puede ser posterior a la fecha "Hasta".</p>
            ) : error ? (
                <p className={styles.error}>{error}</p>
            ) : loading ? (
                <p className={styles.noData}>Cargando emisión...</p>
            ) : cargos.length === 0 ? (
                <p className={styles.noData}>No hay cargos emitidos en ese período.</p>
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
                                    <th>Rubro</th>
                                    <th className={styles.amountHeader}>Importe</th>
                                    <th>Mes</th>
                                    <th>Vencimiento</th>
                                    <th>N.° Recibo</th>
                                    <th>Categoría</th>
                                    <th>N.° Grupo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cargos.map((c, idx) => (
                                    <tr key={`${c.CI}-${c.Mes}-${c.NroRecibo}-${idx}`}>
                                        <td className={`${styles.muted} ${styles.nowrap}`}>{c.CI}</td>
                                        <td className={styles.nameCell}>{trim(c.SocNom) || '-'}</td>
                                        <td>{trim(c.RubDsc) || '-'}</td>
                                        <td className={`${styles.amountCell} ${styles.nowrap}`}>{formatCurrency(c.Importe)}</td>
                                        <td className={styles.nowrap}>{formatMesAnio(c.Mes)}</td>
                                        <td className={styles.nowrap}>{formatFecha(c.FechaVto)}</td>
                                        <td className={`${styles.muted} ${styles.nowrap}`}>{c.NroRecibo || '-'}</td>
                                        <td>{trim(c.CatNom) || '-'}</td>
                                        <td className={`${styles.muted} ${styles.nowrap}`}>{c.CodGrupo}</td>
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

export default InformeEmisionPage;
