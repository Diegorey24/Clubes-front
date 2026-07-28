import { useState, useEffect } from 'react';
import { getSocios } from '../../services/api';
import { nombreCompleto } from '../../utils/socioNombre';
import { Button } from '../ui';
import styles from './SeleccionarSociosList.module.css';

const SearchIcon = (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);

/**
 * Lista de socios seleccionable (checkbox por fila) con búsqueda y
 * paginación, pensada para procesos masivos (por ahora, Generación de
 * Cargos). Reutiliza el mismo endpoint /socios que SociosPage
 * (getSocios: page, limit, search, categoria, radio), así que la
 * paginación y el filtro por categoría corren en el backend.
 *
 * La selección (qué SocNro quedaron marcados) vive en el componente padre
 * -- este componente solo la muestra y avisa de los toggles -- para que
 * los socios elegidos sobrevivan a los cambios de página/búsqueda.
 *
 * categoria: CatCod para filtrar (o '' para no filtrar, "todos los socios").
 * selected: Map<SocNro, socio> con los socios ya elegidos.
 * onToggle(socio): togglea un socio individual.
 * onToggleAllVisible(sociosDeLaPagina, marcarTodos): togglea todos los de
 * la página actual de una vez (checkbox del header).
 */
const SeleccionarSociosList = ({ categoria = '', selected, onToggle, onToggleAllVisible, disabled = false, showToast }) => {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [socios, setSocios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 20;

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 350);
        return () => clearTimeout(timer);
    }, [search]);

    // Cambiar de categoría o de búsqueda vuelve a la página 1.
    useEffect(() => {
        setPage(1);
    }, [categoria, debouncedSearch]);

    useEffect(() => {
        let active = true;
        const load = async () => {
            setLoading(true);
            try {
                const data = await getSocios(page, limit, debouncedSearch, categoria, '');
                if (!active) return;
                setSocios(data.items || []);
                setTotalPages(data.totalPages || 1);
                setTotalItems(data.total || 0);
            } catch (err) {
                console.error('Error cargando socios:', err);
                if (active) showToast?.('Error al cargar la lista de socios', 'error');
            } finally {
                if (active) setLoading(false);
            }
        };
        load();
        return () => { active = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, debouncedSearch, categoria]);

    const allVisibleSelected = socios.length > 0 && socios.every((s) => selected.has(s.SocNro));

    return (
        <div className={styles.wrap}>
            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <span className={styles.searchIcon}>{SearchIcon}</span>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, cédula o número de socio"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        disabled={disabled}
                    />
                </div>
                <div className={styles.counts}>
                    <span className={styles.selectedBadge}>{selected.size} seleccionado{selected.size !== 1 ? 's' : ''}</span>
                    <span className={styles.totalCount}>{totalItems} socio{totalItems !== 1 ? 's' : ''}</span>
                </div>
            </div>

            <div className={styles.tableContainer}>
                {loading ? (
                    <div className={styles.loadingState}>Cargando socios...</div>
                ) : socios.length === 0 ? (
                    <div className={styles.emptyState}>No se encontraron socios.</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.checkboxHeader}>
                                    <input
                                        type="checkbox"
                                        checked={allVisibleSelected}
                                        onChange={(e) => onToggleAllVisible(socios, e.target.checked)}
                                        disabled={disabled}
                                        aria-label="Seleccionar todos los de esta página"
                                    />
                                </th>
                                <th>Nombre y Apellido</th>
                                <th>Cédula</th>
                                <th>N.° Socio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {socios.map((socio) => {
                                const isChecked = selected.has(socio.SocNro);
                                return (
                                    <tr
                                        key={socio.SocNro}
                                        className={isChecked ? styles.rowSelected : ''}
                                        onClick={() => !disabled && onToggle(socio)}
                                    >
                                        <td className={styles.checkboxCell} onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => onToggle(socio)}
                                                disabled={disabled}
                                                aria-label={`Seleccionar a ${nombreCompleto(socio)}`}
                                            />
                                        </td>
                                        <td className={styles.nameCell}>{nombreCompleto(socio)}</td>
                                        <td className={styles.muted}>{socio.SocDocIde}</td>
                                        <td className={styles.muted}>{socio.SocNro}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || disabled}
                    >
                        Anterior
                    </Button>
                    <span className={styles.pageIndicator}>Página {page} de {totalPages}</span>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || disabled}
                    >
                        Siguiente
                    </Button>
                </div>
            )}
        </div>
    );
};

export default SeleccionarSociosList;
