import { useState, useEffect } from 'react';
import { getSocios, fetchItems } from '../services/api';
import SociosTable from '../components/SociosTable/SociosTable';
import { Button, PageHeader, BackLink } from '../components/ui';
import styles from './SociosPage.module.css'; // Reutiliza los estilos de SociosPage

const ExportIcon = (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

// Informe "Listado de socios con datos de contacto": misma base que
// SociosPage (mismos filtros, misma tabla, mismo detalle al hacer clic en
// una fila), pero sin las acciones de alta/edición/baja de esa page. Acá
// arriba solo hay una acción: exportar el Excel del informe.
const InformeSociosContactoPage = ({ showToast }) => {
    const [socios, setSocios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
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
                showToast('Error al cargar filtros', 'error');
            }
        };
        loadFilters();
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
            const data = await getSocios(currentPage, limit, search, cat, rad);
            setSocios(data.items || []);
            setTotalPages(data.totalPages || 1);
            setTotalItems(data.total || 0);
        } catch (err) {
            console.error('Error loading socios:', err);
            showToast('Error al cargar la lista de socios', 'error');
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

    const handleExport = async () => {
        if (exporting) return;
        setExporting(true);
        try {
            const { exportSociosContacto } = await import('../services/api');
            const blob = await exportSociosContacto(filters);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'socios_contacto.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error exporting:', error);
            showToast('Error al exportar el informe', 'error');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className={styles.page}>
            <BackLink to="/utilidades">Volver a Utilidades</BackLink>

            <PageHeader
                title="Listado de Socios con Datos de Contacto"
                subtitle="Socios activos con su información de contacto, lista para exportar"
                actions={
                    <Button
                        variant="soft-success"
                        icon={ExportIcon}
                        loading={exporting}
                        onClick={handleExport}
                    >
                        {exporting ? 'Exportando...' : 'Exportar Excel'}
                    </Button>
                }
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

                    <div className={styles.resultsCount}>
                        {totalItems} socio{totalItems !== 1 ? 's' : ''} registrado{totalItems !== 1 ? 's' : ''}
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
                        <SociosTable
                            socios={socios}
                            readOnly={true}
                            detailPath="/socios"
                        />

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

export default InformeSociosContactoPage;
