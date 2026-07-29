import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getSociosFichaMedicaVencimiento } from '../services/api';
import { PageHeader, BackLink, Button, Badge } from '../components/ui';
import { formatFecha } from '../utils/date';
import styles from './InformeCumpleanosPage.module.css'; // Misma estructura que el informe de Cumpleaños, se reutiliza el CSS

const MailIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const WhatsappIcon = (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path fillRule="evenodd" clipRule="evenodd" d="M12.004 2C6.486 2 2.01 6.477 2.01 11.994c0 1.995.585 3.847 1.596 5.407L2 22l4.729-1.578a9.945 9.945 0 005.275 1.51h.004c5.517 0 9.993-4.477 9.993-9.995C21.996 6.477 17.52 2 12.004 2zm0 18.09h-.003a8.09 8.09 0 01-4.126-1.13l-.296-.176-3.06 1.022 1.037-2.977-.194-.306a8.084 8.084 0 01-1.24-4.333c0-4.464 3.63-8.093 8.096-8.093 2.162 0 4.194.843 5.723 2.373a8.038 8.038 0 012.37 5.727c0 4.464-3.63 8.093-8.307 8.093z" />
    </svg>
);

// Trim seguro para campos char fijo que a veces llegan rellenados con
// espacios en blanco.
const trim = (value) => (value || '').toString().trim();

const toIsoDate = (d) => d.toISOString().slice(0, 10);
const getDefaultFecha = () => toIsoDate(new Date());

// Cantidad de días entre dos fechas "date-only" (ISO, ej. SocFchMed y la
// fecha buscada). Se arma con Date.UTC a partir de año/mes/día leídos del
// string, nunca con el constructor Date(string) directo, para no correr un
// día por la zona horaria del navegador (ver utils/date.js).
const diffDias = (fechaVtoIso, fechaBuscadaIso) => {
    const vto = String(fechaVtoIso).slice(0, 10);
    const buscada = String(fechaBuscadaIso).slice(0, 10);
    const matchVto = /^(\d{4})-(\d{2})-(\d{2})$/.exec(vto);
    const matchBuscada = /^(\d{4})-(\d{2})-(\d{2})$/.exec(buscada);
    if (!matchVto || !matchBuscada) return null;
    const msVto = Date.UTC(...matchVto.slice(1).map(Number));
    const msBuscada = Date.UTC(...matchBuscada.slice(1).map(Number));
    return Math.round((msBuscada - msVto) / 86400000);
};

// Link de WhatsApp a partir del celular cargado en la ficha. Uruguay: los
// celulares locales tienen 8 o 9 dígitos (con o sin el 0 inicial), así que
// si el número no trae ya un código de país se le antepone el 598.
const whatsappHref = (telCel) => {
    const digits = trim(telCel).replace(/\D/g, '');
    if (!digits) return null;
    const conCodigo = digits.length <= 9 ? `598${digits.replace(/^0+/, '')}` : digits;
    return `https://wa.me/${conCodigo}`;
};

const mailtoHref = (email) => {
    const value = trim(email);
    return value ? `mailto:${value}` : null;
};

// Informe "Vencimiento de Ficha Médica". Consume
// GET /socios/ficha-medica-vencimiento?fecha=YYYY-MM-DD, que no pagina:
// devuelve de una todos los socios cuya SocFchMed vence ANTES de la fecha
// pedida, ya ordenados por fecha de vencimiento, con el mismo detalle
// completo que GET /socios/:id (incluye datos de contacto, listos para
// avisarles, sin pedidos adicionales).
const InformeFichaMedicaVencimientoPage = ({ showToast }) => {
    const [fecha, setFecha] = useState(getDefaultFecha());
    const [socios, setSocios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        if (!fecha) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getSociosFichaMedicaVencimiento(fecha);
            setSocios(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading vencimiento de ficha médica:', err);
            const mensaje = err.response?.data?.error || 'Error al cargar el vencimiento de fichas médicas';
            setError(mensaje);
            setSocios([]);
            showToast?.(mensaje, 'error');
        } finally {
            setLoading(false);
        }
    }, [fecha, showToast]);

    useEffect(() => {
        load();
    }, [load]);

    const isFiltered = fecha !== getDefaultFecha();

    return (
        <div className={styles.page}>
            <BackLink to="/utilidades">Volver a Utilidades</BackLink>

            <PageHeader
                title="Vencimiento de Ficha Médica"
                subtitle="Socios cuya ficha médica vence antes de la fecha seleccionada, con sus datos de contacto para avisarles"
            />

            <div className={styles.filterBar}>
                <div className={styles.filterGroup}>
                    <label htmlFor="fecha">Vence antes de</label>
                    <input
                        type="date"
                        id="fecha"
                        className={styles.input}
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                    />
                </div>

                {isFiltered && (
                    <Button variant="ghost" size="sm" onClick={() => setFecha(getDefaultFecha())}>
                        Hoy
                    </Button>
                )}

                {!error && !loading && fecha && (
                    <div className={styles.resultsCount}>
                        {socios.length} socio{socios.length !== 1 ? 's' : ''} con ficha vencida
                    </div>
                )}
            </div>

            {!fecha ? (
                <p className={styles.error}>Seleccioná una fecha para ver qué fichas médicas están vencidas.</p>
            ) : error ? (
                <p className={styles.error}>{error}</p>
            ) : loading ? (
                <p className={styles.noData}>Buscando vencimientos...</p>
            ) : socios.length === 0 ? (
                <p className={styles.noData}>No hay socios con la ficha médica vencida antes de la fecha seleccionada.</p>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Socio</th>
                                <th>Vencimiento</th>
                                <th>Categoría</th>
                                <th>Radio</th>
                                <th>Email</th>
                                <th>Teléfono</th>
                                <th>Celular</th>
                                <th>Domicilio</th>
                                <th>Aviso</th>
                            </tr>
                        </thead>
                        <tbody>
                            {socios.map((socio) => {
                                const diasVencida = diffDias(socio.SocFchMed, fecha);
                                const emailHref = mailtoHref(socio.SocEMail);
                                const waHref = whatsappHref(socio.SocTelCel);

                                return (
                                    <tr key={socio.SocDocIde}>
                                        <td className={styles.nameCell}>
                                            <Link to={`/socios/${socio.SocNro}`} className={styles.socioLink}>
                                                {trim(socio.PrimerNombre)} {trim(socio.PrimerApellido)}
                                            </Link>
                                            <div className={styles.muted}>
                                                N.° {socio.SocNro} · CI {socio.SocDocIde}
                                            </div>
                                        </td>
                                        <td>
                                            <Badge variant="danger">{formatFecha(socio.SocFchMed)}</Badge>
                                            {diasVencida !== null && (
                                                <div className={styles.muted}>
                                                    Vencida hace {diasVencida} día{diasVencida !== 1 ? 's' : ''}
                                                </div>
                                            )}
                                        </td>
                                        <td>{trim(socio.CatNom) || '-'}</td>
                                        <td className={styles.muted}>{trim(socio.RADNOM) || '-'}</td>
                                        <td>{trim(socio.SocEMail) || '-'}</td>
                                        <td className={styles.muted}>{trim(socio.SocTel) || '-'}</td>
                                        <td className={styles.muted}>{trim(socio.SocTelCel) || '-'}</td>
                                        <td>{trim(socio.SocDom) || '-'}</td>
                                        <td>
                                            {emailHref || waHref ? (
                                                <div className={styles.saludoActions}>
                                                    {emailHref && (
                                                        <a
                                                            className={styles.saludoBtn}
                                                            href={emailHref}
                                                            title="Enviar email"
                                                            aria-label="Enviar email"
                                                        >
                                                            {MailIcon}
                                                        </a>
                                                    )}
                                                    {waHref && (
                                                        <a
                                                            className={styles.saludoBtnWhatsapp}
                                                            href={waHref}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            title="Enviar WhatsApp"
                                                            aria-label="Enviar WhatsApp"
                                                        >
                                                            {WhatsappIcon}
                                                        </a>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className={styles.muted}>-</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default InformeFichaMedicaVencimientoPage;
