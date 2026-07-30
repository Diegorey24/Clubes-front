import { useState, Fragment } from 'react';
import { Badge } from '../ui';
import { formatFecha } from '../../utils/date';
import styles from './SociosDeudasTable.module.css';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(amount || 0);
};

const ChevronIcon = ({ expanded }) => (
    <svg
        className={`${styles.chevron} ${expanded ? styles.chevronExpanded : ''}`}
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

// Tabla del informe "Listado de socios y sus deudas". Cada fila se puede
// expandir para ver el detalle de los movimientos pendientes (DetalleDeuda)
// que ya vienen incluidos en la respuesta del endpoint /socios/deudas, así
// que expandir no dispara ningún pedido nuevo al backend.
const SociosDeudasTable = ({ socios }) => {
    const [expanded, setExpanded] = useState(() => new Set());

    const toggleRow = (nroSocio) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(nroSocio)) {
                next.delete(nroSocio);
            } else {
                next.add(nroSocio);
            }
            return next;
        });
    };

    if (!socios || socios.length === 0) {
        return (
            <div className={styles.tableContainer}>
                <div className={styles.emptyState}>
                    <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <p>No hay socios que coincidan con la búsqueda</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.expandHeader}></th>
                        <th>N° Socio</th>
                        <th>Cédula</th>
                        <th>Nombre Completo</th>
                        <th>Categoría</th>
                        <th>Radio</th>
                        <th className={styles.amountHeader}>Deuda</th>
                    </tr>
                </thead>
                <tbody>
                    {socios.map((socio) => {
                        const isExpanded = expanded.has(socio.NroSocio);
                        const tieneDeuda = (socio.Deuda || 0) > 0;
                        const detalle = socio.DetalleDeuda || [];
                        return (
                            <Fragment key={socio.NroSocio}>
                                <tr
                                    onClick={() => toggleRow(socio.NroSocio)}
                                    className={tieneDeuda ? styles.rowClickable : styles.rowClickableMuted}
                                    title={tieneDeuda ? 'Ver detalle de la deuda' : 'Este socio no tiene deuda'}
                                >
                                    <td className={styles.expandCell}>
                                        {detalle.length > 0 && <ChevronIcon expanded={isExpanded} />}
                                    </td>
                                    <td className={styles.muted}>{socio.NroSocio}</td>
                                    <td>{socio.CI}</td>
                                    <td className={styles.nameCell}>{socio.Nombres} {socio.Apellidos}</td>
                                    <td>
                                        {socio.Categoria
                                            ? <Badge variant="primary">{socio.Categoria}</Badge>
                                            : <span className={styles.muted}>-</span>}
                                    </td>
                                    <td className={styles.muted}>{socio.Radio || '-'}</td>
                                    <td className={styles.amountCell}>
                                        {tieneDeuda
                                            ? <span className={styles.deudaAmount}>{formatCurrency(socio.Deuda)}</span>
                                            : <Badge variant="success">Al día</Badge>}
                                    </td>
                                </tr>
                                {isExpanded && detalle.length > 0 && (
                                    <tr className={styles.detailRow}>
                                        <td colSpan={7}>
                                            <table className={styles.detailTable}>
                                                <thead>
                                                    <tr>
                                                        <th>Mes</th>
                                                        <th>Rubro</th>
                                                        <th>Vencimiento</th>
                                                        <th className={styles.amountHeader}>Importe</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {detalle.map((mov) => (
                                                        <tr key={mov.Id}>
                                                            <td>{formatFecha(mov.Mes)}</td>
                                                            <td>{mov.RubDsc || '-'}</td>
                                                            <td>{formatFecha(mov.FechaVto)}</td>
                                                            <td className={styles.amountCell}>{formatCurrency(mov.Importe)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default SociosDeudasTable;
