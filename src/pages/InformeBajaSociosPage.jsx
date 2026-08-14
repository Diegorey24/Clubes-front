import { useState, useEffect, useCallback } from 'react';
import { getBajaSocios, exportBajaSocios } from '../services/api';
import { PageHeader, BackLink, Button } from '../components/ui';
import styles from './InformeCumpleanosPage.module.css'; // Misma estructura que el informe de Cumpleaños, se reutiliza el CSS

// Trim seguro para campos char fijo que a veces llegan rellenados con
// espacios en blanco.
const trim = (value) => (value || '').toString().trim();

const DEFAULT_MESES = '2';

const ExportIcon = (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

// Informe "Candidatos a Baja". Consume POST /socios/baja-socios con
// cantidadMeses en el body: devuelve los socios con más de esa cantidad de
// meses impagos de cuota social (Rubro = 1), con nombre y celular para poder
// contactarlos.
const InformeBajaSociosPage = ({ showToast }) => {
    const [cantidadMeses, setCantidadMeses] = useState(DEFAULT_MESES);
    const [debouncedMeses, setDebouncedMeses] = useState(DEFAULT_MESES);
    const [socios, setSocios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);

    // Debounce del input numérico para no disparar un pedido por cada tecla.
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedMeses(cantidadMeses);
        }, 400);
        return () => clearTimeout(timer);
    }, [cantidadMeses]);

    const esValido = debouncedMeses !== '' && !Number.isNaN(Number(debouncedMeses));

    const load = useCallback(async () => {
        if (!esValido) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getBajaSocios(Number(debouncedMeses));
            setSocios(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading candidatos a baja:', err);
            const mensaje = err.response?.data?.error || 'Error al cargar los candidatos a baja';
            setError(mensaje);
            setSocios([]);
            showToast?.(mensaje, 'error');
        } finally {
            setLoading(false);
        }
    }, [debouncedMeses, esValido, showToast]);

    useEffect(() => {
        load();
    }, [load]);

    const handleExport = async () => {
        if (exporting || !esValido) return;
        setExporting(true);
        try {
            const blob = await exportBajaSocios(Number(debouncedMeses));
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'candidatos-a-baja.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Error exporting candidatos a baja:', err);
            showToast?.('Error al exportar el informe', 'error');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className={styles.page}>
            <BackLink to="/utilidades">Volver a Utilidades</BackLink>

            <PageHeader
                title="Candidatos a Baja"
                subtitle="Socios con más meses impagos de cuota social que el límite indicado, con sus datos de contacto"
                actions={
                    <Button
                        variant="soft-success"
                        icon={ExportIcon}
                        loading={exporting}
                        disabled={!esValido || loading || socios.length === 0}
                        onClick={handleExport}
                    >
                        {exporting ? 'Exportando...' : 'Exportar Excel'}
                    </Button>
                }
            />

            <div className={styles.filterBar}>
                <div className={styles.filterGroup}>
                    <label htmlFor="cantidadMeses">Meses impagos a controlar</label>
                    <input
                        type="number"
                        id="cantidadMeses"
                        min="0"
                        className={styles.input}
                        value={cantidadMeses}
                        onChange={(e) => setCantidadMeses(e.target.value)}
                    />
                </div>

                {!error && !loading && esValido && (
                    <div className={styles.resultsCount}>
                        {socios.length} socio{socios.length !== 1 ? 's' : ''} con más de {debouncedMeses} mes{Number(debouncedMeses) !== 1 ? 'es' : ''} impago{Number(debouncedMeses) !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {!esValido ? (
                <p className={styles.error}>Ingresá la cantidad de meses impagos a controlar.</p>
            ) : error ? (
                <p className={styles.error}>{error}</p>
            ) : loading ? (
                <p className={styles.noData}>Buscando candidatos a baja...</p>
            ) : socios.length === 0 ? (
                <p className={styles.noData}>No hay socios con más de {debouncedMeses} mes{Number(debouncedMeses) !== 1 ? 'es' : ''} impago{Number(debouncedMeses) !== 1 ? 's' : ''} de cuota social.</p>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Socio</th>
                                <th>Meses Impagos</th>
                                <th>Celular</th>
                            </tr>
                        </thead>
                        <tbody>
                            {socios.map((socio) => (
                                <tr key={socio.CI}>
                                    <td className={styles.nameCell}>
                                        <span className={styles.socioNombre}>{trim(socio.SocNom)}</span>
                                        <div className={styles.muted}>CI {socio.CI}</div>
                                    </td>
                                    <td>{socio.mesesImpagos}</td>
                                    <td className={styles.muted}>{trim(socio.SocTelCel) || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default InformeBajaSociosPage;
