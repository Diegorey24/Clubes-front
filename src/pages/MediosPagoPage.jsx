import { useState, useEffect } from 'react';
import MediosPagoTable from '../components/MediosPagoTable/MediosPagoTable';
import MediosPagoModal from '../components/MediosPagoModal/MediosPagoModal';
import { fetchItems, createItem, updateItem, deleteItem } from '../services/api';
import styles from './MediosPagoPage.module.css';

const MediosPagoPage = ({ showToast }) => {
    const [mediosPago, setMediosPago] = useState([]);
    const [filteredMediosPago, setFilteredMediosPago] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMedioPago, setEditingMedioPago] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadMediosPago();
    }, []);

    useEffect(() => {
        filterMediosPago();
    }, [mediosPago, searchTerm]);

    const loadMediosPago = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchItems('mediospago');
            setMediosPago(Array.isArray(data) ? data : []);
        } catch (err) {
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
        setIsModalOpen(true);
    };

    const handleEdit = (medioPago) => {
        setEditingMedioPago(medioPago);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este medio de pago?')) {
            try {
                await deleteItem('mediospago', id);
                showToast('Medio de pago eliminado exitosamente', 'success');
                loadMediosPago();
            } catch (err) {
                showToast('Error al eliminar el medio de pago', 'error');
            }
        }
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
            if (err.response?.status === 409) {
                showToast(err.response?.data?.error || 'El ID ya existe', 'error');
            } else {
                showToast('Error al guardar el medio de pago', 'error');
            }
            console.error('Error saving medio de pago:', err);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2 className={styles.title}>Gestión de Medios de Pago</h2>
                <button className="btn-primary" onClick={handleAdd}>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Nuevo Medio de Pago</span>
                </button>
            </div>

            <div className={styles.filters}>
                <div className={styles.searchBox}>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar por descripción o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className={styles.resultsCount}>
                    {filteredMediosPago.length} de {mediosPago.length} medios de pago
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>Cargando...</div>
            ) : error ? (
                <p className={styles.error}>{error}</p>
            ) : (
                <MediosPagoTable
                    mediosPago={filteredMediosPago}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <MediosPagoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingMedioPago}
            />
        </div>
    );
};

export default MediosPagoPage;
