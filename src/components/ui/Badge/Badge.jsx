import styles from './Badge.module.css';

/**
 * Pill de estado, mismo lenguaje visual "soft" que las variantes soft de Button.
 *
 * Variantes: neutral | primary | success | danger | glass | glass-success | glass-danger
 *   - glass: pensada para usar sobre fondos de color (headers con gradiente),
 *     fondo blanco translúcido + blur.
 *   - glass-success / glass-danger: igual que glass pero con un tinte de
 *     color (verde/rojo) para transmitir estado sin perder legibilidad
 *     sobre el degradé.
 *
 * Ejemplo:
 *   <Badge variant="success">Activo</Badge>
 *   <Badge variant="primary">{categoria.nombre}</Badge>
 */
const Badge = ({ children, variant = 'neutral', className = '' }) => (
    <span className={`${styles.badge} ${styles[variant] || styles.neutral} ${className}`}>
        {children}
    </span>
);

export default Badge;
