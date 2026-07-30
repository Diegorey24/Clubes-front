import { useState, useEffect } from 'react';
import GruposFamiliaresTable from '../components/GruposFamiliaresTable/GruposFamiliaresTable';
import CrearGrupoFamiliarModal from '../components/GruposFamiliaresModal/GruposFamiliaresModal';
import { Button, PageHeader } from '../components/ui';
import { getGruposFamiliares } from '../services/api';
import styles from './GruposFamiliaresPage.module.css';

const PlusIcon = (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const SearchIcon = (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);

const ClearIcon = (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const GruposFamiliaresPage = ({ showToast }) => {
    const [grupos, setGrupos] = useState([]);
    const [filteredGrupos, setFilteredGrupos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadGrupos();
    }, []);

    useEffect(() => {
        filterGrupos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [grupos, searchTerm]);

    const loadGrupos = async () => {
        setLoading(true);
        setError(null);
        try {
            // No hay paginación ni búsqueda en el GET general (ver guía del
            // backend): se trae todo y se filtra acá mismo.
            const data = await getGruposFamiliares();
            setGrupos(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading grupos familiares:', err);
            setError('Error al cargar los grupos familiares');
            showToast('Error al cargar grupos familiares', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filterGrupos = () => {
        let filtered = [...grupos];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter((grupo) =>
                grupo.TitularNombre?.toLowerCase().includes(term) ||
                grupo.TitularSocDocIde?.toString().includes(searchTerm)
            );
        }

        setFilteredGrupos(filtered);
    };

    const handleAdd = () => {
        setIsModalOpen(true);
    };

    const handleGrupoCreado = () => {
        setIsModalOpen(false);
        showToast('Grupo familiar creado exitosamente', 'success');
        loadGrupos();
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando grupos familiares...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <PageHeader
                title="Grupos Familiares"
                subtitle="Administrá los grupos familiares de los socios"
                actions={
                    <Button variant="primary" icon={PlusIcon} onClick={handleAdd}>
                        Nuevo Grupo
                    </Button>
                }
            />

            <div className={styles.filtersCard}>
                <div className={styles.searchBox}>
                    {SearchIcon}
                    <input
                        type="text"
                        placeholder="Buscar por titular o cédula"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            className={styles.clearButton}
                            onClick={() => setSearchTerm('')}
                            title="Limpiar búsqueda"
                            aria-label="Limpiar búsqueda"
                        >
                            {ClearIcon}
                        </button>
                    )}
                </div>

                <div className={styles.resultsCount}>
                    {filteredGrupos.length} de {grupos.length} grupo{grupos.length !== 1 ? 's' : ''}
                </div>
            </div>

            {error ? (
                <p className={styles.error}>{error}</p>
            ) : (
                <GruposFamiliaresTable
                    grupos={filteredGrupos}
                    onDeleted={loadGrupos}
                />
            )}

            <CrearGrupoFamiliarModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleGrupoCreado}
            />
        </div>
    );
};

export default GruposFamiliaresPage;
