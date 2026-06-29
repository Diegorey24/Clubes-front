import styles from './Header.module.css';

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <div className={styles.logo}>
                    <div className={styles.logoIcon}>
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="32" height="32" rx="8" fill="url(#gradient)" />
                            <path d="M16 8L20 14H12L16 8Z" fill="white" />
                            <rect x="12" y="16" width="8" height="8" rx="2" fill="white" />
                            <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <span className={styles.logoText}>Gestión de Clubes</span>
                </div>
                <div className={styles.headerStatus}>
                    <div className={styles.statusIndicator}>
                        <span className={styles.statusDot}></span>
                        <span className={styles.statusText}>API Conectada</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
