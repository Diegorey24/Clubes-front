import styles from './Footer.module.css';

const Footer = ({ label = 'Gestión de Socios' }) => {
    const year = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.content}>
                <span className={styles.text}>
                    © {year}
                </span>
                <span className={styles.creditLabel}>{label}</span>
                <img
                    src={`${import.meta.env.BASE_URL}Macrosoft-wh.png`}
                    alt="Macrosoft"
                    className={styles.logo}
                />
            </div>
        </footer>
    );
};

export default Footer;
