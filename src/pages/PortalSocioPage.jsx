import { useState, useEffect } from 'react';
import { getFichaSocio, getCuentaCorrienteSocio, actualizarDatosSocio } from '../services/api';
import { formatFecha } from '../utils/date';
import styles from './PortalSocioPage.module.css';

const PortalSocioPage = ({ socio, onLogout, showToast }) => {
    const [ficha, setFicha] = useState(null);
    const [cuentaCorriente, setCuentaCorriente] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editando, setEditando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [formData, setFormData] = useState({
        SocTel: '', SocTelCel: '', SocEMail: '', SocDom: ''
    });

    useEffect(() => {
        cargar();
    }, []);

    const cargar = async () => {
        setLoading(true);
        try {
            const [fichaData, ccData] = await Promise.all([
                getFichaSocio(socio.ci),
                getCuentaCorrienteSocio(socio.ci)
            ]);
            setFicha(fichaData);
            setCuentaCorriente(ccData);
            setFormData({
                SocTel: fichaData.SocTel?.trim() || '',
                SocTelCel: fichaData.SocTelCel?.trim() || '',
                SocEMail: fichaData.SocEMail?.trim() || '',
                SocDom: fichaData.SocDom?.trim() || '',
            });
        } catch (err) {
            showToast('Error al cargar los datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGuardar = async () => {
        setGuardando(true);
        try {
            await actualizarDatosSocio(socio.ci, formData);
            showToast('Datos actualizados correctamente', 'success');
            setEditando(false);
            cargar();
        } catch (err) {
            showToast('Error al actualizar los datos', 'error');
        } finally {
            setGuardando(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando...</p>
                </div>
            </div>
        );
    }

    const nombreCompleto = `${ficha.PrimerNombre?.trim() || ''} ${ficha.SegundoNombre?.trim() || ''} ${ficha.PrimerApellido?.trim() || ''} ${ficha.SegundoApellido?.trim() || ''}`.replace(/\s+/g, ' ').trim();
    const iniciales = `${ficha.PrimerNombre?.trim()?.[0] || ''}${ficha.PrimerApellido?.trim()?.[0] || ''}`.toUpperCase();

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <div className={styles.avatar}>{iniciales}</div>
                        <div>
                            <h2 className={styles.title}>{nombreCompleto}</h2>
                            <p className={styles.subtitle}>Portal del Socio</p>
                        </div>
                    </div>
                    <button className="btn-secondary" onClick={onLogout}>
                        Cerrar sesión
                    </button>
                </div>

                {/* Ficha */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>Mi ficha</h3>
                        {!editando && (
                            <button className="btn-primary" onClick={() => setEditando(true)}>
                                Editar mis datos
                            </button>
                        )}
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Cédula</span>
                                <span className={styles.infoValue}>{ficha.SocDocIde}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Fecha de nacimiento</span>
                                <span className={styles.infoValue}>{formatFecha(ficha.SocFchNac)}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Fecha de ingreso</span>
                                <span className={styles.infoValue}>{formatFecha(ficha.SocFchIng)}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Mutual</span>
                                <span className={styles.infoValue}>{ficha.SocMut?.trim() || '-'}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Teléfono</span>
                                {editando ? (
                                    <input className={styles.input} value={formData.SocTel} onChange={(e) => setFormData({ ...formData, SocTel: e.target.value })} />
                                ) : (
                                    <span className={styles.infoValue}>{ficha.SocTel?.trim() || '-'}</span>
                                )}
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Celular</span>
                                {editando ? (
                                    <input className={styles.input} value={formData.SocTelCel} onChange={(e) => setFormData({ ...formData, SocTelCel: e.target.value })} />
                                ) : (
                                    <span className={styles.infoValue}>{ficha.SocTelCel?.trim() || '-'}</span>
                                )}
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Mail</span>
                                {editando ? (
                                    <input className={styles.input} value={formData.SocEMail} onChange={(e) => setFormData({ ...formData, SocEMail: e.target.value })} />
                                ) : (
                                    <span className={styles.infoValue}>{ficha.SocEMail?.trim() || '-'}</span>
                                )}
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Domicilio</span>
                                {editando ? (
                                    <input className={styles.input} value={formData.SocDom} onChange={(e) => setFormData({ ...formData, SocDom: e.target.value })} />
                                ) : (
                                    <span className={styles.infoValue}>{ficha.SocDom?.trim() || '-'}</span>
                                )}
                            </div>
                        </div>

                        {editando && (
                            <div className={styles.actions}>
                                <button className="btn-primary" onClick={handleGuardar} disabled={guardando}>
                                    {guardando ? 'Guardando...' : 'Guardar'}
                                </button>
                                <button className="btn-secondary" onClick={() => setEditando(false)}>
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cuenta corriente */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>Mi cuenta corriente</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Período</th>
                                        <th>Importe</th>
                                        <th>Estado</th>
                                        <th>Fecha pago</th>
                                        <th>Forma de pago</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cuentaCorriente.length === 0 ? (
                                        <tr><td className={styles.emptyRow} colSpan={5}>No hay registros</td></tr>
                                    ) : (
                                        cuentaCorriente.map((row) => (
                                            <tr key={row.Id}>
                                                <td data-label="Período">{row.Aniomes}</td>
                                                <td data-label="Importe" className={styles.amount}>${row.Importe?.toFixed(2)}</td>
                                                <td data-label="Estado">
                                                    <span className={`${styles.badge} ${row.NroRecibo === 0 ? styles.badgePending : styles.badgePaid}`}>
                                                        {row.NroRecibo === 0 ? 'Pendiente' : 'Pagado'}
                                                    </span>
                                                </td>
                                                <td data-label="Fecha pago">{formatFecha(row.FechaPago)}</td>
                                                <td data-label="Forma de pago">{row.FormaPago?.trim() || '-'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortalSocioPage;
