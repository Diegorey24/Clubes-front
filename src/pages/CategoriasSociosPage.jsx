import { useState, useEffect } from 'react';
import CategoriasSociosTable from '../components/CategoriasSociosTable/CategoriasSociosTable';
import CategoriasSociosModal from '../components/CategoriasSociosModal/CategoriasSociosModal';
import { fetchItems, createItem, updateItem, deleteItem } from '../services/api';
import styles from './CategoriasSociosPage.module.css';

const CategoriasSociosPage = ({ showToast }) => {
    const [categorias, setCategorias] = useState([]);
    const [filteredCategorias, setFilteredCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategoria, setEditingCategoria] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadCategorias();
    }, []);

    useEffect(() => {
        filterCategorias();
    }, [categorias, searchTerm]);

    const loadCategorias = async () => {
        setLoading(true);
        setError(null);
        try {
            // "categoriaSocios" maps to /api/categoriaSocios as checked in server.js
            const data = await fetchItems('categoriaSocios');
            setCategorias(Array.isArray(data) ? data : []);
        } catch (err) {
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
        setIsModalOpen(true);
    };

    const handleEdit = (categoria) => {
        setEditingCategoria(categoria);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de que desea eliminar esta categoría?')) {
            return;
        }

        try {
            await deleteItem('categoriaSocios', id);
            showToast('Categoría eliminada exitosamente', 'success');
            loadCategorias();
        } catch (err) {
            showToast('Error al eliminar la categoría', 'error');
        }
    };

    const handleSubmit = async (data) => {
        try {
            if (editingCategoria) {
                // Assuming CatCod is the ID
                await updateItem('categoriaSocios', editingCategoria.CatCod, data);
                showToast('Categoría actualizada exitosamente', 'success');
            } else {
                await createItem('categoriaSocios', data);
                showToast('Categoría creada exitosamente', 'success');
            }
            setIsModalOpen(false);
            loadCategorias();
        } catch (err) {
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
            <div className={styles.header}>
                <h2 className={styles.title}>Gestión de Categorías de Socios</h2>
                <button className="btn-primary" onClick={handleAdd}>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Nueva Categoría</span>
                </button>
            </div>

            <div className={styles.filters}>
                <div className={styles.searchBox}>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className={styles.resultsCount}>
                    {filteredCategorias.length} de {categorias.length} categorías
                </div>
            </div>

            {error ? (
                <p className={styles.error}>{error}</p>
            ) : (
                <CategoriasSociosTable
                    categorias={filteredCategorias}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <CategoriasSociosModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingCategoria}
            />
        </div>
    );
};

export default CategoriasSociosPage;
