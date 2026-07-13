import Button from '../Button/Button';
import styles from './TableActions.module.css';

const EyeIcon = (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const EditIcon = (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const TrashIcon = (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

/**
 * Grupo estándar de acciones para filas de tabla: Ver / Editar / Eliminar.
 * Pensado para filas donde el click ya abre el detalle: deja las acciones
 * visibles como botones explícitos, para que el usuario no dependa de
 * "adivinar" que la fila es clickeable.
 *
 * Cada acción es opcional: si no pasás onView/onEdit/onDelete, ese botón
 * no se renderiza. El click en cualquier botón nunca dispara el click de
 * la fila (stopPropagation automático).
 *
 * Ejemplo:
 *   <TableActions
 *     onView={() => navigate(`/socios/${id}`)}
 *     onEdit={() => navigate(`/socios/edit/${id}`)}
 *     onDelete={() => handleDelete(id)}
 *   />
 */
const TableActions = ({ onView, onEdit, onDelete, size = 'sm', className = '' }) => {
    const withStop = (handler) => (e) => {
        e.stopPropagation();
        handler(e);
    };

    if (!onView && !onEdit && !onDelete) return null;

    return (
        <div
            className={`${styles.actions} ${className}`}
            onClick={(e) => e.stopPropagation()}
        >
            {onView && (
                <Button
                    variant="ghost"
                    size={size}
                    iconOnly
                    icon={EyeIcon}
                    title="Ver detalle"
                    aria-label="Ver detalle"
                    onClick={withStop(onView)}
                />
            )}
            {onEdit && (
                <Button
                    variant="ghost"
                    size={size}
                    iconOnly
                    icon={EditIcon}
                    title="Editar"
                    aria-label="Editar"
                    onClick={withStop(onEdit)}
                />
            )}
            {onDelete && (
                <Button
                    variant="ghost-danger"
                    size={size}
                    iconOnly
                    icon={TrashIcon}
                    title="Eliminar"
                    aria-label="Eliminar"
                    onClick={withStop(onDelete)}
                />
            )}
        </div>
    );
};

export default TableActions;
