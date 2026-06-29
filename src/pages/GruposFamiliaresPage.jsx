import { useState, useEffect } from 'react';
import GruposFamiliaresTable from '../components/GruposFamiliaresTable/GruposFamiliaresTable';
import GruposFamiliaresModal from '../components/GruposFamiliaresModal/GruposFamiliaresModal';
import { fetchItems, createItem, updateItem, deleteItem } from '../services/api';
import styles from './GruposFamiliaresPage.module.css';

const GruposFamiliaresPage = ({ showToast }) => {
    const [grupos, setGrupos] = useState([]);
    const [filteredGrupos, setFilteredGrupos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGrupo, setEditingGrupo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadGrupos();
    }, []);

    useEffect(() => {
        filterGrupos();
    }, [grupos, searchTerm]);

    const loadGrupos = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchItems('gruposfamiliares');
            setGrupos(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Error al cargar los grupos familiares');
            showToast('Error al cargar grupos familiares', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filterGrupos = () => {
        if (!searchTerm) {
            setFilteredGrupos(grupos);
            return;
        }
        const term = searchTerm.toLowerCase();
        setFilteredGrupos(
            grupos.filter(g =>
                g.GruFamTit?.toLowerCase().includes(term) ||
                g.GruFamNro?.toString().includes(term)
            )
        );
    };

    const handleAdd = () => {
        setEditingGrupo(null);
        setIsModalOpen(true);
    };

    const handleEdit = (grupo) => {
        setEditingGrupo(grupo);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de que desea eliminar este grupo familiar?')) return;
        try {
            await deleteItem('gruposfamiliares', id);
            showToast('Grupo familiar eliminado exitosamente', 'success');
            loadGrupos();
        } catch (err) {
            showToast('Error al eliminar el grupo familiar', 'error');
        }
    };

    const handleSubmit = async (data) => {
        try {
            if (editingGrupo) {
                await updateItem('gruposfamiliares', editingGrupo.GruFamNro, data);
                showToast('Grupo familiar actualizado exitosamente', 'success');
            } else {
                await createItem('gruposfamiliares', data);
                showToast('Grupo familiar creado exitosamente', 'success');
            }
            setIsModalOpen(false);
            loadGrupos();
        } catch (err) {
            showToast('Error al guardar el grupo familiar', 'error');
        }
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando grupos familiares...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2 className={styles.title}>Grupos Familiares</h2>
                <button className="btn-primary" onClick={handleAdd}>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Nuevo Grupo</span>
                </button>
            </div>

            <div className={styles.filters}>
                <div className={styles.searchBox}>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar por título o número..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className={styles.resultsCount}>
                    {filteredGrupos.length} de {grupos.length} grupos
                </div>
            </div>

            {error ? (
                <p className={styles.error}>{error}</p>
            ) : (
                <GruposFamiliaresTable
                    grupos={filteredGrupos}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <GruposFamiliaresModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingGrupo}
            />
        </div>
    );
};

export default GruposFamiliaresPage;
