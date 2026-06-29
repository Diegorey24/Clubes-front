import { Link } from 'react-router-dom';
import styles from './Home.module.css';

const Home = () => {
    return (
        <div className={styles.home}>
            <div className={styles.hero}>
                <h1 className={styles.title}>Bienvenido al Sistema de Gestión</h1>
                <p className={styles.subtitle}>
                    Administra de forma eficiente todos los recursos de tu club
                </p>
            </div>

            <div className={styles.cardGrid}>
                <Link to="/agregar-socio" className={styles.card}>
                    <div className={styles.cardIcon}>
                        <svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                        </svg>
                    </div>
                    <h3 className={styles.cardTitle}>Agregar Socio</h3>
                    <p className={styles.cardDescription}>
                        Registra nuevos socios en el sistema
                    </p>
                    <div className={styles.cardArrow}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default Home;
