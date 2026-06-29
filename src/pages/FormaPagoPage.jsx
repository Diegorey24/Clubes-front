import { useState, useEffect } from 'react';
import FormaPagoTable from '../components/FormaPagoTable/FormaPagoTable';
import FormaPagoModal from '../components/FormaPagoModal/FormaPagoModal';
import { fetchItems, createItem, updateItem, deleteItem } from '../services/api';
import styles from './FormaPagoPage.module.css';

const FormaPagoPage = ({ showToast }) => {
    const [formasPago, setFormasPago] = useState([]);
    const [filteredFormasPago, setFilteredFormasPago] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFormaPago, setEditingFormaPago] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadFormasPago();
    }, []);

    useEffect(() => {
        filterFormasPago();
    }, [formasPago, searchTerm]);

    const loadFormasPago = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchItems('formapago');
            setFormasPago(Array.isArray(data) ? data : []);
        } catch (err) {
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
        setIsModalOpen(true);
    };

    const handleEdit = (formaPago) => {
        setEditingFormaPago(formaPago);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar esta forma de pago?')) {
            try {
                await deleteItem('formapago', id);
                showToast('Forma de pago eliminada exitosamente', 'success');
                loadFormasPago();
            } catch (err) {
                showToast('Error al eliminar la forma de pago', 'error');
            }
        }
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
            if (err.response?.status === 409) {
                showToast(err.response?.data?.error || 'El ID ya existe', 'error');
            } else {
                showToast('Error al guardar la forma de pago', 'error');
            }
            console.error('Error saving forma de pago:', err);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2 className={styles.title}>Gestión de Formas de Pago</h2>
                <button className="btn-primary" onClick={handleAdd}>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Nueva Forma de Pago</span>
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
                    {filteredFormasPago.length} de {formasPago.length} formas de pago
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>Cargando...</div>
            ) : error ? (
                <p className={styles.error}>{error}</p>
            ) : (
                <FormaPagoTable
                    formasPago={filteredFormasPago}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <FormaPagoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingFormaPago}
            />
        </div>
    );
};

export default FormaPagoPage;
