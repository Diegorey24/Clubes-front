import styles from './Title.module.css';

const DEFAULT_TAG = {
    page: 'h1',
    section: 'h2',
    card: 'h3',
    modal: 'h2',
};

/**
 * Título unificado para toda la app.
 *
 * Variantes:
 *   page    -> encabezado principal de cada página (gradiente, grande)
 *   section -> subtítulo de sección dentro de una página
 *   card    -> título dentro de una card
 *   modal   -> título de un modal
 *
 * Ejemplos:
 *   <Title>Listado de Socios</Title>
 *   <Title variant="section">Datos personales</Title>
 *   <Title subtitle="Resumen general del club">Panel de Control</Title>
 */
const Title = ({ children, variant = 'page', as, subtitle, className = '', ...rest }) => {
    const Tag = as || DEFAULT_TAG[variant] || 'h2';
    const variantClass = styles[variant] || styles.page;

    return (
        <div className={styles.wrapper}>
            <Tag className={`${variantClass} ${className}`} {...rest}>
                {children}
            </Tag>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
    );
};

export default Title;
