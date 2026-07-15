import { useState, useEffect } from 'react';
import CategoriasSociosTable from '../components/CategoriasSociosTable/CategoriasSociosTable';
import CategoriasSociosModal from '../components/CategoriasSociosModal/CategoriasSociosModal';
import { Button, PageHeader } from '../components/ui';
import { fetchItems, createItem, updateItem } from '../services/api';
import styles from './CategoriasSociosPage.module.css';

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

const CategoriasSociosPage = ({ showToast }) => {
    const [categorias, setCategorias] = useState([]);
    const [filteredCategorias, setFilteredCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'view'
    const [editingCategoria, setEditingCategoria] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadCategorias();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        filterCategorias();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categorias, searchTerm]);

    const loadCategorias = async () => {
        setLoading(true);
        setError(null);
        try {
            // "categoriaSocios" maps to /api/categoriaSocios (ver server.js)
            const data = await fetchItems('categoriaSocios');
            setCategorias(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading categorias:', err);
            setError('Error al cargar las categorías');
            showToast('Error al cargar categorías', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filterCategorias = () => {
        let filtered = [...categorias];

        if (searchTerm) {
            filtered = filtered.filter(cat =>
                cat.CatNom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cat.CatCod?.toString().includes(searchTerm)
            );
        }

        setFilteredCategorias(filtered);
    };

    const handleAdd = () => {
        setEditingCategoria(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleEdit = (categoria) => {
        setEditingCategoria(categoria);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (categoria) => {
        setEditingCategoria(categoria);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleSubmit = async (data) => {
        try {
            if (editingCategoria) {
                await updateItem('categoriaSocios', editingCategoria.CatCod, data);
                showToast('Categoría actualizada exitosamente', 'success');
            } else {
                await createItem('categoriaSocios', data);
                showToast('Categoría creada exitosamente', 'success');
            }
            setIsModalOpen(false);
            loadCategorias();
        } catch (err) {
            console.error('Error saving categoria:', err);
            showToast('Error al guardar la categoría', 'error');
        }
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando categorías...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <PageHeader
                title="Categorías de Socios"
                subtitle="Definí los rangos de edad e importes de cada categoría"
                actions={
                    <Button variant="primary" icon={PlusIcon} onClick={handleAdd}>
                        Nueva Categoría
                    </Button>
                }
            />

            <div className={styles.filtersCard}>
                <div className={styles.searchBox}>
                    {SearchIcon}
                    <input
                        type="text"
                        placeholder="Buscar por nombre o código"
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
                    {filteredCategorias.length} de {categorias.length} categoría{categorias.length !== 1 ? 's' : ''}
                </div>
            </div>

            {error ? (
                <p className={styles.error}>{error}</p>
            ) : (
                <CategoriasSociosTable
                    categorias={filteredCategorias}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDeleted={loadCategorias}
                />
            )}

            <CategoriasSociosModal
                isOpen={isModalOpen}
                mode={modalMode}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                onRequestEdit={() => setModalMode('edit')}
                initialData={editingCategoria}
            />
        </div>
    );
};

export default CategoriasSociosPage;
