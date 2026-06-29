import { useState, useEffect } from 'react';
import RadiosTable from '../components/RadiosTable/RadiosTable';
import RadiosModal from '../components/RadiosModal/RadiosModal';
import { fetchItems, createItem, updateItem, deleteItem } from '../services/api';
import styles from './RadiosPage.module.css';

const RadiosPage = ({ showToast }) => {
    const [radios, setRadios] = useState([]);
    const [filteredRadios, setFilteredRadios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRadio, setEditingRadio] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadRadios();
    }, []);

    useEffect(() => {
        filterRadios();
    }, [radios, searchTerm]);

    const loadRadios = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchItems('radios');
            setRadios(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Error al cargar los radios');
            showToast('Error al cargar radios', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filterRadios = () => {
        let filtered = [...radios];

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(radio =>
                radio.Nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                radio.IdRadio?.toString().includes(searchTerm)
            );
        }

        setFilteredRadios(filtered);
    };

    const handleAdd = () => {
        setEditingRadio(null);
        setIsModalOpen(true);
    };

    const handleEdit = (radio) => {
        setEditingRadio(radio);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de que desea eliminar este radio?')) {
            return;
        }

        try {
            await deleteItem('radios', id);
            showToast('Radio eliminado exitosamente', 'success');
            loadRadios();
        } catch (err) {
            showToast('Error al eliminar el radio', 'error');
        }
    };

    const handleSubmit = async (data) => {
        try {
            if (editingRadio) {
                await updateItem('radios', editingRadio.IdRadio, data);
                showToast('Radio actualizado exitosamente', 'success');
            } else {
                await createItem('radios', data);
                showToast('Radio creado exitosamente', 'success');
            }
            setIsModalOpen(false);
            loadRadios();
        } catch (err) {
            // Detectar error de ID duplicado
            if (err.response?.status === 409) {
                showToast(err.response?.data?.error || 'El ID ya existe', 'error');
            } else {
                showToast('Error al guardar el radio', 'error');
            }
            console.error('Error saving radio:', err);
        }
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando radios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2 className={styles.title}>Gestión de Radios</h2>
                <button className="btn-primary" onClick={handleAdd}>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Nuevo Radio</span>
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
                    {filteredRadios.length} de {radios.length} radios
                </div>
            </div>

            {error ? (
                <p className={styles.error}>{error}</p>
            ) : (
                <RadiosTable
                    radios={filteredRadios}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <RadiosModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingRadio}
            />
        </div>
    );
};

export default RadiosPage;

