import { useState, useEffect } from 'react';
import MotivosBajaTable from '../components/MotivosBajaTable/MotivosBajaTable';
import MotivosBajaModal from '../components/MotivosBajaModal/MotivosBajaModal';
import { Button, PageHeader } from '../components/ui';
import { fetchItems, createItem, updateItem } from '../services/api';
import styles from './MotivosBajaPage.module.css';

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

const MotivosBajaPage = ({ showToast }) => {
    const [motivos, setMotivos] = useState([]);
    const [filteredMotivos, setFilteredMotivos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'view'
    const [editingMotivo, setEditingMotivo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadMotivos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        filterMotivos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [motivos, searchTerm]);

    const loadMotivos = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchItems('motivos-baja');
            setMotivos(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading motivos de baja:', err);
            setError('Error al cargar los motivos de baja');
            showToast('Error al cargar motivos de baja', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filterMotivos = () => {
        let filtered = [...motivos];

        if (searchTerm) {
            filtered = filtered.filter(motivo =>
                motivo.Descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                motivo.Id?.toString().includes(searchTerm)
            );
        }

        setFilteredMotivos(filtered);
    };

    const handleAdd = () => {
        setEditingMotivo(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleEdit = (motivo) => {
        setEditingMotivo(motivo);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (motivo) => {
        setEditingMotivo(motivo);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleSubmit = async (data) => {
        try {
            if (editingMotivo) {
                await updateItem('motivos-baja', editingMotivo.Id, data);
                showToast('Motivo de baja actualizado exitosamente', 'success');
            } else {
                await createItem('motivos-baja', data);
                showToast('Motivo de baja creado exitosamente', 'success');
            }
            setIsModalOpen(false);
            loadMotivos();
        } catch (err) {
            console.error('Error saving motivo de baja:', err);
            showToast('Error al guardar el motivo de baja', 'error');
        }
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando motivos de baja...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <PageHeader
                title="Motivos de Baja"
                subtitle="Administrá los motivos de baja disponibles para socios"
                actions={
                    <Button variant="primary" icon={PlusIcon} onClick={handleAdd}>
                        Nuevo Motivo
                    </Button>
                }
            />

            <div className={styles.filtersCard}>
                <div className={styles.searchBox}>
                    {SearchIcon}
                    <input
                        type="text"
                        placeholder="Buscar por descripción o ID"
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
                    {filteredMotivos.length} de {motivos.length} motivo{motivos.length !== 1 ? 's' : ''}
                </div>
            </div>

            {error ? (
                <p className={styles.error}>{error}</p>
            ) : (
                <MotivosBajaTable
                    motivos={filteredMotivos}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDeleted={loadMotivos}
                />
            )}

            <MotivosBajaModal
                isOpen={isModalOpen}
                mode={modalMode}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                onRequestEdit={() => setModalMode('edit')}
                initialData={editingMotivo}
            />
        </div>
    );
};

export default MotivosBajaPage;
