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

            // OJO: antes esto vivía en un "finally", así que isSubmitting
            // pasaba a false apenas terminaba el POST -- el overlay de
            // "Creando socio..." desaparecía de golpe, volvía a mostrarse
            // el wizard (ya inútil, el socio ya estaba creado) durante
            // 1.5s, y recién ahí navegaba. Ese parpadeo era lo que se veía
            // como "se cierra y no deja ver nada". Ahora el overlay se
            // queda montado hasta que efectivamente navegamos, y en vez de
            // volver al Panel general, vamos directo a la ficha del socio
            // recién creado para que quede visible que sí se creó.
            setTimeout(() => {
                navigate(newSocio?.SocNro ? `/socios/${newSocio.SocNro}` : '/');
            }, 1200);
        } catch (error) {
            console.error('Error creating socio:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Error al crear el socio';
            showToast(errorMessage, 'error');
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
