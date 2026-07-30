import { useState, useEffect } from 'react';
import { fetchItems } from '../../services/api';
import styles from './BuscarRubroModal.module.css';

const TagIcon = (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6h.008v.008H6V6z" />
    </svg>
);

const CloseIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SearchIcon = (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(amount || 0);
};

// Modal "buscador" de rubros: lista y filtra los rubros existentes (mismo
// criterio que RubrosPage) para que el usuario elija uno. No crea ni edita
// rubros, solo selecciona uno y lo devuelve via onSelect.
const BuscarRubroModal = ({ isOpen, onClose, onSelect }) => {
    const [rubros, setRubros] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setSearchTerm('');
        loadRubros();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen]);

    if (!isOpen) return null;

    const loadRubros = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchItems('rubros');
            setRubros(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading rubros:', err);
            setError('Error al cargar los rubros');
        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose?.();
    };

    const filteredRubros = rubros.filter((rubro) =>
        !searchTerm ||
        rubro.Nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rubro.IdRubro?.toString().includes(searchTerm)
    );

    return (
        <div className={styles.overlay} onClick={handleBackdropClick}>
            <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="buscar-rubro-title">
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <span className={styles.iconWrap}>{TagIcon}</span>
                        <h3 id="buscar-rubro-title" className={styles.title}>Buscar Rubro</h3>
                    </div>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        {CloseIcon}
                    </button>
                </div>

                <div className={styles.body}>
                    <div className={styles.searchInputWrap}>
                        <span className={styles.searchIcon}>{SearchIcon}</span>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Buscar por nombre o código"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {loading ? (
                        <p className={styles.loadingText}>Cargando rubros...</p>
                    ) : error ? (
                        <p className={styles.error}>{error}</p>
                    ) : filteredRubros.length === 0 ? (
                        <p className={styles.empty}>No se encontraron rubros.</p>
                    ) : (
                        <div className={styles.rubrosList}>
                            {filteredRubros.map((rubro) => (
                                <button
                                    key={rubro.IdRubro}
                                    type="button"
                                    className={styles.rubroBtn}
                                    onClick={() => onSelect?.(rubro)}
                                >
                                    <span className={styles.rubroInfo}>
                                        <span className={styles.rubroNombre}>{rubro.Nombre?.trim()}</span>
                                        <span className={styles.rubroCodigo}>Código {rubro.IdRubro}</span>
                                    </span>
                                    <span className={styles.rubroImporte}>{formatCurrency(rubro.Importe)}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BuscarRubroModal;
