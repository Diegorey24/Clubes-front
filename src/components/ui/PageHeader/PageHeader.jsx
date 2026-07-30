import Title from '../Title/Title';
import styles from './PageHeader.module.css';

/**
 * Encabezado estándar de página: título (+ subtítulo opcional) a la izquierda
 * y acciones (botones) a la derecha. Reemplaza el patrón repetido de
 * <div className={styles.header}><h2>...</h2><button>...</button></div>
 * que existía duplicado en casi todas las páginas.
 *
 * Ejemplo:
 *   <PageHeader
 *     title="Listado de Socios"
 *     subtitle="Gestioná altas, bajas y modificaciones"
 *     actions={<Button to="/agregar-socio" icon={<PlusIcon />}>Nuevo Socio</Button>}
 *   />
 */
const PageHeader = ({ title, subtitle, actions, variant = 'page' }) => (
    <div className={styles.header}>
        <Title variant={variant} subtitle={subtitle}>{title}</Title>
        {actions && <div className={styles.actions}>{actions}</div>}
    </div>
);

export default PageHeader;
