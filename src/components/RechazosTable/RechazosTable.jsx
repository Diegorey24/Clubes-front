import { useState } from 'react';
import { rechazarPago } from '../../services/api';
import { Badge, ConfirmDialog } from '../ui';
import { formatFecha } from '../../utils/date';
import styles from './RechazosTable.module.css';

// El campo "Mes" llega como fecha (ej. 2026-04-01T00:00:00.000Z) pero
// representa el período del cargo, así que se muestra como MM/AAAA. Mismo
// criterio que en SocioDetailsPage.
const formatMonthYear = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '-';
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${month}/${d.getUTCFullYear()}`;
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(parseFloat(amount) || 0);
};

const RechazarIcon = (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
);

/**
 * Tabla de pagos de cuenta corriente candidatos a rechazo. Cada fila tiene
 * un botón "Rechazar" que abre un modal de confirmación y, al confirmar,
 * llama a rechazarPago(id) -- el backend vuelve el registro a estado "sin
 * pagar" (NroRecibo = 0, FechaPago = NULL, FormaPago = '').
 *
 * onRechazado se llama tras un rechazo exitoso para que la página recargue
 * la lista (el registro rechazado ya no debería figurar como pago de ese mes).
 */
const RechazosTable = ({ pagos, onRechazado }) => {
    const [target, setTarget] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const requestRechazo = (pago) => {
        setError('');
        setTarget(pago);
    };

    const closeConfirm = () => {
        if (loading) return;
        setTarget(null);
        setError('');
    };

    const confirmRechazo = async () => {
        if (!target) return;
        setLoading(true);
        setError('');
        try {
            await rechazarPago(target.Id);
            setTarget(null);
            onRechazado?.();
        } catch (err) {
            console.error('Error al rechazar el pago:', err);
            setError(
                err.response?.status === 404
                    ? 'El registro ya no existe.'
                    : 'No se pudo rechazar el pago. Intentá nuevamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    if (!pagos || pagos.length === 0) {
        return (
            <div className={styles.emptyState}>
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No se encontraron pagos para ese socio en el mes seleccionado</p>
            </div>
        );
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>N.° Recibo</th>
                        <th>Rubro</th>
                        <th>Mes</th>
                        <th>Fecha de Pago</th>
                        <th>Forma de Pago</th>
                        <th>Importe</th>
                        <th className={styles.actionsHeader}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {pagos.map((pago) => (
                        <tr key={pago.Id}>
                            <td className={styles.muted}>{pago.NroRecibo || '-'}</td>
                            <td className={styles.nameCell}>{pago.RubDsc?.trim() || `Rubro ${pago.Rubro ?? '-'}`}</td>
                            <td>{formatMonthYear(pago.Mes)}</td>
                            <td>
                                {pago.FechaPago ? (
                                    <Badge variant="success">{formatFecha(pago.FechaPago)}</Badge>
                                ) : (
                                    <Badge variant="danger">Sin pago</Badge>
                                )}
                            </td>
                            <td>{pago.FormaPago?.trim() || '-'}</td>
                            <td className={styles.amount}>{formatCurrency(pago.Importe)}</td>
                            <td className={styles.actionsCell}>
                                <button
                                    type="button"
                                    className={styles.rechazarBtn}
                                    onClick={() => requestRechazo(pago)}
                                    title="Rechazar pago"
                                >
                                    {RechazarIcon}
                                    <span>Rechazar</span>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ConfirmDialog
                isOpen={!!target}
                title="¿Rechazar este pago?"
                description="El registro va a volver a quedar como pendiente: se limpia el número de recibo, la fecha de pago y la forma de pago. Esta acción no se puede deshacer."
                confirmLabel="Sí, rechazar"
                cancelLabel="Cancelar"
                variant="danger"
                loading={loading}
                onConfirm={confirmRechazo}
                onCancel={closeConfirm}
            >
                {target && (
                    <div className={styles.confirmSummary}>
                        <div className={styles.confirmName}>{target.RubDsc?.trim() || `Rubro ${target.Rubro ?? '-'}`}</div>
                        <div className={styles.confirmMeta}>
                            <span>Recibo {target.NroRecibo || '-'}</span>
                            <span>·</span>
                            <span>{formatCurrency(target.Importe)}</span>
                        </div>
                    </div>
                )}
                {error && <p className={styles.confirmError}>{error}</p>}
            </ConfirmDialog>
        </div>
    );
};

export default RechazosTable;
