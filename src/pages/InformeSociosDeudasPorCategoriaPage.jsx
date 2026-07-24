import { useState, useEffect, useCallback } from 'react';
import { getSociosDeudasPorCategoria, fetchItems } from '../services/api';
import { PageHeader, BackLink } from '../components/ui';
import styles from './SociosPage.module.css'; // Reutiliza los estilos base de SociosPage
import localStyles from './InformeSociosDeudasPorCategoriaPage.module.css';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(amount || 0);
};

// Informe "Deuda por Categoría". Consume GET /socios/deudas/por-categoria,
// que agrupa la deuda de todos los socios que matchean el filtro (no solo
// una página) por categoría. No admite el filtro "categoria": es justamente
// el campo por el que agrupa.
const InformeSociosDeudasPorCategoriaPage = ({ showToast }) => {
    const [filters, setFilters] = useState({
        search: '',
        radio: '',
        fechaDesde: '',
        fechaHasta: ''
    });
    const [radios, setRadios] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Load filtro de radios
    useEffect(() => {
        const loadRadios = async () => {
            try {
                const radiosData = await fetchItems('radios');
                setRadios(Array.isArray(radiosData) ? radiosData : []);
            } catch (err) {
                console.error('Error loading radios:', err);
                showToast?.('Error al cargar filtros', 'error');
            }
        };
        loadRadios();
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
            const data = await getSociosDeudasPorCategoria(debouncedSearch, filters.radio, filters.fechaDesde, filters.fechaHasta);
            setItems(Array.isArray(data.items) ? data.items : []);
        } catch (err) {
            console.error('Error loading deuda por categoría:', err);
            const mensaje = err.response?.data?.error || 'Error al cargar la deuda por categoría';
            setError(mensaje);
            setItems([]);
            showToast?.(mensaje, 'error');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, filters.radio, filters.fechaDesde, filters.fechaHasta]);

    useEffect(() => {
        load();
    }, [load]);

    const totalGeneral = items.reduce((acc, it) => acc + (it.Total || 0), 0);
    const isFiltered = filters.search || filters.radio || filters.fechaDesde || filters.fechaHasta;

    return (
        <div className={styles.page}>
            <BackLink to="/utilidades">Volver a Utilidades</BackLink>

            <PageHeader
                title="Deuda por Categoría"
                subtitle="Suma de la deuda pendiente de los socios, agrupada por categoría"
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
                                    setFilters({ search: '', radio: '', fechaDesde: '', fechaHasta: '' });
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
                    <p>Cargando deuda por categoría...</p>
                </div>
            ) : items.length === 0 ? (
                <p className={localStyles.noData}>No hay deuda registrada para el filtro seleccionado.</p>
            ) : (
                <div className={localStyles.tableContainer}>
                    <table className={localStyles.table}>
                        <thead>
                            <tr>
                                <th>Categoría</th>
                                <th className={localStyles.amountHeader}>Deuda</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((it) => (
                                <tr key={it.CatCod}>
                                    <td className={localStyles.nameCell}>{it.Categoria}</td>
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

export default InformeSociosDeudasPorCategoriaPage;
