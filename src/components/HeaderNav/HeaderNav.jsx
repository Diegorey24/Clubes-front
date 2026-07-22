import { Link, NavLink, useLocation } from 'react-router-dom';
import styles from './HeaderNav.module.css';

// Páginas que "pertenecen" a Utilidades: cuando el usuario está en alguna de
// ellas (llegó ahí desde el hub /utilidades), el link de Utilidades en el
// nav principal se muestra resaltado, igual que Panel/Socios/Caja lo hacen
// con NavLink cuando su propia ruta está activa.
const UTILIDADES_PATHS = [
    '/utilidades',
    '/categorias-socios',
    '/grupos-familiares',
    '/rubros',
    '/radios',
    '/formapago',
    '/mediospago',
    '/motivos-baja',
    '/parametros',
    '/parametros-debitos',
    '/generar-cuotas',
    '/rechazos',
    '/generacion-archivos',
    '/usuarios',
];

const HeaderNav = ({ usuario, onLogout }) => {
    const location = useLocation();
    const isUtilidadesActive = UTILIDADES_PATHS.some((p) => location.pathname.startsWith(p));

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link to="/" className={styles.brand}>
                    <div className={styles.brandIcon}>
                        <img
                            src={`${import.meta.env.BASE_URL}Macrosoft.svg`}
                            alt=""
                            className={styles.brandIconImg}
                        />
                    </div>
                </Link>

                <nav className={styles.nav}>
                    <NavLink to="/" end className={styles.navLink}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        <span>Panel</span>
                    </NavLink>

                    <NavLink to="/socios" className={styles.navLink}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span>Socios</span>
                    </NavLink>

                    <NavLink to="/caja" className={styles.navLink}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                        </svg>
                        <span>Caja</span>
                    </NavLink>

                    <NavLink
                        to="/utilidades"
                        className={`${styles.navLink} ${isUtilidadesActive ? 'active' : ''}`}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>Utilidades</span>
                    </NavLink>

                    {usuario && (
                        <div className={styles.userMenu}>
                            <img
                                src={`${import.meta.env.BASE_URL}cliente.png`}
                                alt="Logo del club"
                                className={styles.clientLogo}
                            />
                            <span className={styles.userName}>{usuario.nombre}</span>
                            <button className={styles.logoutButton} onClick={onLogout} title="Cerrar sesión">
                                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h7a1 1 0 000-2H4V5h6a1 1 0 000-2H3zm11.293 4.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L15.586 12H9a1 1 0 010-2h6.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default HeaderNav;
