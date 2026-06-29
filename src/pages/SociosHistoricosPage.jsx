import { useState, useEffect } from 'react';
import { getSociosHistoricos, fetchItems } from '../services/api';
import SociosTable from '../components/SociosTable/SociosTable';
import styles from './SociosPage.module.css'; // Reusing styles

const SociosHistoricosPage = ({ showToast }) => {
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
    const [limit] = useState(10);

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

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1); // Reset to page 1 on search change
            loadSocios(1, filters.search, filters.categoria, filters.radio);
        }, 500);

        return () => clearTimeout(timer);
    }, [filters, page]);

    const loadSocios = async (currentPage, search, cat, rad) => {
        setLoading(true);
        try {
            const data = await getSociosHistoricos(currentPage, limit, search, cat, rad);
            setSocios(data.items || []);
            setTotalPages(data.totalPages || 1);
            setTotalItems(data.total || 0);
        } catch (err) {
            console.error('Error loading socios historicos:', err);
            showToast('Error al cargar la lista de socios históricos', 'error');
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

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2 className={styles.title}>Socios Históricos</h2>
            </div>

            <div className={styles.filters}>
                <div className={styles.searchBox}>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o cédula..."
                        value={filters.search}
                        onChange={(e) => {
                            const val = e.target.value;
                            setFilters(prev => ({ ...prev, search: val }));
                            setPage(1);
                        }}
                    />
                    {filters.search && (
                        <button
                            className={styles.clearButton}
                            onClick={() => {
                                setFilters(prev => ({ ...prev, search: '' }));
                                setPage(1);
                            }}
                            title="Limpiar búsqueda"
                        >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>

                <div className={styles.filterGroup}>
                    <select
                        value={filters.categoria}
                        onChange={(e) => setFilters(prev => ({ ...prev, categoria: e.target.value, page: 1 }))}
                        className={styles.filterSelect}
                    >
                        <option value="">Todas las Categorías</option>
                        {categorias.map(cat => (
                            <option key={cat.CatCod} value={cat.CatCod}>
                                {cat.CatNom}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.radio}
                        onChange={(e) => setFilters(prev => ({ ...prev, radio: e.target.value, page: 1 }))}
                        className={styles.filterSelect}
                    >
                        <option value="">Todos los Radios</option>
                        {radios.map(radio => (
                            <option key={radio.IdRadio} value={radio.IdRadio}>
                                {radio.Nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    className={styles.exportButton}
                    onClick={async () => {
                        try {
                            const { exportSociosHistoricos } = await import('../services/api');
                            const blob = await exportSociosHistoricos(filters);
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'socios_historicos.xlsx';
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                        } catch (error) {
                            console.error('Error exporting:', error);
                            showToast('Error al exportar datos', 'error');
                        }
                    }}
                >
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exportar Excel
                </button>

                <div className={styles.resultsCount}>
                    {totalItems} socio{totalItems !== 1 ? 's' : ''} registrado{totalItems !== 1 ? 's' : ''}
                </div>
            </div>

            {
                loading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Cargando socios históricos...</p>
                    </div>
                ) : (
                    <>
                        <SociosTable
                            socios={socios}
                            readOnly={true}
                            detailPath="/socios-historicos"
                        />

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className={styles.pagination}>
                                <button
                                    onClick={handlePrevious}
                                    disabled={page === 1}
                                    className={styles.pageButton}
                                >
                                    Anterior
                                </button>
                                <span>Página {page} de {totalPages}</span>
                                <button
                                    onClick={handleNext}
                                    disabled={page === totalPages}
                                    className={styles.pageButton}
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </>
                )
            }
        </div >
    );
};

export default SociosHistoricosPage;
