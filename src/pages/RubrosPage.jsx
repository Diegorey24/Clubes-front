import { useState, useEffect } from 'react';
import RubrosTable from '../components/RubrosTable/RubrosTable';
import RubrosModal from '../components/RubrosModal/RubrosModal';
import { fetchItems, createItem, updateItem, deleteItem } from '../services/api';
import styles from './RubrosPage.module.css';

const RubrosPage = ({ showToast }) => {
    const [rubros, setRubros] = useState([]);
    const [filteredRubros, setFilteredRubros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRubro, setEditingRubro] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [tipoFilter, setTipoFilter] = useState('');

    useEffect(() => {
        loadRubros();
    }, []);

    useEffect(() => {
        filterRubros();
    }, [rubros, searchTerm, tipoFilter]);

    const loadRubros = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchItems('rubros');
            setRubros(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Error al cargar los rubros');
            showToast('Error al cargar rubros', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filterRubros = () => {
        let filtered = [...rubros];

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(rubro =>
                rubro.Nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rubro.IdRubro?.toString().includes(searchTerm)
            );
        }

        // Filter by tipo
        if (tipoFilter) {
            filtered = filtered.filter(rubro => rubro.Tipo === tipoFilter);
        }

        setFilteredRubros(filtered);
    };

    const handleAdd = () => {
        setEditingRubro(null);
        setIsModalOpen(true);
    };

    const handleEdit = (rubro) => {
        setEditingRubro(rubro);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de que desea eliminar este rubro?')) {
            return;
        }

        try {
            await deleteItem('rubros', id);
            showToast('Rubro eliminado exitosamente', 'success');
            loadRubros();
        } catch (err) {
            showToast('Error al eliminar el rubro', 'error');
        }
    };

    const handleSubmit = async (data) => {
        try {
            if (editingRubro) {
                await updateItem('rubros', editingRubro.IdRubro, data);
                showToast('Rubro actualizado exitosamente', 'success');
            } else {
                await createItem('rubros', data);
                showToast('Rubro creado exitosamente', 'success');
            }
            setIsModalOpen(false);
            loadRubros();
        } catch (err) {
            showToast('Error al guardar el rubro', 'error');
        }
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando rubros...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2 className={styles.title}>Gestión de Rubros</h2>
                <button className="btn-primary" onClick={handleAdd}>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Nuevo Rubro</span>
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

                <select
                    value={tipoFilter}
                    onChange={(e) => setTipoFilter(e.target.value)}
                    className={styles.filterSelect}
                >
                    <option value="">Todos los tipos</option>
                    <option value="AMBOS">AMBOS</option>
                    <option value="INGRESO">INGRESO</option>
                    <option value="EGRESO">EGRESO</option>
                </select>

                <div className={styles.resultsCount}>
                    {filteredRubros.length} de {rubros.length} rubros
                </div>
            </div>

            {error ? (
                <p className={styles.error}>{error}</p>
            ) : (
                <RubrosTable
                    rubros={filteredRubros}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <RubrosModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingRubro}
            />
        </div>
    );
};

export default RubrosPage;
