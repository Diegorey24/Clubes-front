import { Link } from 'react-router-dom';
import styles from './Button.module.css';

/**
 * Botón unificado para toda la app.
 *
 * Variantes: primary | secondary | success | danger | ghost | outline | ghost-danger
 *            | soft | soft-success | soft-danger (fondo pastel, look más etéreo)
 *            | glass (translúcido, para usar sobre headers con fondo de color)
 * Tamaños: sm | md | lg
 *
 * Ejemplos:
 *   <Button onClick={...}>Guardar</Button>
 *   <Button variant="secondary" to="/socios-historicos" icon={<HistoryIcon />}>Histórico</Button>
 *   <Button variant="danger" size="sm" iconOnly icon={<TrashIcon />} title="Eliminar" onClick={...} />
 *   <Button loading>Guardando...</Button>
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    iconOnly = false,
    fullWidth = false,
    loading = false,
    disabled = false,
    to,
    href,
    type = 'button',
    className = '',
    ...rest
}) => {
    const classes = [
        styles.btn,
        styles[variant],
        styles[size],
        iconOnly && styles.iconOnly,
        fullWidth && styles.fullWidth,
        loading && styles.isLoading,
        className,
    ].filter(Boolean).join(' ');

    const isDisabled = disabled || loading;

    const label = !iconOnly && children ? <span className={styles.label}>{children}</span> : null;
    const ariaLabel = rest['aria-label'] || (iconOnly && typeof children === 'string' ? children : undefined);

    const content = (
        <>
            {loading && <span className={styles.spinner} aria-hidden="true" />}
            {!loading && icon && iconPosition === 'left' && (
                <span className={styles.icon} aria-hidden="true">{icon}</span>
            )}
            {!loading && label}
            {!loading && icon && iconPosition === 'right' && (
                <span className={styles.icon} aria-hidden="true">{icon}</span>
            )}
        </>
    );

    if (to && !isDisabled) {
        return (
            <Link to={to} className={classes} aria-label={ariaLabel} {...rest}>
                {content}
            </Link>
        );
    }

    if (href && !isDisabled) {
        return (
            <a href={href} className={classes} aria-label={ariaLabel} {...rest}>
                {content}
            </a>
        );
    }

    return (
        <button
            type={type}
            className={classes}
            disabled={isDisabled}
            aria-label={ariaLabel}
            aria-busy={loading || undefined}
            {...rest}
        >
            {content}
        </button>
    );
};

export default Button;
