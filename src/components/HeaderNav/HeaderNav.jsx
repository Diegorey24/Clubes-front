import { useEffect, useState } from 'react';
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
    // '/formapago', // deshabilitado a pedido -- ver App.jsx / UtilidadesPage.jsx
    '/mediospago',
    '/motivos-baja',
    '/parametros',
    '/parametros-debitos',
    '/generar-cuotas',
    '/rechazos',
    '/generacion-archivos',
    '/usuarios',
];

const NAV_ITEMS = [
    {
        to: '/',
        end: true,
        label: 'Panel',
        icon: (
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        ),
    },
    {
        to: '/socios',
        label: 'Socios',
        icon: (
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        ),
    },
    {
        to: '/caja',
        label: 'Caja',
        icon: (
            <>
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </>
        ),
    },
    {
        to: '/utilidades',
        label: 'Utilidades',
        icon: (
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        ),
        matchPaths: UTILIDADES_PATHS,
    },
];

const HeaderNav = ({ usuario, onLogout }) => {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const closeMenu = () => setMenuOpen(false);

    // Evita el scroll de fondo mientras el menú móvil está abierto.
    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    const isItemActive = (item) => {
        if (item.matchPaths) {
            return item.matchPaths.some((p) => location.pathname.startsWith(p));
        }
        if (item.end) {
            return location.pathname === item.to;
        }
        return location.pathname.startsWith(item.to);
    };

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
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `${styles.navLink} ${isActive || isItemActive(item) ? styles.navLinkActive : ''}`
                            }
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                {item.icon}
                            </svg>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}

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

                <button
                    type="button"
                    className={`${styles.menuToggle} ${menuOpen ? styles.menuToggleOpen : ''}`}
                    onClick={() => setMenuOpen((open) => !open)}
                    aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                    aria-expanded={menuOpen}
                >
                    <span />
                    <span />
                    <span />
                </button>
            </div>

            <div
                className={`${styles.backdrop} ${menuOpen ? styles.backdropVisible : ''}`}
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
            />

            <nav
                id="mobile-nav"
                className={`${styles.mobileNav} ${menuOpen ? styles.mobileNavOpen : ''}`}
                aria-label="Menú principal"
            >
                {NAV_ITEMS.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={closeMenu}
                        className={({ isActive }) =>
                            `${styles.mobileNavLink} ${isActive || isItemActive(item) ? styles.mobileNavLinkActive : ''}`
                        }
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            {item.icon}
                        </svg>
                        <span>{item.label}</span>
                    </NavLink>
                ))}

                {usuario && (
                    <div className={styles.mobileUserMenu}>
                        <div className={styles.mobileUserInfo}>
                            <img
                                src={`${import.meta.env.BASE_URL}cliente.png`}
                                alt="Logo del club"
                                className={styles.mobileClientLogo}
                            />
                            <span className={styles.userName}>{usuario.nombre}</span>
                        </div>
                        <button
                            className={styles.mobileLogoutButton}
                            onClick={() => {
                                closeMenu();
                                onLogout();
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h7a1 1 0 000-2H4V5h6a1 1 0 000-2H3zm11.293 4.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L15.586 12H9a1 1 0 010-2h6.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span>Cerrar sesión</span>
                        </button>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default HeaderNav;
