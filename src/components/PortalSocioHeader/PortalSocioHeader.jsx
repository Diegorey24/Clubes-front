import styles from './PortalSocioHeader.module.css';

// Header propio del Portal del Socio: mismo lenguaje visual que el HeaderNav
// del staff (barra blanca fija arriba), pero con su propia identidad —
// logo del club, sin el menú de gestión, y el nombre del socio en vez del
// usuario administrativo.
const PortalSocioHeader = ({ socioNombre, onLogout, loading }) => {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.brand}>
                    <img
                        src={`${import.meta.env.BASE_URL}cliente.png`}
                        alt="Logo del club"
                        className={styles.logo}
                    />
                    <span className={styles.brandText}>Portal del Socio</span>
                </div>

                {!loading && (
                    <div className={styles.userMenu}>
                        <span className={styles.userName}>{socioNombre}</span>
                        <button className={styles.logoutButton} onClick={onLogout} title="Cerrar sesión">
                            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h7a1 1 0 000-2H4V5h6a1 1 0 000-2H3zm11.293 4.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L15.586 12H9a1 1 0 010-2h6.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span>Cerrar sesión</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default PortalSocioHeader;
