import { useState, useEffect } from 'react';
import { getFichaSocio, getCuentaCorrienteSocio, actualizarDatosSocio, cambiarContrasenaSocio } from '../services/api';
import { formatFecha } from '../utils/date';
import PortalSocioHeader from '../components/PortalSocioHeader/PortalSocioHeader';
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
    const [cambioPass, setCambioPass] = useState(false);
    const [passForm, setPassForm] = useState({ actual: '', nueva: '', confirmar: '' });
    const [guardandoPass, setGuardandoPass] = useState(false);

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
                <PortalSocioHeader socioNombre="" onLogout={onLogout} loading />
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando...</p>
                </div>
            </div>
        );
    }

    const nombreCompleto = `${ficha.PrimerNombre?.trim() || ''} ${ficha.SegundoNombre?.trim() || ''} ${ficha.PrimerApellido?.trim() || ''} ${ficha.SegundoApellido?.trim() || ''}`.replace(/\s+/g, ' ').trim();
    const iniciales = `${ficha.PrimerNombre?.trim()?.[0] || ''}${ficha.PrimerApellido?.trim()?.[0] || ''}`.toUpperCase();

    const pendientes = cuentaCorriente.filter((row) => row.NroRecibo === 0);
    const totalDeuda = pendientes.reduce((acc, row) => acc + (row.Importe || 0), 0);
    const ultimoPago = cuentaCorriente
        .filter((row) => row.NroRecibo !== 0 && row.FechaPago)
        .sort((a, b) => new Date(b.FechaPago) - new Date(a.FechaPago))[0];
    const cuentaCorrienteOrdenada = [...cuentaCorriente].sort((a, b) =>
        String(b.Aniomes).localeCompare(String(a.Aniomes))
    );

    const handleCambiarContrasena = async () => {
        if (!passForm.actual || !passForm.nueva || !passForm.confirmar) {
            showToast('Completá todos los campos', 'error');
            return;
        }
        if (passForm.nueva !== passForm.confirmar) {
            showToast('Las contraseñas nuevas no coinciden', 'error');
            return;
        }
        if (passForm.nueva.length < 6) {
            showToast('La contraseña nueva debe tener al menos 6 caracteres', 'error');
            return;
        }
        setGuardandoPass(true);
        try {
            await cambiarContrasenaSocio(socio.ci, passForm.actual, passForm.nueva);
            showToast('Contraseña actualizada correctamente', 'success');
            setCambioPass(false);
            setPassForm({ actual: '', nueva: '', confirmar: '' });
        } catch (err) {
            showToast(err.response?.data?.error || 'Error al cambiar la contraseña', 'error');
        } finally {
            setGuardandoPass(false);
        }
    };

    return (
        <div className={styles.page}>
            <PortalSocioHeader socioNombre={nombreCompleto} onLogout={onLogout} />

            <div className={styles.container}>
                <div className={styles.welcome}>
                    <div className={styles.avatar}>{iniciales}</div>
                    <div>
                        <h1 className={styles.welcomeTitle}>Hola, {ficha.PrimerNombre?.trim() || nombreCompleto}</h1>
                        <p className={styles.welcomeSubtitle}>Este es el resumen de tu cuenta como socio.</p>
                    </div>
                </div>

                {/* Resumen rápido */}
                <div className={styles.statsGrid}>
                    <div className={`${styles.statCard} ${pendientes.length > 0 ? styles.statCardWarning : styles.statCardOk}`}>
                        <span className={styles.statLabel}>Cuotas pendientes</span>
                        <span className={styles.statValue}>{pendientes.length}</span>
                    </div>
                    <div className={`${styles.statCard} ${pendientes.length > 0 ? styles.statCardWarning : styles.statCardOk}`}>
                        <span className={styles.statLabel}>Saldo pendiente</span>
                        <span className={styles.statValue}>${totalDeuda.toFixed(2)}</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Último pago</span>
                        <span className={styles.statValue}>{ultimoPago ? formatFecha(ultimoPago.FechaPago) : '-'}</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Socio desde</span>
                        <span className={styles.statValue}>{formatFecha(ficha.SocFchIng)}</span>
                    </div>
                </div>

                {/* Ficha */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>
                            <svg className={styles.cardIcon} width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            Mi ficha
                        </h3>
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

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>
                            <svg className={styles.cardIcon} width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            Contraseña
                        </h3>
                        {!cambioPass && (
                            <button className="btn-primary" onClick={() => setCambioPass(true)}>
                                Cambiar contraseña
                            </button>
                        )}
                    </div>
                    {cambioPass && (
                        <div className={styles.cardBody}>
                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Contraseña actual</span>
                                    <input
                                        className={styles.input}
                                        type="password"
                                        value={passForm.actual}
                                        onChange={e => setPassForm({ ...passForm, actual: e.target.value })}
                                    />
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Nueva contraseña</span>
                                    <input
                                        className={styles.input}
                                        type="password"
                                        value={passForm.nueva}
                                        onChange={e => setPassForm({ ...passForm, nueva: e.target.value })}
                                    />
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Confirmar nueva contraseña</span>
                                    <input
                                        className={styles.input}
                                        type="password"
                                        value={passForm.confirmar}
                                        onChange={e => setPassForm({ ...passForm, confirmar: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className={styles.actions}>
                                <button className="btn-primary" onClick={handleCambiarContrasena} disabled={guardandoPass}>
                                    {guardandoPass ? 'Guardando...' : 'Guardar'}
                                </button>
                                <button className="btn-secondary" onClick={() => { setCambioPass(false); setPassForm({ actual: '', nueva: '', confirmar: '' }); }}>
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Cuenta corriente */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>
                            <svg className={styles.cardIcon} width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 3a1 1 0 011-1h3a1 1 0 110 2H5a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                            Mi cuenta corriente
                        </h3>
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
                                    {cuentaCorrienteOrdenada.length === 0 ? (
                                        <tr><td className={styles.emptyRow} colSpan={5}>No hay registros</td></tr>
                                    ) : (
                                        cuentaCorrienteOrdenada.map((row) => (
                                            <tr key={row.Id} className={row.NroRecibo === 0 ? styles.rowPending : undefined}>
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
