import { useState, useEffect } from 'react';
import RadiosTable from '../components/RadiosTable/RadiosTable';
import RadiosModal from '../components/RadiosModal/RadiosModal';
import { Button, PageHeader } from '../components/ui';
import { fetchItems, createItem, updateItem } from '../services/api';
import styles from './RadiosPage.module.css';

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

const RadiosPage = ({ showToast }) => {
    const [radios, setRadios] = useState([]);
    const [filteredRadios, setFilteredRadios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'view'
    const [editingRadio, setEditingRadio] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadRadios();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        filterRadios();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [radios, searchTerm]);

    const loadRadios = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchItems('radios');
            setRadios(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading radios:', err);
            setError('Error al cargar los radios');
            showToast('Error al cargar radios', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filterRadios = () => {
        let filtered = [...radios];

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
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleEdit = (radio) => {
        setEditingRadio(radio);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (radio) => {
        setEditingRadio(radio);
        setModalMode('view');
        setIsModalOpen(true);
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
            console.error('Error saving radio:', err);
            if (err.response?.status === 409) {
                showToast(err.response?.data?.error || 'El ID ya existe', 'error');
            } else {
                showToast('Error al guardar el radio', 'error');
            }
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
            <PageHeader
                title="Radios"
                subtitle="Administrá los radios disponibles"
                actions={
                    <Button variant="primary" icon={PlusIcon} onClick={handleAdd}>
                        Nuevo Radio
                    </Button>
                }
            />

            <div className={styles.filtersCard}>
                <div className={styles.searchBox}>
                    {SearchIcon}
                    <input
                        type="text"
                        placeholder="Buscar por nombre o ID"
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
                    {filteredRadios.length} de {radios.length} radio{radios.length !== 1 ? 's' : ''}
                </div>
            </div>

            {error ? (
                <p className={styles.error}>{error}</p>
            ) : (
                <RadiosTable
                    radios={filteredRadios}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDeleted={loadRadios}
                />
            )}

            <RadiosModal
                isOpen={isModalOpen}
                mode={modalMode}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                onRequestEdit={() => setModalMode('edit')}
                initialData={editingRadio}
            />
        </div>
    );
};

export default RadiosPage;
