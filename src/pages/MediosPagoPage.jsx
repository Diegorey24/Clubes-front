import { useState, useEffect } from 'react';
import MediosPagoTable from '../components/MediosPagoTable/MediosPagoTable';
import MediosPagoModal from '../components/MediosPagoModal/MediosPagoModal';
import { Button, PageHeader } from '../components/ui';
import { fetchItems, createItem, updateItem } from '../services/api';
import styles from './MediosPagoPage.module.css';

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

const MediosPagoPage = ({ showToast }) => {
    const [mediosPago, setMediosPago] = useState([]);
    const [filteredMediosPago, setFilteredMediosPago] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'view'
    const [editingMedioPago, setEditingMedioPago] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadMediosPago();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        filterMediosPago();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mediosPago, searchTerm]);

    const loadMediosPago = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchItems('mediospago');
            setMediosPago(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading medios de pago:', err);
            setError('Error al cargar los medios de pago');
            showToast('Error al cargar medios de pago', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filterMediosPago = () => {
        let filtered = [...mediosPago];

        if (searchTerm) {
            filtered = filtered.filter(medio =>
                medio.Descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                medio.IdMedioPago?.toString().includes(searchTerm)
            );
        }

        setFilteredMediosPago(filtered);
    };

    const handleAdd = () => {
        setEditingMedioPago(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleEdit = (medioPago) => {
        setEditingMedioPago(medioPago);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (medioPago) => {
        setEditingMedioPago(medioPago);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleSubmit = async (data) => {
        try {
            if (editingMedioPago) {
                await updateItem('mediospago', editingMedioPago.IdMedioPago, data);
                showToast('Medio de pago actualizado exitosamente', 'success');
            } else {
                await createItem('mediospago', data);
                showToast('Medio de pago creado exitosamente', 'success');
            }
            setIsModalOpen(false);
            loadMediosPago();
        } catch (err) {
            console.error('Error saving medio de pago:', err);
            if (err.response?.status === 409) {
                showToast(err.response?.data?.error || 'El ID ya existe', 'error');
            } else {
                showToast('Error al guardar el medio de pago', 'error');
            }
        }
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando medios de pago...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <PageHeader
                title="Medios de Pago"
                subtitle="Administrá los medios de pago disponibles"
                actions={
                    <Button variant="primary" icon={PlusIcon} onClick={handleAdd}>
                        Nuevo Medio de Pago
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
                    {filteredMediosPago.length} de {mediosPago.length} medio{mediosPago.length !== 1 ? 's' : ''} de pago
                </div>
            </div>

            {error ? (
                <p className={styles.error}>{error}</p>
            ) : (
                <MediosPagoTable
                    mediosPago={filteredMediosPago}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDeleted={loadMediosPago}
                />
            )}

            <MediosPagoModal
                isOpen={isModalOpen}
                mode={modalMode}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                onRequestEdit={() => setModalMode('edit')}
                initialData={editingMedioPago}
            />
        </div>
    );
};

export default MediosPagoPage;
