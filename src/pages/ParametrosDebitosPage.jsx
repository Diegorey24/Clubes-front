import { useState, useEffect } from 'react';
import ParametrosDebitosTable from '../components/ParametrosDebitosTable/ParametrosDebitosTable';
import ParametrosDebitosModal from '../components/ParametrosDebitosModal/ParametrosDebitosModal';
import { PageHeader } from '../components/ui';
import { getParametrosDebitos, updateParametroDebito } from '../services/api';
import styles from './ParametrosDebitosPage.module.css';

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

const ParametrosDebitosPage = ({ showToast }) => {
    const [parametros, setParametros] = useState([]);
    const [filteredParametros, setFilteredParametros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('view'); // 'view' | 'edit'
    const [editingParametro, setEditingParametro] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadParametros();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        filterParametros();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parametros, searchTerm]);

    const loadParametros = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getParametrosDebitos();
            setParametros(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading parámetros de débitos:', err);
            setError('Error al cargar los parámetros de débitos');
            showToast('Error al cargar parámetros de débitos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filterParametros = () => {
        let filtered = [...parametros];

        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.Nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.CodComercio?.toString().toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredParametros(filtered);
    };

    const handleEdit = (parametro) => {
        setEditingParametro(parametro);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (parametro) => {
        setEditingParametro(parametro);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleSubmit = async (data) => {
        try {
            await updateParametroDebito(editingParametro.Nombre, data);
            showToast('Parámetro actualizado exitosamente', 'success');
            setIsModalOpen(false);
            loadParametros();
        } catch (err) {
            console.error('Error saving parámetro de débito:', err);
            showToast('Error al guardar el parámetro', 'error');
        }
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando parámetros de débitos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <PageHeader
                title="Parámetros de Débitos"
                subtitle="Configuración de código de comercio y sucursal por financiera"
            />

            <div className={styles.filtersCard}>
                <div className={styles.searchBox}>
                    {SearchIcon}
                    <input
                        type="text"
                        placeholder="Buscar por financiera o código de comercio"
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
                    {filteredParametros.length} de {parametros.length} parámetro{parametros.length !== 1 ? 's' : ''}
                </div>
            </div>

            {error ? (
                <p className={styles.error}>{error}</p>
            ) : (
                <ParametrosDebitosTable
                    parametros={filteredParametros}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDeleted={loadParametros}
                />
            )}

            <ParametrosDebitosModal
                isOpen={isModalOpen}
                mode={modalMode}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                onRequestEdit={() => setModalMode('edit')}
                initialData={editingParametro}
            />
        </div>
    );
};

export default ParametrosDebitosPage;
