import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import styles from './HeaderNav.module.css';

const UTILIDADES_PATHS = [
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
    const [utilidadesOpen, setUtilidadesOpen] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();
    const isUtilidadesActive = UTILIDADES_PATHS.some((p) => location.pathname.startsWith(p));

    useEffect(() => {
        if (!utilidadesOpen) return;
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setUtilidadesOpen(false);
            }
        };
        const handleEscape = (e) => {
            if (e.key === 'Escape') setUtilidadesOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [utilidadesOpen]);

    const closeDropdown = () => setUtilidadesOpen(false);

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

                    <div className={styles.dropdown} ref={dropdownRef}>
                        <button
                            type="button"
                            className={`${styles.dropdownTrigger} ${(utilidadesOpen || isUtilidadesActive) ? styles.dropdownTriggerActive : ''}`}
                            onClick={() => setUtilidadesOpen((open) => !open)}
                            aria-expanded={utilidadesOpen}
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>Utilidades</span>
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className={`${styles.chevron} ${utilidadesOpen ? styles.chevronOpen : ''}`}
                            >
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>

                        {utilidadesOpen && (
                            <div className={styles.dropdownContent}>
                                {usuario?.tipo === 'Administrador' && (
                                    <div className={styles.dropdownGroup}>
                                        <span className={styles.dropdownGroupLabel}>Administración</span>
                                        <NavLink to="/usuarios" className={styles.dropdownItem} onClick={closeDropdown}>
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                            </svg>
                                            <span>Usuarios</span>
                                        </NavLink>
                                    </div>
                                )}

                                <div className={styles.dropdownGroup}>
                                    <span className={styles.dropdownGroupLabel}>Tablas</span>
                                    <NavLink to="/categorias-socios" className={styles.dropdownItem} onClick={closeDropdown}>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                        </svg>
                                        <span>Categorías</span>
                                    </NavLink>
                                    <NavLink to="/grupos-familiares" className={styles.dropdownItem} onClick={closeDropdown}>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
                                        </svg>
                                        <span>Grupos Familiares</span>
                                    </NavLink>
                                    <NavLink to="/rubros" className={styles.dropdownItem} onClick={closeDropdown}>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                        </svg>
                                        <span>Rubros</span>
                                    </NavLink>
                                    <NavLink to="/radios" className={styles.dropdownItem} onClick={closeDropdown}>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1z m0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                        </svg>
                                        <span>Radios</span>
                                    </NavLink>
                                    <NavLink to="/formapago" className={styles.dropdownItem} onClick={closeDropdown}>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                                        </svg>
                                        <span>Forma de Pago</span>
                                    </NavLink>
                                    <NavLink to="/mediospago" className={styles.dropdownItem} onClick={closeDropdown}>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Medio de Pago</span>
                                    </NavLink>
                                    <NavLink to="/motivos-baja" className={styles.dropdownItem} onClick={closeDropdown}>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 2a1 1 0 01.894.553l7 14A1 1 0 0117 18H3a1 1 0 01-.894-1.447l7-14A1 1 0 0110 2zm0 5a1 1 0 00-1 1v3a1 1 0 102 0V8a1 1 0 00-1-1zm0 7a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                                        </svg>
                                        <span>Motivos de Baja</span>
                                    </NavLink>
                                </div>

                                <div className={styles.dropdownGroup}>
                                    <span className={styles.dropdownGroupLabel}>Parámetros</span>
                                    <NavLink to="/parametros" className={styles.dropdownItem} onClick={closeDropdown}>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                        </svg>
                                        <span>Parámetros</span>
                                    </NavLink>
                                    <NavLink to="/parametros-debitos" className={styles.dropdownItem} onClick={closeDropdown}>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                                        </svg>
                                        <span>Parámetros Débitos</span>
                                    </NavLink>
                                </div>

                                <div className={styles.dropdownGroup}>
                                    <NavLink to="/generar-cuotas" className={styles.dropdownItem} onClick={closeDropdown}>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h6.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm9 9a1 1 0 10-2 0v1H9a1 1 0 100 2h2v1a1 1 0 102 0v-1h2a1 1 0 100-2h-2v-1z" clipRule="evenodd" />
                                        </svg>
                                        <span>Generar Cuotas</span>
                                    </NavLink>
                                    <NavLink to="/rechazos" className={styles.dropdownItem} onClick={closeDropdown}>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <span>Rechazos</span>
                                    </NavLink>
                                    <NavLink to="/generacion-archivos" className={styles.dropdownItem} onClick={closeDropdown}>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                        </svg>
                                        <span>Generación de Archivos</span>
                                    </NavLink>
                                </div>
                            </div>
                        )}
                    </div>

                    {usuario && (
                        <div className={styles.userMenu}>
                            <img
                                src={`${import.meta.env.BASE_URL}cliente.svg`}
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
