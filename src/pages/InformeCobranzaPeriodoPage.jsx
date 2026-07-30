import { useState, useEffect, useCallback } from 'react';
import { getCobranzaPeriodo } from '../services/api';
import { PageHeader, BackLink, Button } from '../components/ui';
import { formatFecha, formatMesAnio } from '../utils/date';
import styles from './InformeCobranzaPeriodoPage.module.css';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(amount || 0);
};

const ExportIcon = (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

// Por defecto se muestra el período "mes en curso" (día 1 al día de hoy):
// igual que en CajaHistoricoPage, el primer llamado NO debe pedir todo el
// histórico de cobranzas sin filtro.
const toIsoDate = (d) => d.toISOString().slice(0, 10);

const getDefaultFechaDesde = () => {
    const d = new Date();
    d.setDate(1);
    return toIsoDate(d);
};

const getDefaultFechaHasta = () => toIsoDate(new Date());

// Informe "Cobranza por período". Consume GET /cuenta-corriente/cobranza,
// que pagina igual que /socios ({ items, total, page, limit, totalPages }):
// el corte lo hace SQL, no acá, así que un rango de varios meses no revienta
// la respuesta. No se muestran totales agregados (cobrado, recibos, por
// forma de pago): el backend no expone un agregado sobre todo el rango
// filtrado, solo por página, y mostrar esos números parciales como si
// fueran el total del período confunde más de lo que ayuda.
const InformeCobranzaPeriodoPage = ({ showToast }) => {
    const [fechaDesde, setFechaDesde] = useState(getDefaultFechaDesde());
    const [fechaHasta, setFechaHasta] = useState(getDefaultFechaHasta());
    const [cobranzas, setCobranzas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit] = useState(50);

    const rangoInvalido = fechaDesde && fechaHasta && fechaDesde > fechaHasta;

    // Cada vez que cambia el rango de fechas, volvemos a la página 1.
    useEffect(() => {
        setPage(1);
    }, [fechaDesde, fechaHasta]);

    const load = useCallback(async () => {
        if (!fechaDesde || !fechaHasta || rangoInvalido) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getCobranzaPeriodo(fechaDesde, fechaHasta, page, limit);
            setCobranzas(data.items || []);
            setTotalPages(data.totalPages || 1);
            setTotalItems(data.total || 0);
        } catch (err) {
            console.error('Error loading cobranza del período:', err);
            const mensaje = err.response?.data?.error || 'Error al cargar la cobranza del período';
            setError(mensaje);
            setCobranzas([]);
            setTotalPages(1);
            setTotalItems(0);
            showToast?.(mensaje, 'error');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fechaDesde, fechaHasta, rangoInvalido, page, limit]);

    useEffect(() => {
        load();
    }, [load]);

    const handleLimpiar = () => {
        setFechaDesde(getDefaultFechaDesde());
        setFechaHasta(getDefaultFechaHasta());
    };

    const handlePrevious = () => {
        if (page > 1) setPage(prev => prev - 1);
    };

    const handleNext = () => {
        if (page < totalPages) setPage(prev => prev + 1);
    };

    const handleExport = async () => {
        if (exporting || rangoInvalido || !fechaDesde || !fechaHasta) return;
        setExporting(true);
        try {
            const { exportCobranzaPeriodo } = await import('../services/api');
            const blob = await exportCobranzaPeriodo(fechaDesde, fechaHasta);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cobranza_${fechaDesde}_a_${fechaHasta}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Error exporting cobranza del período:', err);
            const mensaje = err.response?.data?.error || 'Error al exportar la cobranza del período';
            showToast?.(mensaje, 'error');
        } finally {
            setExporting(false);
        }
    };

    const isFiltered = fechaDesde !== getDefaultFechaDesde() || fechaHasta !== getDefaultFechaHasta();

    return (
        <div className={styles.page}>
            <BackLink to="/utilidades">Volver a Utilidades</BackLink>

            <PageHeader
                title="Cobranza por Período"
                subtitle="Recibos cobrados dentro del rango de fechas seleccionado"
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
                {!rangoInvalido && (
                    <div className={styles.resultsCount}>
                        {totalItems} movimiento{totalItems !== 1 ? 's' : ''} en el período
                    </div>
                )}
            </div>

            {rangoInvalido ? (
                <p className={styles.error}>La fecha "Desde" no puede ser posterior a la fecha "Hasta".</p>
            ) : (
                <>
                    {error ? (
                        <p className={styles.error}>{error}</p>
                    ) : loading ? (
                        <p className={styles.noData}>Cargando cobranzas...</p>
                    ) : cobranzas.length === 0 ? (
                        <p className={styles.noData}>No hay cobranzas registradas para el período seleccionado.</p>
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
                                            <th>Fecha de Pago</th>
                                            <th>N.° Recibo</th>
                                            <th>Cédula</th>
                                            <th>Período</th>
                                            <th>Rubro</th>
                                            <th>Forma de Pago</th>
                                            <th className={styles.amountHeader}>Importe</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cobranzas.map((c) => (
                                            <tr key={c.Id}>
                                                <td>{formatFecha(c.FechaPago)}</td>
                                                <td className={styles.muted}>{c.NroRecibo}</td>
                                                <td>{c.CI}</td>
                                                <td className={styles.muted}>{formatMesAnio(c.Mes)}</td>
                                                <td>{c.RubDsc?.trim?.() || c.RubDsc || '-'}</td>
                                                <td>{c.FormaPago?.trim?.() || c.FormaPago || '-'}</td>
                                                <td className={styles.amountCell}>{formatCurrency(c.Importe)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (
                                <div className={styles.pagination}>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className={styles.pageButton}
                                        onClick={handlePrevious}
                                        disabled={page === 1}
                                    >
                                        Anterior
                                    </Button>
                                    <span className={styles.pageIndicator}>Página {page} de {totalPages}</span>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className={styles.pageButton}
                                        onClick={handleNext}
                                        disabled={page === totalPages}
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default InformeCobranzaPeriodoPage;
