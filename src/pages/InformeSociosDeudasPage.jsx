import { useState, useEffect } from 'react';
import { getSociosDeudas, fetchItems } from '../services/api';
import SociosDeudasTable from '../components/SociosDeudasTable/SociosDeudasTable';
import { Button, PageHeader, BackLink } from '../components/ui';
import styles from './SociosPage.module.css'; // Reutiliza los estilos base de SociosPage
import localStyles from './InformeSociosDeudasPage.module.css';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(amount || 0);
};

// Informe "Listado de socios y sus deudas". Consume GET /socios/deudas, que
// pagina igual que /socios ({ items, total, page, limit, totalPages }): el
// corte se hace en la consulta SQL, no acá, así que sigue siendo liviano
// con miles de socios. Cada socio de la página trae su detalle de
// movimientos pendientes en DetalleDeuda, así que expandir una fila en la
// tabla no dispara ningún pedido nuevo.
const InformeSociosDeudasPage = ({ showToast }) => {
    const [socios, setSocios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        categoria: '',
        radio: ''
    });
    const [categorias, setCategorias] = useState([]);
    const [radios, setRadios] = useState([]);

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit] = useState(50);

    // Texto de búsqueda "asentado" tras el debounce (separado de filters.search,
    // que se actualiza en cada tecla para que el input se sienta responsivo).
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Load filters data
    useEffect(() => {
        const loadFilters = async () => {
            try {
                const [catsData, radiosData] = await Promise.all([
                    fetchItems('categoriaSocios'),
                    fetchItems('radios')
                ]);
                setCategorias(Array.isArray(catsData) ? catsData : []);
                setRadios(Array.isArray(radiosData) ? radiosData : []);
            } catch (error) {
                console.error('Error loading filters:', error);
                showToast?.('Error al cargar filtros', 'error');
            }
        };
        loadFilters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Debounce: solo el texto de búsqueda necesita esperar a que el usuario
    // termine de tipear. Categoría/radio son clicks discretos, no hace falta.
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.search);
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.search]);

    // Cada vez que cambia algún filtro "efectivo", volvemos a la página 1.
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, filters.categoria, filters.radio]);

    // Única fuente de carga de datos: reacciona a la página o a los filtros
    // ya resueltos.
    useEffect(() => {
        loadSocios(page, debouncedSearch, filters.categoria, filters.radio);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, debouncedSearch, filters.categoria, filters.radio]);

    const loadSocios = async (currentPage, search, cat, rad) => {
        setLoading(true);
        try {
            const data = await getSociosDeudas(currentPage, limit, search, cat, rad);
            setSocios(data.items || []);
            setTotalPages(data.totalPages || 1);
            setTotalItems(data.total || 0);
        } catch (err) {
            console.error('Error loading socios y sus deudas:', err);
            showToast?.('Error al cargar el listado de socios y sus deudas', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePrevious = () => {
        if (page > 1) setPage(prev => prev - 1);
    };

    const handleNext = () => {
        if (page < totalPages) setPage(prev => prev + 1);
    };

    // La deuda total solo puede sumarse sobre los socios de la página
    // actual: el endpoint no expone un agregado sobre todo el resultado
    // filtrado, así que el pill se etiqueta explícitamente como "de esta
    // página" para no dar a entender que es un total global.
    const sociosConDeudaEnPagina = socios.filter((s) => (s.Deuda || 0) > 0).length;
    const deudaEnPagina = socios.reduce((acc, s) => acc + (s.Deuda || 0), 0);

    return (
        <div className={styles.page}>
            <BackLink to="/utilidades">Volver a Utilidades</BackLink>

            <PageHeader
                title="Listado de Socios y sus Deudas"
                subtitle="Consultá qué socios tienen movimientos pendientes de recibo y el detalle de cada uno"
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
                        onChange={(e) => {
                            setFilters(prev => ({ ...prev, search: e.target.value }));
                        }}
                    />
                    {filters.search && (
                        <button
                            type="button"
                            className={styles.clearButton}
                            onClick={() => {
                                setFilters(prev => ({ ...prev, search: '' }));
                                setDebouncedSearch('');
                                setPage(1);
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
                    </div>

                    <div className={localStyles.summaryGroup}>
                        <div className={styles.resultsCount}>
                            {totalItems} socio{totalItems !== 1 ? 's' : ''} · {sociosConDeudaEnPagina} con deuda en esta página
                        </div>
                        <div className={localStyles.deudaPill}>
                            Deuda de esta página: {formatCurrency(deudaEnPagina)}
                        </div>
                    </div>
                </div>
            </div>

            {
                loading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Cargando socios...</p>
                    </div>
                ) : (
                    <>
                        <SociosDeudasTable socios={socios} />

                        {/* Pagination Controls */}
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
                )
            }
        </div>
    );
};

export default InformeSociosDeudasPage;
