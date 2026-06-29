import { useState, useEffect } from 'react';
import Card from '../components/Card/Card';
import Modal from '../components/Modal/Modal';
import { fetchItems, createItem, updateItem, deleteItem } from '../services/api';
import styles from './Section.module.css';

const Section = ({ type, title, showToast }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [modalTitle, setModalTitle] = useState('');
    const [initialValue, setInitialValue] = useState('');

    useEffect(() => {
        loadItems();
    }, [type]);

    const loadItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchItems(type);
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Error al cargar los datos');
            showToast('Error al cargar ' + type, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingItem(null);
        setInitialValue('');
        setModalTitle(`Nuevo ${title.slice(0, -1)}`); // Remove 's' from title
        setIsModalOpen(true);
    };

    const handleEdit = (id, nombre) => {
        setEditingItem(id);
        setInitialValue(nombre);
        setModalTitle(`Editar ${title.slice(0, -1)}`);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de que desea eliminar este item?')) {
            return;
        }

        try {
            await deleteItem(type, id);
            showToast(`${capitalize(type)} eliminado exitosamente`, 'success');
            loadItems();
        } catch (err) {
            showToast('Error al eliminar el item', 'error');
        }
    };

    const handleSubmit = async (nombre) => {
        const data = { Nombre: nombre };

        try {
            if (editingItem) {
                await updateItem(type, editingItem, data);
                showToast(`${capitalize(type)} actualizado exitosamente`, 'success');
            } else {
                await createItem(type, data);
                showToast(`${capitalize(type)} creado exitosamente`, 'success');
            }
            setIsModalOpen(false);
            loadItems();
        } catch (err) {
            showToast('Error al guardar el item', 'error');
        }
    };

    const capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Cargando datos...</p>
            </div>
        );
    }

    return (
        <>
            <div className="section-header">
                <h2 className="section-title">Gestión de {title}</h2>
                <button className="btn-primary" onClick={handleAdd}>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Nuevo {title.slice(0, -1)}</span>
                </button>
            </div>
            <div className={styles.cardGrid}>
                {error ? (
                    <p className={styles.errorState}>{error}</p>
                ) : items.length > 0 ? (
                    items.map((item) => (
                        <Card
                            key={item.IdRubro || item.IdRadio || item.IdParametro || item.id}
                            item={item}
                            type={type}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <p className={styles.emptyState}>No hay {type} disponibles</p>
                )}
            </div>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                title={modalTitle}
                initialValue={initialValue}
            />
        </>
    );
};

export default Section;
