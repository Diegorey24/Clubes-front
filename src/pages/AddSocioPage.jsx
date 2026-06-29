import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSocio } from '../services/api';
import AddSocioWizard from '../components/AddSocioWizard/AddSocioWizard';
import styles from './AddSocioPage.module.css';

const AddSocioPage = ({ showToast }) => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            const newSocio = await createSocio(formData);
            showToast(`Socio creado exitosamente. Número: ${newSocio.SocNro}`, 'success');

            // Navigate back to home after 1.5 seconds
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (error) {
            console.error('Error creating socio:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Error al crear el socio';
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {isSubmitting && (
                    <div className={styles.loadingOverlay}>
                        <div className={styles.spinner}></div>
                        <p>Creando socio...</p>
                    </div>
                )}
                <AddSocioWizard onSubmit={handleSubmit} showToast={showToast} />
            </div>
        </div>
    );
};

export default AddSocioPage;
