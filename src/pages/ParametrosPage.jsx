import { useState, useEffect } from 'react';
import ParametrosForm from '../components/ParametrosForm/ParametrosForm';
import Toast from '../components/Toast/Toast';
import { fetchItems, updateItem } from '../services/api';
import styles from './ParametrosPage.module.css';

const ParametrosPage = () => {
    const [parametros, setParametros] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    useEffect(() => {
        loadParametros();
    }, []);

    const loadParametros = async () => {
        try {
            setLoading(true);
            const data = await fetchItems('parametros');
            // fetchItems devuelve array, tomamos el primer elemento (configuración única)
            setParametros(Array.isArray(data) ? data[0] : data);
            setError(null);
        } catch (err) {
            setError('Error al cargar los parámetros');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const handleSave = async (data) => {
        try {
            // No hay "id" en la ruta, se actualiza directamente
            await updateItem('parametros', '', data);
            showToast('Parámetros actualizados exitosamente', 'success');
            loadParametros();
        } catch (err) {
            showToast('Error al actualizar los parámetros', 'error');
            console.error('Error saving parametros:', err);
        }
    };

    const handleCancel = () => {
        // Recargar los datos originales
        loadParametros();
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Cargando parámetros...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.page}>
                <div className={styles.error}>
                    <p>{error}</p>
                    <button onClick={loadParametros} className={styles.retryBtn}>
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Configuración de Parámetros</h2>
                        <p className={styles.subtitle}>
                            Administra la configuración general de la aplicación
                        </p>
                    </div>
                </div>

                <div className={styles.formContainer}>
                    {parametros && (
                        <ParametrosForm
                            initialData={parametros}
                            onSubmit={handleSave}
                            onCancel={handleCancel}
                        />
                    )}
                </div>
            </div>

            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ show: false, message: '', type: '' })}
                />
            )}
        </div>
    );
};

export default ParametrosPage;
