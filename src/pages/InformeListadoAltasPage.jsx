import { useState, useEffect, useCallback } from 'react';
import { getListadoAltas } from '../services/api';
import { PageHeader, BackLink, Button } from '../components/ui';
import { formatFecha } from '../utils/date';
import styles from './InformeMovimientosAnuladosPage.module.css'; // Misma estructura que el informe de Movimientos Anulados, se reutiliza el CSS

const ExportIcon = (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const trim = (value) => (value || '').toString().trim();

const toIsoDate = (d) => d.toISOString().slice(0, 10);
const getDefaultFechaDesde = () => {
    const d = new Date();
    d.setDate(1);
    return toIsoDate(d);
};
const getDefaultFechaHasta = () => toIsoDate(new Date());

// Informe "Listado de Altas". Consume GET /socios/altas?fechaDesde=&fechaHasta=,
// que no pagina: trae de una todos los socios cuyo ingreso (SocFchIng) cae
// dentro del rango pedido.
const InformeListadoAltasPage = ({ showToast }) => {
    const [fechaDesde, setFechaDesde] = useState(getDefaultFechaDesde());
    const [fechaHasta, setFechaHasta] = useState(getDefaultFechaHasta());
    const [socios, setSocios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);

    const rangoInvalido = fechaDesde && fechaHasta && fechaDesde > fechaHasta;

    const load = useCallback(async () => {
        if (!fechaDesde || !fechaHasta || rangoInvalido) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getListadoAltas(fechaDesde, fechaHasta);
            setSocios(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading listado de altas:', err);
            const mensaje = err.response?.data?.error || 'Error al cargar el listado de altas';
            setError(mensaje);
            setSocios([]);
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
            const { exportListadoAltas } = await import('../services/api');
            const blob = await exportListadoAltas(fechaDesde, fechaHasta);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `listado_altas_${fechaDesde}_a_${fechaHasta}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Error exporting listado de altas:', err);
            const mensaje = err.response?.data?.error || 'Error al exportar el listado de altas';
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
                title="Listado de Altas"
                subtitle="Socios ingresados dentro del rango de fechas seleccionado"
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
                        {socios.length} alta{socios.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {rangoInvalido ? (
                <p className={styles.error}>La fecha "Desde" no puede ser posterior a la fecha "Hasta".</p>
            ) : error ? (
                <p className={styles.error}>{error}</p>
            ) : loading ? (
                <p className={styles.noData}>Cargando listado de altas...</p>
            ) : socios.length === 0 ? (
                <p className={styles.noData}>No hay altas registradas en ese período.</p>
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
                                    <th>Fecha de Nacimiento</th>
                                    <th>Email</th>
                                    <th>Celular</th>
                                    <th>Fecha de Ingreso</th>
                                </tr>
                            </thead>
                            <tbody>
                                {socios.map((s, idx) => (
                                    <tr key={`${s.SocDocIde}-${idx}`}>
                                        <td className={`${styles.muted} ${styles.nowrap}`}>{s.SocDocIde}</td>
                                        <td className={styles.nameCell}>{trim(s.SocNom) || '-'}</td>
                                        <td className={styles.nowrap}>{formatFecha(s.SocFchNac)}</td>
                                        <td>{trim(s.SocEMail) || '-'}</td>
                                        <td className={styles.nowrap}>{trim(s.SocTelCel) || '-'}</td>
                                        <td className={styles.nowrap}>{formatFecha(s.SocFchIng)}</td>
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

export default InformeListadoAltasPage;
