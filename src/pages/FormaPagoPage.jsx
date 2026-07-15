import { useState, useEffect } from 'react';
import FormaPagoTable from '../components/FormaPagoTable/FormaPagoTable';
import FormaPagoModal from '../components/FormaPagoModal/FormaPagoModal';
import { Button, PageHeader } from '../components/ui';
import { fetchItems, createItem, updateItem } from '../services/api';
import styles from './FormaPagoPage.module.css';

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

const FormaPagoPage = ({ showToast }) => {
    const [formasPago, setFormasPago] = useState([]);
    const [filteredFormasPago, setFilteredFormasPago] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'view'
    const [editingFormaPago, setEditingFormaPago] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadFormasPago();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        filterFormasPago();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formasPago, searchTerm]);

    const loadFormasPago = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchItems('formapago');
            setFormasPago(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading formas de pago:', err);
            setError('Error al cargar las formas de pago');
            showToast('Error al cargar formas de pago', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filterFormasPago = () => {
        let filtered = [...formasPago];

        if (searchTerm) {
            filtered = filtered.filter(forma =>
                forma.Nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                forma.IdFormaPago?.toString().includes(searchTerm)
            );
        }

        setFilteredFormasPago(filtered);
    };

    const handleAdd = () => {
        setEditingFormaPago(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleEdit = (formaPago) => {
        setEditingFormaPago(formaPago);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (formaPago) => {
        setEditingFormaPago(formaPago);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleSubmit = async (data) => {
        try {
            if (editingFormaPago) {
                await updateItem('formapago', editingFormaPago.IdFormaPago, data);
                showToast('Forma de pago actualizada exitosamente', 'success');
            } else {
                await createItem('formapago', data);
                showToast('Forma de pago creada exitosamente', 'success');
            }
            setIsModalOpen(false);
            loadFormasPago();
        } catch (err) {
            console.error('Error saving forma de pago:', err);
            if (err.response?.status === 409) {
                showToast(err.response?.data?.error || 'El ID ya existe', 'error');
            } else {
                showToast('Error al guardar la forma de pago', 'error');
            }
        }
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando formas de pago...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <PageHeader
                title="Formas de Pago"
                subtitle="Administrá las formas de pago disponibles"
                actions={
                    <Button variant="primary" icon={PlusIcon} onClick={handleAdd}>
                        Nueva Forma de Pago
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
                    {filteredFormasPago.length} de {formasPago.length} forma{formasPago.length !== 1 ? 's' : ''} de pago
                </div>
            </div>

            {error ? (
                <p className={styles.error}>{error}</p>
            ) : (
                <FormaPagoTable
                    formasPago={filteredFormasPago}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDeleted={loadFormasPago}
                />
            )}

            <FormaPagoModal
                isOpen={isModalOpen}
                mode={modalMode}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                onRequestEdit={() => setModalMode('edit')}
                initialData={editingFormaPago}
            />
        </div>
    );
};

export default FormaPagoPage;
