import { useState, useEffect, useCallback } from 'react';
import { getHabilitadosVotar, fetchItems } from '../services/api';
import { PageHeader, BackLink } from '../components/ui';
import { formatFecha } from '../utils/date';
import styles from './InformeCumpleanosPage.module.css'; // Layout general (page, filterBar, tabla), igual que el resto de los informes
import localStyles from './InformeHabilitadosVotarPage.module.css'; // Chips de categorías a excluir, propios de este informe

const toIsoDate = (d) => d.toISOString().slice(0, 10);
const getDefaultFecha = () => toIsoDate(new Date());
const getDefaultPeriodo = () => getDefaultFecha().slice(0, 7); // "AAAA-MM"

// value viene como "AAAA-MM" del input type=month
const periodoToAniomes = (value) => Number(value.replace('-', ''));

// Trim seguro para campos char fijo que a veces llegan rellenados con espacios.
const trim = (value) => (value || '').toString().trim();

// Informe "Habilitados a Votar". Consume POST /socios/habilitados-votar:
// socios mayores a "edadMin" años (calculado a "fecha"), con más antigüedad
// que "valor" (en meses o años según "tipo"), que hayan pagado la cuota del
// mes seleccionado y cuya categoría no esté entre las excluidas.
const InformeHabilitadosVotarPage = ({ showToast }) => {
    const [fecha, setFecha] = useState(getDefaultFecha());
    const [periodo, setPeriodo] = useState(getDefaultPeriodo());
    const [edadMin, setEdadMin] = useState('18');
    const [tipo, setTipo] = useState('anios');
    const [valor, setValor] = useState('1');
    const [categorias, setCategorias] = useState([]);
    const [catCodExcluidos, setCatCodExcluidos] = useState([]);

    const [socios, setSocios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Categorías disponibles, para armar los chips de exclusión.
    useEffect(() => {
        const loadCategorias = async () => {
            try {
                const data = await fetchItems('categoriaSocios');
                setCategorias(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error loading categorías:', err);
                showToast?.('Error al cargar las categorías', 'error');
            }
        };
        loadCategorias();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleCategoria = (catCod) => {
        setCatCodExcluidos((prev) =>
            prev.includes(catCod) ? prev.filter((c) => c !== catCod) : [...prev, catCod]
        );
    };

    const esValido = fecha && periodo && edadMin !== '' && valor !== '' && !Number.isNaN(Number(edadMin)) && !Number.isNaN(Number(valor));

    const load = useCallback(async () => {
        if (!esValido) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getHabilitadosVotar({
                fecha,
                aniomes: periodoToAniomes(periodo),
                edadMin: Number(edadMin),
                tipo,
                valor: Number(valor),
                catCodExcluidos,
            });
            setSocios(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading habilitados a votar:', err);
            const mensaje = err.response?.data?.error || 'Error al cargar los habilitados a votar';
            setError(mensaje);
            setSocios([]);
            showToast?.(mensaje, 'error');
        } finally {
            setLoading(false);
        }
    }, [esValido, fecha, periodo, edadMin, tipo, valor, catCodExcluidos, showToast]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className={styles.page}>
            <BackLink to="/utilidades">Volver a Utilidades</BackLink>

            <PageHeader
                title="Habilitados a Votar"
                subtitle="Socios que cumplen la edad y antigüedad mínimas, y tienen la cuota del mes seleccionado al día"
            />

            <div className={localStyles.filtersCard}>
                <div className={localStyles.filtersRow}>
                    <div className={styles.filterGroup}>
                        <label htmlFor="fecha">Fecha de referencia</label>
                        <input
                            type="date"
                            id="fecha"
                            className={styles.input}
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label htmlFor="periodo">Mes de cuota pagada</label>
                        <input
                            type="month"
                            id="periodo"
                            className={styles.input}
                            value={periodo}
                            onChange={(e) => setPeriodo(e.target.value)}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label htmlFor="edadMin">Edad mínima</label>
                        <input
                            type="number"
                            id="edadMin"
                            min="0"
                            className={styles.input}
                            value={edadMin}
                            onChange={(e) => setEdadMin(e.target.value)}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label htmlFor="tipo">Antigüedad en</label>
                        <select
                            id="tipo"
                            className={styles.input}
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                        >
                            <option value="anios">Años</option>
                            <option value="meses">Meses</option>
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label htmlFor="valor">Antigüedad mínima</label>
                        <input
                            type="number"
                            id="valor"
                            min="0"
                            className={styles.input}
                            value={valor}
                            onChange={(e) => setValor(e.target.value)}
                        />
                    </div>

                    {!error && !loading && esValido && (
                        <div className={styles.resultsCount}>
                            {socios.length} socio{socios.length !== 1 ? 's' : ''} habilitado{socios.length !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>

                {categorias.length > 0 && (
                    <div className={localStyles.categoriasGroup}>
                        <label>Excluir categorías</label>
                        <div className={localStyles.categoriasChips}>
                            {categorias.map((cat) => {
                                const activa = catCodExcluidos.includes(cat.CatCod);
                                return (
                                    <label
                                        key={cat.CatCod}
                                        className={`${localStyles.categoriaChip} ${activa ? localStyles.categoriaChipActive : ''}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={activa}
                                            onChange={() => toggleCategoria(cat.CatCod)}
                                        />
                                        {cat.CatNom}
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {!esValido ? (
                <p className={styles.error}>Completá la fecha, el mes de cuota, la edad mínima y la antigüedad mínima.</p>
            ) : error ? (
                <p className={styles.error}>{error}</p>
            ) : loading ? (
                <p className={styles.noData}>Buscando habilitados a votar...</p>
            ) : socios.length === 0 ? (
                <p className={styles.noData}>No hay socios habilitados a votar con los filtros seleccionados.</p>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Socio</th>
                                <th>Fecha de Nacimiento</th>
                                <th>Edad</th>
                                <th>Antigüedad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {socios.map((socio, index) => (
                                <tr key={`${socio.SocNom}-${socio.SocFchNac}-${index}`}>
                                    <td className={styles.nameCell}>{trim(socio.SocNom)}</td>
                                    <td className={styles.muted}>{formatFecha(socio.SocFchNac)}</td>
                                    <td>{socio.Edad}</td>
                                    <td className={styles.muted}>{socio.Antiguedad}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default InformeHabilitadosVotarPage;
