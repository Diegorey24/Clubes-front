import { useState, useEffect, useCallback } from 'react';
import { getSociosDeudasPlanilla, exportSociosDeudasPlanilla, fetchItems } from '../services/api';
import { Button, PageHeader, BackLink } from '../components/ui';
import styles from './InformePlanillaSociosPage.module.css';

// Descarga un blob ya recibido con el nombre de archivo indicado.
const descargarBlob = (blob, nombreArchivo) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(amount || 0);
};

const MESES_ABREV = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// El backend devuelve cada columna como Aniomes (AAAAMM, ej. 202601). Acá
// solo se formatea para mostrar, nunca se reconstruye una fecha real.
const formatAniomes = (aniomes) => {
    const s = String(aniomes);
    const year = s.slice(0, 4);
    const monthIdx = parseInt(s.slice(4, 6), 10) - 1;
    const mesNombre = MESES_ABREV[monthIdx] || s.slice(4, 6);
    return `${mesNombre} ${year}`;
};

const toIsoDate = (d) => d.toISOString().slice(0, 10);

// Por defecto se muestra el año en curso hasta hoy: suficiente para ver la
// planilla sin tener que elegir fechas a mano, y no trae de más.
const getDefaultFechaDesde = () => {
    const d = new Date();
    d.setMonth(0, 1);
    return toIsoDate(d);
};

const getDefaultFechaHasta = () => toIsoDate(new Date());

const SearchIcon = (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);

const ClearIcon = (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const ExportIcon = (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

// Cada celda de la planilla (un mes de un socio, o un total) trae tres
// datos: lo que se le generó (Adeudado), lo que ya pagó (Recibido) y lo
// que todavía debe (Pendiente). Se muestran apiladas para no perder
// ninguna, con un color fijo por dato (ver leyenda arriba de la tabla);
// "Pendiente" además se resalta en rojo y negrita cuando hay deuda real.
const MontoStack = ({ valores }) => {
    const { Adeudado = 0, Recibido = 0, Pendiente = 0 } = valores || {};
    const sinMovimiento = !Adeudado && !Recibido && !Pendiente;

    if (sinMovimiento) {
        return <span className={styles.montoVacio}>-</span>;
    }

    return (
        <div className={styles.montoStack}>
            <div className={`${styles.montoRow} ${styles.montoAdeudado}`}>
                <span className={styles.montoLabel}>Adeud.</span>
                <span>{formatCurrency(Adeudado)}</span>
            </div>
            <div className={`${styles.montoRow} ${styles.montoRecibido}`}>
                <span className={styles.montoLabel}>Recib.</span>
                <span>{formatCurrency(Recibido)}</span>
            </div>
            <div className={`${styles.montoRow} ${styles.montoPendiente} ${Pendiente > 0 ? styles.montoDeuda : ''}`}>
                <span className={styles.montoLabel}>Pend.</span>
                <span>{formatCurrency(Pendiente)}</span>
            </div>
        </div>
    );
};

// Vista "Importe": un solo número por celda. Si todavía debe algo ese mes
// se muestra en rojo lo pendiente; si no debe nada y hubo un cargo, se
// muestra en verde lo recibido (ya pagado). Sin movimiento, celda vacía.
const MontoImporte = ({ valores }) => {
    const { Adeudado = 0, Recibido = 0, Pendiente = 0 } = valores || {};
    const sinMovimiento = !Adeudado && !Recibido && !Pendiente;

    if (sinMovimiento) {
        return <span className={styles.montoVacio}>-</span>;
    }

    if (Pendiente > 0) {
        return <span className={styles.importePendiente}>{formatCurrency(Pendiente)}</span>;
    }

    return <span className={styles.importePagado}>{formatCurrency(Recibido)}</span>;
};

// Vista "Cruces": no importa el monto, solo si ese mes quedó saldado. Una
// cruz verde si se pagó todo lo generado; celda vacía si quedó algo
// pendiente o si directamente no hubo cargo ese mes.
const MontoCruz = ({ valores }) => {
    const { Adeudado = 0, Pendiente = 0 } = valores || {};
    const pagado = Adeudado > 0 && Pendiente === 0;

    if (!pagado) {
        return null;
    }

    return <span className={styles.cruzMarca} aria-label="Pagado">✕</span>;
};

// Suma tres objetos { Adeudado, Recibido, Pendiente } (para los totales de
// pie de tabla, que el backend no calcula porque cambian según la página).
const sumarValores = (acc, valores) => ({
    Adeudado: acc.Adeudado + (valores?.Adeudado || 0),
    Recibido: acc.Recibido + (valores?.Recibido || 0),
    Pendiente: acc.Pendiente + (valores?.Pendiente || 0)
});

const VALORES_VACIOS = { Adeudado: 0, Recibido: 0, Pendiente: 0 };

const getDefaultFilters = () => ({
    search: '',
    categoria: '',
    radio: '',
    rubro: '',
    soloConDeuda: false,
    fechaDesde: getDefaultFechaDesde(),
    fechaHasta: getDefaultFechaHasta()
});

// Informe "Planilla de Socios y Deudas". Consume GET /socios/deudas/planilla,
// que a diferencia de /socios/deudas pivotea el resultado: cada columna es
// un mes (Aniomes) dentro de [fechaDesde, fechaHasta] y cada celda trae
// { Adeudado, Recibido, Pendiente } para ese socio en ese mes. El backend
// pagina por socio ({ items, total, page, limit, totalPages }) igual que
// los demás informes, así que el costo por página es constante aunque el
// rango de fechas sea largo. Los totales por columna que se muestran en el
// pie de la tabla son solo de la página actual (el backend no expone un
// agregado global), por eso se etiquetan explícitamente como "de esta
// página" y siempre se muestran con el detalle completo, sin importar la
// vista elegida.
const InformePlanillaSociosPage = ({ showToast }) => {
    const [filters, setFilters] = useState(getDefaultFilters());
    const [categorias, setCategorias] = useState([]);
    const [radios, setRadios] = useState([]);
    const [rubros, setRubros] = useState([]);

    // Vista: cómo se presenta cada celda de la planilla. No es un filtro de
    // datos (no dispara un nuevo pedido al backend), solo cambia cómo se
    // renderiza lo que ya se cargó. "Importe" es la vista más usada, así
    // que arranca seleccionada por defecto.
    const [vista, setVista] = useState('importe');
    const [exportando, setExportando] = useState(false);

    const [meses, setMeses] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit] = useState(50);

    const [debouncedSearch, setDebouncedSearch] = useState('');

    const rangoInvalido = filters.fechaDesde && filters.fechaHasta && filters.fechaDesde > filters.fechaHasta;
    const rangoIncompleto = !filters.fechaDesde || !filters.fechaHasta;

    // Load filtros (categoría, radio, rubro)
    useEffect(() => {
        const loadFiltros = async () => {
            try {
                const [catsData, radiosData, rubrosData] = await Promise.all([
                    fetchItems('categoriaSocios'),
                    fetchItems('radios'),
                    fetchItems('rubros')
                ]);
                setCategorias(Array.isArray(catsData) ? catsData : []);
                setRadios(Array.isArray(radiosData) ? radiosData : []);
                setRubros(Array.isArray(rubrosData) ? rubrosData : []);
            } catch (err) {
                console.error('Error loading filtros:', err);
                showToast?.('Error al cargar filtros', 'error');
            }
        };
        loadFiltros();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Debounce: solo el texto de búsqueda necesita esperar a que el usuario
    // termine de tipear.
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.search);
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.search]);

    // Cada vez que cambia algún filtro "efectivo", volvemos a la página 1.
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, filters.categoria, filters.radio, filters.rubro, filters.soloConDeuda, filters.fechaDesde, filters.fechaHasta]);

    const load = useCallback(async () => {
        if (rangoIncompleto || rangoInvalido) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getSociosDeudasPlanilla(
                page,
                limit,
                filters.fechaDesde,
                filters.fechaHasta,
                debouncedSearch,
                filters.categoria,
                filters.radio,
                filters.soloConDeuda,
                filters.rubro
            );
            setMeses(Array.isArray(data.meses) ? data.meses : []);
            setItems(Array.isArray(data.items) ? data.items : []);
            setTotalPages(data.totalPages || 1);
            setTotalItems(data.total || 0);
        } catch (err) {
            console.error('Error loading planilla de socios y deudas:', err);
            const mensaje = err.response?.data?.error || 'Error al cargar la planilla de socios y deudas';
            setError(mensaje);
            setMeses([]);
            setItems([]);
            setTotalPages(1);
            setTotalItems(0);
            showToast?.(mensaje, 'error');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit, debouncedSearch, filters.categoria, filters.radio, filters.rubro, filters.soloConDeuda, filters.fechaDesde, filters.fechaHasta, rangoIncompleto, rangoInvalido]);

    useEffect(() => {
        load();
    }, [load]);

    const handlePrevious = () => {
        if (page > 1) setPage(prev => prev - 1);
    };

    const handleNext = () => {
        if (page < totalPages) setPage(prev => prev + 1);
    };

    const handleLimpiar = () => {
        setFilters(getDefaultFilters());
    };

    const handleExport = async () => {
        if (exportando || rangoIncompleto || rangoInvalido) return;
        setExportando(true);
        try {
            const blob = await exportSociosDeudasPlanilla(
                filters.fechaDesde,
                filters.fechaHasta,
                debouncedSearch,
                filters.categoria,
                filters.radio,
                filters.soloConDeuda,
                filters.rubro,
                vista
            );
            descargarBlob(blob, `planilla_socios_deudas_${vista}.xlsx`);
        } catch (err) {
            console.error('Error exporting planilla de socios y deudas:', err);
            const mensaje = err.response?.data?.error || 'Error al exportar la planilla de socios y deudas';
            showToast?.(mensaje, 'error');
        } finally {
            setExportando(false);
        }
    };

    const isFiltered = filters.search || filters.categoria || filters.radio || filters.rubro || filters.soloConDeuda
        || filters.fechaDesde !== getDefaultFechaDesde() || filters.fechaHasta !== getDefaultFechaHasta();

    // Totales por columna (mes) y total general, solo de los socios de la
    // página actual. Cada celda es { Adeudado, Recibido, Pendiente }, así
    // que se suman los tres valores por separado.
    const totalesPorMes = meses.reduce((acc, mes) => {
        acc[mes] = items.reduce((sum, item) => sumarValores(sum, item.PorMes?.[mes]), { ...VALORES_VACIOS });
        return acc;
    }, {});
    const totalGeneralPagina = items.reduce((sum, item) => sumarValores(sum, item.Total), { ...VALORES_VACIOS });

    return (
        <div className={styles.page}>
            <BackLink to="/utilidades">Volver a Utilidades</BackLink>

            <PageHeader
                title="Planilla de Socios y Deudas"
                subtitle="Importes adeudados por cada socio, mes a mes, dentro del rango seleccionado"
            />

            <div className={styles.filtersCard}>
                <div className={styles.searchBox}>
                    {SearchIcon}
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
                            onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                            title="Limpiar búsqueda"
                            aria-label="Limpiar búsqueda"
                        >
                            {ClearIcon}
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

                        <select
                            value={filters.rubro}
                            onChange={(e) => setFilters(prev => ({ ...prev, rubro: e.target.value }))}
                            className={styles.filterSelect}
                        >
                            <option value="">Todos los rubros</option>
                            {rubros.map(rubro => (
                                <option key={rubro.IdRubro} value={rubro.IdRubro}>
                                    {rubro.Nombre?.trim?.() || rubro.Nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {!rangoInvalido && !rangoIncompleto && (
                        <div className={styles.resultsCount}>
                            {totalItems} socio{totalItems !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>

                <div className={styles.dateFiltersRow}>
                    <div className={styles.dateFilterGroup}>
                        <label htmlFor="fechaDesde">Desde</label>
                        <input
                            type="date"
                            id="fechaDesde"
                            className={styles.dateInput}
                            value={filters.fechaDesde}
                            onChange={(e) => setFilters(prev => ({ ...prev, fechaDesde: e.target.value }))}
                        />
                    </div>

                    <div className={styles.dateFilterGroup}>
                        <label htmlFor="fechaHasta">Hasta</label>
                        <input
                            type="date"
                            id="fechaHasta"
                            className={styles.dateInput}
                            value={filters.fechaHasta}
                            onChange={(e) => setFilters(prev => ({ ...prev, fechaHasta: e.target.value }))}
                        />
                    </div>

                    <div className={styles.checkboxGroup}>
                        <input
                            type="checkbox"
                            id="soloConDeuda"
                            checked={filters.soloConDeuda}
                            onChange={(e) => setFilters(prev => ({ ...prev, soloConDeuda: e.target.checked }))}
                        />
                        <label htmlFor="soloConDeuda">Solo socios con deuda pendiente</label>
                    </div>

                    <div className={styles.dateFilterGroup}>
                        <label htmlFor="vista">Vista</label>
                        <select
                            id="vista"
                            className={styles.vistaSelect}
                            value={vista}
                            onChange={(e) => setVista(e.target.value)}
                        >
                            <option value="importe">Importe</option>
                            <option value="cruces">Cruces</option>
                            <option value="detalle">Detalle</option>
                        </select>
                    </div>

                    {isFiltered && (
                        <Button variant="ghost" size="sm" onClick={handleLimpiar}>
                            Limpiar filtros
                        </Button>
                    )}
                </div>
            </div>

            {rangoIncompleto ? (
                <p className={styles.error}>Seleccioná una fecha "Desde" y una fecha "Hasta" para armar la planilla.</p>
            ) : rangoInvalido ? (
                <p className={styles.error}>La fecha "Desde" no puede ser posterior a la fecha "Hasta".</p>
            ) : error ? (
                <p className={styles.error}>{error}</p>
            ) : loading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando planilla...</p>
                </div>
            ) : items.length === 0 ? (
                <p className={styles.noData}>No hay socios que coincidan con los filtros seleccionados.</p>
            ) : (
                <>
                    <div className={styles.legendRow}>
                        <div className={styles.legend}>
                            {vista === 'detalle' && (
                                <>
                                    <span className={styles.legendItem}>
                                        <span className={`${styles.legendDot} ${styles.adeudado}`}></span>
                                        Adeudado
                                    </span>
                                    <span className={styles.legendItem}>
                                        <span className={`${styles.legendDot} ${styles.recibido}`}></span>
                                        Recibido
                                    </span>
                                    <span className={styles.legendItem}>
                                        <span className={`${styles.legendDot} ${styles.pendiente}`}></span>
                                        Pendiente
                                    </span>
                                </>
                            )}
                            {vista === 'importe' && (
                                <>
                                    <span className={styles.legendItem}>
                                        <span className={`${styles.legendDot} ${styles.recibido}`}></span>
                                        Verde: ya pagado
                                    </span>
                                    <span className={styles.legendItem}>
                                        <span className={`${styles.legendDot} ${styles.pendiente}`}></span>
                                        Rojo: pendiente de pago
                                    </span>
                                </>
                            )}
                            {vista === 'cruces' && (
                                <span className={styles.legendItem}>
                                    <span className={styles.cruzMarca}>✕</span>
                                    El mes está saldado · celda vacía: pendiente o sin cargo
                                </span>
                            )}
                        </div>

                        <Button
                            variant="soft"
                            size="sm"
                            icon={ExportIcon}
                            loading={exportando}
                            onClick={handleExport}
                        >
                            {exportando ? 'Exportando...' : 'Descargar Excel'}
                        </Button>
                    </div>

                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.socioHeaderCell}>Socio</th>
                                    {meses.map(mes => (
                                        <th key={mes} className={styles.mesHeader}>{formatAniomes(mes)}</th>
                                    ))}
                                    {vista !== 'cruces' && (
                                        <th className={styles.totalHeader}>Total</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.NroSocio}>
                                        <td className={styles.socioCell}>
                                            <div className={styles.socioNombre}>
                                                {item.Apellidos?.trim?.() || item.Apellidos}, {item.Nombres?.trim?.() || item.Nombres}
                                            </div>
                                            <div className={styles.socioMeta}>
                                                N.° {item.NroSocio} · CI {item.CI}
                                            </div>
                                        </td>
                                        {meses.map(mes => (
                                            <td key={mes} className={vista === 'cruces' ? styles.cruzCellWrap : styles.montoCellWrap}>
                                                {vista === 'detalle' && <MontoStack valores={item.PorMes?.[mes]} />}
                                                {vista === 'importe' && <MontoImporte valores={item.PorMes?.[mes]} />}
                                                {vista === 'cruces' && <MontoCruz valores={item.PorMes?.[mes]} />}
                                            </td>
                                        ))}
                                        {vista !== 'cruces' && (
                                            <td className={styles.totalCellWrap}>
                                                {vista === 'detalle' && <MontoStack valores={item.Total} />}
                                                {vista === 'importe' && <MontoImporte valores={item.Total} />}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className={styles.footerRow}>
                                    <td className={styles.socioCell}>
                                        Total de esta página
                                        {vista !== 'detalle' && (
                                            <div className={styles.socioMeta}>siempre con el detalle completo</div>
                                        )}
                                    </td>
                                    {meses.map(mes => (
                                        <td key={mes} className={styles.montoCellWrap}>
                                            <MontoStack valores={totalesPorMes[mes]} />
                                        </td>
                                    ))}
                                    {vista !== 'cruces' && (
                                        <td className={styles.totalCellWrap}>
                                            <MontoStack valores={totalGeneralPagina} />
                                        </td>
                                    )}
                                </tr>
                            </tfoot>
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
        </div>
    );
};

export default InformePlanillaSociosPage;
