import { useNavigate } from 'react-router-dom';
import styles from './BackLink.module.css';

const BackIcon = (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

/**
 * Link de "volver" con estilo delicado: solo texto + flecha, sin fondo ni
 * borde, pensado para ir arriba del contenido de una página (antes del
 * título). Al hacer hover, el texto se tiñe de primary y la flecha se
 * desliza levemente hacia la izquierda.
 *
 * Ejemplos:
 *   <BackLink to="/socios">Volver al listado</BackLink>
 *   <BackLink onClick={() => navigate(-1)}>Volver</BackLink>
 */
const BackLink = ({ children = 'Volver', to, onClick, className = '' }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (to) {
            navigate(to);
        }
    };

    return (
        <button type="button" className={`${styles.backLink} ${className}`} onClick={handleClick}>
            {BackIcon}
            {children}
        </button>
    );
};

export default BackLink;
