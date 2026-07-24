import { useState, useEffect, useCallback } from 'react';
import { getSociosDeudasPorRubro, fetchItems } from '../services/api';
import { PageHeader, BackLink } from '../components/ui';
import styles from './SociosPage.module.css'; // Reutiliza los estilos base de SociosPage
import localStyles from './InformeSociosDeudasPorCategoriaPage.module.css'; // Mismo look que el informe por categoría

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(amount || 0);
};

// Informe "Deuda por Rubro". Consume GET /socios/deudas/por-rubro, que
// agrupa la deuda de todos los socios que matchean el filtro (no solo una
// página) por rubro (concepto del movimiento pendiente). Admite los mismos
// filtros que /socios/deudas: search, categoria, radio, fechaDesde,
// fechaHasta.
const InformeSociosDeudasPorRubroPage = ({ showToast }) => {
    const [filters, setFilters] = useState({
        search: '',
        categoria: '',
        radio: '',
        fechaDesde: '',
        fechaHasta: ''
    });
    const [categorias, setCategorias] = useState([]);
    const [radios, setRadios] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Load filtros (categoría, radio)
    useEffect(() => {
        const loadFiltros = async () => {
            try {
                const [catsData, radiosData] = await Promise.all([
                    fetchItems('categoriaSocios'),
                    fetchItems('radios')
                ]);
                setCategorias(Array.isArray(catsData) ? catsData : []);
                setRadios(Array.isArray(radiosData) ? radiosData : []);
            } catch (err) {
                console.error('Error loading filtros:', err);
                showToast?.('Error al cargar filtros', 'error');
            }
        };
        loadFiltros();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Debounce del texto de búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.search);
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.search]);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getSociosDeudasPorRubro(debouncedSearch, filters.categoria, filters.radio, filters.fechaDesde, filters.fechaHasta);
            setItems(Array.isArray(data.items) ? data.items : []);
        } catch (err) {
            console.error('Error loading deuda por rubro:', err);
            const mensaje = err.response?.data?.error || 'Error al cargar la deuda por rubro';
            setError(mensaje);
            setItems([]);
            showToast?.(mensaje, 'error');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, filters.categoria, filters.radio, filters.fechaDesde, filters.fechaHasta]);

    useEffect(() => {
        load();
    }, [load]);

    const totalGeneral = items.reduce((acc, it) => acc + (it.Total || 0), 0);
    const isFiltered = filters.search || filters.categoria || filters.radio || filters.fechaDesde || filters.fechaHasta;

    return (
        <div className={styles.page}>
            <BackLink to="/utilidades">Volver a Utilidades</BackLink>

            <PageHeader
                title="Deuda por Rubro"
                subtitle="Suma de la deuda pendiente de los socios, agrupada por rubro"
            />

            <div className={styles.filtersCard}>
                <div className={styles.searchBox}>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, cédula o número de socio"
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                    {filters.search && (
                        <button
                            type="button"
                            className={styles.clearButton}
                            onClick={() => {
                                setFilters(prev => ({ ...prev, search: '' }));
                                setDebouncedSearch('');
                            }}
                            title="Limpiar búsqueda"
                            aria-label="Limpiar búsqueda"
                        >
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>

                <div className={styles.filtersRow}>
                    <div className={styles.filterGroup}>
                        <select
                            value={filters.categoria}
                            onChange={(e) => setFilters(prev => ({ ...prev, categoria: e.target.value }))}
                            className={styles.filterSelect}
                        >
                            <option value="">Todas las categorías</option>
                            {categorias.map(cat => (
                                <option key={cat.CatCod} value={cat.CatCod}>
                                    {cat.CatNom}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filters.radio}
                            onChange={(e) => setFilters(prev => ({ ...prev, radio: e.target.value }))}
                            className={styles.filterSelect}
                        >
                            <option value="">Todos los radios</option>
                            {radios.map(radio => (
                                <option key={radio.IdRadio} value={radio.IdRadio}>
                                    {radio.Nombre}
                                </option>
                            ))}
                        </select>

                        <div className={localStyles.dateFilterGroup}>
                            <label htmlFor="fechaDesde">Desde</label>
                            <input
                                type="date"
                                id="fechaDesde"
                                className={localStyles.dateInput}
                                value={filters.fechaDesde}
                                onChange={(e) => setFilters(prev => ({ ...prev, fechaDesde: e.target.value }))}
                            />
                        </div>

                        <div className={localStyles.dateFilterGroup}>
                            <label htmlFor="fechaHasta">Hasta</label>
                            <input
                                type="date"
                                id="fechaHasta"
                                className={localStyles.dateInput}
                                value={filters.fechaHasta}
                                onChange={(e) => setFilters(prev => ({ ...prev, fechaHasta: e.target.value }))}
                            />
                        </div>

                        {isFiltered && (
                            <button
                                type="button"
                                className={localStyles.clearFiltersButton}
                                onClick={() => {
                                    setFilters({ search: '', categoria: '', radio: '', fechaDesde: '', fechaHasta: '' });
                                    setDebouncedSearch('');
                                }}
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>

                    <div className={localStyles.deudaPill}>
                        Deuda total: {formatCurrency(totalGeneral)}
                    </div>
                </div>
            </div>

            {error ? (
                <p className={localStyles.error}>{error}</p>
            ) : loading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando deuda por rubro...</p>
                </div>
            ) : items.length === 0 ? (
                <p className={localStyles.noData}>No hay deuda registrada para el filtro seleccionado.</p>
            ) : (
                <div className={localStyles.tableContainer}>
                    <table className={localStyles.table}>
                        <thead>
                            <tr>
                                <th>Rubro</th>
                                <th className={localStyles.amountHeader}>Deuda</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((it) => (
                                <tr key={it.Rubro}>
                                    <td className={localStyles.nameCell}>{it.RubroDescripcion?.trim?.() || it.RubroDescripcion || `Rubro ${it.Rubro}`}</td>
                                    <td className={localStyles.amountCell}>{formatCurrency(it.Total)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td>Total general</td>
                                <td className={localStyles.amountCell}>{formatCurrency(totalGeneral)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    );
};

export default InformeSociosDeudasPorRubroPage;
