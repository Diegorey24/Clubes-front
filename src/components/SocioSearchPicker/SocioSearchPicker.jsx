import { useState, useEffect, useRef } from 'react';
import { getSociosSinGrupo } from '../../services/api';
import { nombreCompleto } from '../../utils/socioNombre';
import styles from './SocioSearchPicker.module.css';

const SearchIcon = (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);

/**
 * Buscador de socios con resultados en vivo (debounce), pensado para
 * elegir un socio a la vez -- se usa tanto para elegir el titular de un
 * grupo familiar como, repetidamente, para ir agregando integrantes.
 * Cada vez que se elige un resultado, se llama a onPick y se limpia la
 * búsqueda para poder elegir el próximo.
 *
 * excludeSocNros: SocNro que no deben aparecer en los resultados (el
 * titular ya elegido, los integrantes ya agregados, etc.).
 *
 * Por defecto busca entre socios sin grupo familiar todavía (GruFamNro = 0,
 * vía /gruposfamiliares/sin-grupo): son los únicos candidatos válidos para
 * armar o sumar a un grupo, así se evita mover en silencio a alguien que
 * ya pertenece a otra familia.
 *
 * Para otros usos (ej. buscar cualquier socio activo, no solo los que no
 * tienen grupo) se puede pasar un `fetcher` propio: una función que reciba
 * el término de búsqueda y devuelva un array (o { items: [...] }) de socios.
 */
const SocioSearchPicker = ({ onPick, fetcher = getSociosSinGrupo, excludeSocNros = [], placeholder = 'Buscar por nombre o cédula', autoFocus = false, disabled = false }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const excludeRef = useRef(excludeSocNros);
    excludeRef.current = excludeSocNros;
    const fetcherRef = useRef(fetcher);
    fetcherRef.current = fetcher;

    useEffect(() => {
        const term = query.trim();
        if (!term) {
            setResults([]);
            setShowResults(false);
            setSearching(false);
            return;
        }
        setSearching(true);
        const timer = setTimeout(async () => {
            try {
                const data = await fetcherRef.current(term);
                const lista = Array.isArray(data) ? data : (data?.items || []);
                const items = lista.filter(
                    (s) => !excludeRef.current.includes(s.SocNro)
                );
                setResults(items);
                setShowResults(true);
            } catch (err) {
                console.error('Error buscando socios:', err);
                setResults([]);
                setShowResults(true);
            } finally {
                setSearching(false);
            }
        }, 350);
        return () => clearTimeout(timer);
    }, [query]);

    const handlePick = (socio) => {
        onPick(socio);
        setQuery('');
        setResults([]);
        setShowResults(false);
    };

    return (
        <div className={styles.wrap}>
            <div className={styles.inputWrap}>
                <span className={styles.searchIcon}>{SearchIcon}</span>
                <input
                    type="text"
                    className={styles.input}
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus={autoFocus}
                    disabled={disabled}
                />
                {searching && <span className={styles.spinner} aria-hidden="true" />}
            </div>

            {showResults && (
                results.length === 0 ? (
                    <div className={styles.noResults}>No se encontraron socios</div>
                ) : (
                    <div className={styles.results}>
                        {results.map((s) => (
                            <button
                                key={s.SocNro}
                                type="button"
                                className={styles.resultItem}
                                onClick={() => handlePick(s)}
                            >
                                <span className={styles.resultName}>{nombreCompleto(s)}</span>
                                <span className={styles.resultMeta}>CI {s.SocDocIde} · N.° {s.SocNro}</span>
                            </button>
                        ))}
                    </div>
                )
            )}
        </div>
    );
};

export default SocioSearchPicker;
