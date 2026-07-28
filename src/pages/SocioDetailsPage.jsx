import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSocioById, getSocioHistoricoById, subirFotoSocio } from '../services/api';
import { Button, Badge, Tabs, Title, BackLink } from '../components/ui';
import { formatFecha } from '../utils/date';
import { generarReciboPDF } from '../utils/reciboPdf';
import CrearCargoModal from '../components/CrearCargoModal/CrearCargoModal';
import AnularCargoModal from '../components/AnularCargoModal/AnularCargoModal';
import styles from './SocioDetailsPage.module.css';
const API_BASE_URL = window.globalConfig?.API_URL || import.meta.env.VITE_API_BASE_URL || 'https://apis.devmacrosoft.com/CLUBES_API/api';
const FOTOS_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

// Placeholder de "N.° Recibo" que usa la API para los débitos automáticos:
// no generan un recibo de cobro real, así que en vez de un recibo se arma
// un comprobante de pago distinto, usando el Nro de Emisión (mov.Id).
const NRO_RECIBO_DEBITO_AUTOMATICO = 9999999;

// Pestaña "Datos del Responsable" deshabilitada por ahora (a pedido).
// Se deja el código comentado para poder reactivarla más adelante.
// const RESPONSABLE_FIELDS = [
//     'ResponsableCI',
//     'ResponsableApellido',
//     'ResponsableNombre',
//     'ResponsableDomicilio',
//     'ResponsableDomicilioNroPuerta',
//     'ResponsableDomicilioApto',
//     'ResponsablePresentoDJ',
// ];

// Personas autorizadas a retirar a un socio menor de edad: hasta 3, cada
// una con CI, nombre y teléfono.
const AUTORIZADOS_KEYS = [1, 2, 3];

const EditIcon = (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const DebtIcon = (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2m9-8a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const InfoIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const PlusIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const MinusIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
    </svg>
);

const DownloadIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

// Por defecto, la cuenta corriente se filtra desde el primer día del mes,
// un año atrás, hasta hoy. Por ejemplo si hoy es 14/07/2026, se busca desde
// el 01/07/2025. Esto evita traer demasiados registros en cada llamado,
// cubriendo igualmente cualquier movimiento emitido a comienzos de mes.
const getDefaultDateRange = () => {
    const fmt = (d) => d.toISOString().slice(0, 10);
    const end = new Date();
    const start = new Date(end.getFullYear() - 1, end.getMonth(), 1);
    return { start: fmt(start), end: fmt(end) };
};

const SocioDetailsPage = ({ isHistorical = false, usuario, showToast }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [socio, setSocio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const defaultDateRange = getDefaultDateRange();
    const [cuentaCorriente, setCuentaCorriente] = useState([]);
    const [loadingCC, setLoadingCC] = useState(false);
    const [ccLoaded, setCcLoaded] = useState(false);
    const [startDate, setStartDate] = useState(defaultDateRange.start);
    const [endDate, setEndDate] = useState(defaultDateRange.end);
    const [activeTab, setActiveTab] = useState('info');

    // Orden de la cuenta corriente (propia y familiar): 'vencimiento-desc'
    // es el que ya trae la API por defecto (lo más nuevo primero), así que
    // arranca ahí para no cambiar el comportamiento actual. El usuario
    // puede elegir otra combinación desde el combo.
    const [orden, setOrden] = useState('vencimiento-desc');

    const [cuentaCorrienteFamiliar, setCuentaCorrienteFamiliar] = useState([]);
    const [loadingCCFam, setLoadingCCFam] = useState(false);
    const [ccFamLoaded, setCcFamLoaded] = useState(false);

    const [isCrearCargoOpen, setIsCrearCargoOpen] = useState(false);
    const [isAnularCargoOpen, setIsAnularCargoOpen] = useState(false);

    const [fotoKey, setFotoKey] = useState(Date.now());
    const [fotoExt, setFotoExt] = useState('jpg');
    const [fotoError, setFotoError] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(amount);
    };

    // El campo "Mes" llega como fecha (ej. 2026-04-01T00:00:00.000Z) pero
    // representa el período del cargo, así que lo mostramos como MM/AAAA.
    const formatMonthYear = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        return `${month}/${d.getUTCFullYear()}`;
    };

    // startDate/endDate son strings 'AAAA-MM-DD' (del input type=date); se
    // formatean a mano para evitar corrimientos de huso horario con Date().
    const formatDateStr = (dateStr) => {
        if (!dateStr) return '-';
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    // Trim seguro: varios campos de texto llegan de la base rellenados con
    // espacios (char fijo), incluso cuando "no tienen dato".
    const trim = (value) => (value || '').toString().trim();

    useEffect(() => {
        loadSocio();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadSocio = async () => {
        setLoading(true);
        try {
            const fetchFn = isHistorical ? getSocioHistoricoById : getSocioById;
            const data = await fetchFn(id);
            if (data) {
                setSocio(data);
            } else {
                setError('Socio no encontrado');
            }
        } catch (err) {
            console.error('Error loading socio:', err);
            setError('Error al cargar los datos del socio');
        } finally {
            setLoading(false);
        }
    };

    const handleSubirFoto = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            await subirFotoSocio(socio.SocDocIde, file);
            setFotoError(false);
            setFotoKey(Date.now());
            showToast?.('Foto actualizada correctamente', 'success');
        } catch (err) {
            console.error('Error subiendo foto:', err);
            showToast?.('Error al subir la foto', 'error');
        }
    };


    const loadCuentaCorriente = async (ci, from = startDate, to = endDate, ordenValue = orden) => {
        setLoadingCC(true);
        try {
            const { getCuentaCorriente } = await import('../services/api');
            const [orderBy, orderDir] = ordenValue.split('-');
            const data = await getCuentaCorriente(ci, from, to, orderBy, orderDir);
            setCuentaCorriente(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading cuenta corriente:', err);
            showToast?.(err.message || 'Error al cargar la cuenta corriente', 'error');
        } finally {
            setLoadingCC(false);
            setCcLoaded(true);
        }
    };

    const loadCuentaCorrienteFamiliar = async (ci, ordenValue = orden) => {
        setLoadingCCFam(true);
        try {
            const { getCuentaCorrienteFamiliar } = await import('../services/api');
            const [orderBy, orderDir] = ordenValue.split('-');
            const data = await getCuentaCorrienteFamiliar(ci, startDate, endDate, orderBy, orderDir);
            setCuentaCorrienteFamiliar(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading cuenta corriente familiar:', err);
            showToast?.(err.message || 'Error al cargar la cuenta corriente familiar', 'error');
        } finally {
            setLoadingCCFam(false);
            setCcFamLoaded(true);
        }
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        if (tabId === 'cuentaCorriente' && !ccLoaded && socio?.SocDocIde) {
            loadCuentaCorriente(socio.SocDocIde);
        }
        if (tabId === 'cuentaCorrienteFamiliar' && !ccFamLoaded && socio?.SocDocIde) {
            loadCuentaCorrienteFamiliar(socio.SocDocIde);
        }
    };

    // Cambiar el orden recarga la pestaña que se está viendo ahora mismo, y
    // marca la otra como "no cargada" para que traiga el orden nuevo la
    // próxima vez que se abra (comparten el mismo criterio de orden).
    const handleOrdenChange = (value) => {
        setOrden(value);
        if (!socio?.SocDocIde) return;
        if (activeTab === 'cuentaCorrienteFamiliar') {
            loadCuentaCorrienteFamiliar(socio.SocDocIde, value);
            setCcLoaded(false);
        } else {
            loadCuentaCorriente(socio.SocDocIde, startDate, endDate, value);
            setCcFamLoaded(false);
        }
    };

    const handleCargoCreado = () => {
        if (socio) loadCuentaCorriente(socio.SocDocIde);
    };

    // Un movimiento se puede descargar cuando tiene N.° de Recibo cargado.
    // Ojo: acá se usa el mismo criterio "truthy" que la celda para decidir
    // si muestra el número o un "-" (mov.NroRecibo || '-'), así que un
    // NroRecibo en 0 (o null/undefined/'') se considera "sin recibo todavía"
    // y no debe mostrar el botón de descarga.
    const tieneComprobante = (mov) => Boolean(mov?.NroRecibo);

    const esDebitoAutomatico = (mov) => Number(mov?.NroRecibo) === NRO_RECIBO_DEBITO_AUTOMATICO;

    // Descarga el comprobante de un movimiento de cuenta corriente (propia
    // o familiar). "movimientos" es la lista completa donde buscar otros
    // renglones con el mismo N.° de Recibo (un recibo puede cubrir varias
    // cuotas cobradas juntas). Para débitos automáticos (N.° Recibo 9999999)
    // no existe un recibo de cobro real, así que se arma un comprobante de
    // pago simple para ese único movimiento, usando el Nro de Emisión.
    const handleDescargarComprobante = async (mov, movimientos, nombreSocio, ci) => {
        try {
            if (esDebitoAutomatico(mov)) {
                await generarReciboPDF({
                    nroDoc: mov.Id,
                    titulo: 'Comprobante de Pago',
                    numeroLabel: 'Emisión N°',
                    nombreSocio,
                    ci,
                    items: [{
                        periodo: formatMonthYear(mov.Mes),
                        concepto: mov.RubDsc?.trim() || '-',
                        importe: parseFloat(mov.Importe) || 0,
                    }],
                    total: parseFloat(mov.Importe) || 0,
                    fecha: formatFecha(mov.FechaPago),
                    meta: 'Débito Automático',
                    filenamePrefix: 'comprobante',
                });
            } else {
                const mismoRecibo = movimientos.filter((m) => String(m.NroRecibo) === String(mov.NroRecibo));
                const total = mismoRecibo.reduce((acc, m) => acc + (parseFloat(m.Importe) || 0), 0);
                await generarReciboPDF({
                    nroDoc: mov.NroRecibo,
                    titulo: 'Recibo de Cobro',
                    nombreSocio,
                    ci,
                    items: mismoRecibo.map((m) => ({
                        periodo: formatMonthYear(m.Mes),
                        concepto: m.RubDsc?.trim() || '-',
                        importe: parseFloat(m.Importe) || 0,
                    })),
                    total,
                    fecha: formatFecha(mov.FechaPago),
                    filenamePrefix: 'recibo',
                });
            }
        } catch (err) {
            console.error('Error generando el comprobante:', err);
            showToast?.('No se pudo generar el comprobante', 'error');
        }
    };

    const handleClearDates = () => {
        const { start, end } = getDefaultDateRange();
        setStartDate(start);
        setEndDate(end);
        if (socio) loadCuentaCorriente(socio.SocDocIde, start, end);
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner}></div>
                    <p>Cargando datos del socio...</p>
                </div>
            </div>
        );
    }

    if (error || !socio) {
        return (
            <div className={styles.page}>
                <div className={styles.pageInner}>
                    <div className={styles.container}>
                        <div className={styles.errorState}>
                            <h2>Error</h2>
                            <p>{error || 'No se pudo encontrar el socio'}</p>
                            <Button variant="secondary" onClick={() => navigate('/socios')}>
                                Volver al listado
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // const hasResponsableData = RESPONSABLE_FIELDS.some((field) => {
    //     const value = socio[field];
    //     return value !== null && value !== undefined && value !== '';
    // });

    // Solo tiene sentido mostrar la pestaña "Datos del Responsable" si el
    // socio pertenece a un grupo familiar (GruFamNro distinto de 0) y ese
    // grupo no es el suyo propio (si GruFamNro === SocDocIde, el socio ES
    // el titular del grupo, o sea su propio responsable).
    // const perteneceAGrupoFamiliar = socio.GruFamNro !== null
    //     && socio.GruFamNro !== undefined
    //     && Number(socio.GruFamNro) !== 0;
    // const esTitularDeSuGrupo = perteneceAGrupoFamiliar
    //     && String(socio.GruFamNro) === String(socio.SocDocIde);
    // const mostrarTabResponsable = hasResponsableData && perteneceAGrupoFamiliar && !esTitularDeSuGrupo;

    const tabs = [
        { id: 'info', label: 'Información General' },
        // ...(mostrarTabResponsable ? [{ id: 'responsable', label: 'Datos del Responsable' }] : []),
        { id: 'padres', label: 'Datos de los Padres/Responsables' },
        { id: 'cuentaCorriente', label: 'Cuenta Corriente' },
        { id: 'cuentaCorrienteFamiliar', label: 'Cuenta Corriente Familiar' },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.pageInner}>
                <BackLink onClick={() => navigate(isHistorical ? '/socios-historicos' : '/socios')}>
                    Volver al listado
                </BackLink>

                <div className={styles.container}>
                    <div className={`${styles.header} ${isHistorical ? styles.headerInactive : ''}`}>
                        <div className={styles.headerInfo}>
                            <div className={styles.fotoContainer}>
                                {!fotoError ? (
                                    <img
                                        key={`${fotoKey}-${fotoExt}`}
                                        src={`${FOTOS_BASE_URL}/fotos/${socio.SocDocIde}.${fotoExt}?t=${fotoKey}`}
                                        alt={`Foto de ${socio.PrimerNombre}`}
                                        className={styles.fotoSocio}
                                        onError={() => {
                                            if (fotoExt === 'jpg') {
                                                setFotoExt('png');
                                            } else {
                                                setFotoError(true);
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className={styles.fotoPlaceholder}>
                                        {socio.PrimerNombre?.charAt(0)}{socio.PrimerApellido?.charAt(0)}
                                    </div>
                                )}
                                {!isHistorical && (
                                    <label className={styles.fotoUploadBtn} title="Cambiar foto">
                                        <input type="file" accept="image/jpeg,image/png" onChange={handleSubirFoto} hidden />
                                        📷
                                    </label>
                                )}
                            </div>
                            <div>
                                <h1 className={styles.title}>
                                    {socio.PrimerNombre} {socio.PrimerApellido}
                                </h1>
                                <p className={styles.subtitle}>Socio N.° {socio.SocNro}</p>
                            </div>
                        </div>
                        <div className={styles.headerActions}>
                            <Badge variant={isHistorical ? 'glass-danger' : 'glass-success'} className={styles.statusBadge}>
                                {isHistorical ? 'Inactivo' : 'Activo'}
                            </Badge>
                            {!isHistorical && (
                                <Button variant="glass" icon={EditIcon} onClick={() => navigate(`/socios/edit/${id}`)}>
                                    Editar Socio
                                </Button>
                            )}
                        </div>
                    </div>

                    <Tabs tabs={tabs} active={activeTab} onChange={handleTabChange} />

                    <div className={styles.content}>
                        {activeTab === 'info' && (
                            <>
                                <div className={styles.section}>
                                    <Title variant="section">Información personal</Title>
                                    <div className={styles.grid}>
                                        <div className={styles.field}>
                                            <span className={styles.label}>Primer Nombre</span>
                                            <span className={styles.value}>{socio.PrimerNombre || '-'}</span>
                                        </div>
                                        <div className={styles.field}>
                                            <span className={styles.label}>Segundo Nombre</span>
                                            <span className={styles.value}>{socio.SegundoNombre || '-'}</span>
                                        </div>
                                        <div className={styles.field}>
                                            <span className={styles.label}>Primer Apellido</span>
                                            <span className={styles.value}>{socio.PrimerApellido || '-'}</span>
                                        </div>
                                        <div className={styles.field}>
                                            <span className={styles.label}>Segundo Apellido</span>
                                            <span className={styles.value}>{socio.SegundoApellido || '-'}</span>
                                        </div>
                                        <div className={styles.field}>
                                            <span className={styles.label}>Cédula de Identidad</span>
                                            <span className={styles.value}>{socio.SocDocIde}</span>
                                        </div>
                                        <div className={styles.field}>
                                            <span className={styles.label}>Fecha de Nacimiento</span>
                                            <span className={styles.value}>
                                                {formatFecha(socio.SocFchNac)}
                                            </span>
                                        </div>
                                        <div className={styles.field}>
                                            <span className={styles.label}>Sexo</span>
                                            <span className={styles.value}>{socio.SocSex === 'M' ? 'Masculino' : 'Femenino'}</span>
                                        </div>
                                        <div className={styles.field}>
                                            <span className={styles.label}>Nacionalidad</span>
                                            <span className={styles.value}>{socio.NacDsc || socio.NacCod || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.section}>
                                    <Title variant="section">Información de contacto</Title>
                                    <div className={styles.grid}>
                                        <div className={styles.field}>
                                            <span className={styles.label}>Email</span>
                                            <span className={styles.value}>{socio.SocEMail || '-'}</span>
                                        </div>
                                        <div className={styles.field}>
                                            <span className={styles.label}>Teléfono Fijo</span>
                                            <span className={styles.value}>{socio.SocTel || '-'}</span>
                                        </div>
                                        <div className={styles.field}>
                                            <span className={styles.label}>Celular</span>
                                            <span className={styles.value}>{socio.SocTelCel || '-'}</span>
                                        </div>
                                        <div className={styles.field}>
                                            <span className={styles.label}>Domicilio</span>
                                            <span className={styles.value}>{socio.SocDom || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.section}>
                                    <Title variant="section">Membresía</Title>
                                    <div className={styles.grid}>
                                        <div className={styles.field}>
                                            <span className={styles.label}>Fecha de Ingreso</span>
                                            <span className={styles.value}>
                                                {formatFecha(socio.SocFchIng)}
                                            </span>
                                        </div>
                                        <div className={styles.field}>
                                            <span className={styles.label}>Categoría</span>
                                            <span className={styles.value}>{socio.CatNom || socio.CatCod || '-'}</span>
                                        </div>
                                        {/* Forma de Pago: deshabilitado a pedido -- "no va más por un tiempo". */}
                                        {/* <div className={styles.field}>
                                            <span className={styles.label}>Forma de Pago</span>
                                            <span className={styles.value}>{socio.ForPagNom || socio.ForPagCod || '-'}</span>
                                        </div> */}
                                        <div className={styles.field}>
                                            <span className={styles.label}>Radio</span>
                                            <span className={styles.value}>{socio.RADNOM || socio.RadCod || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                {socio.SocObserva && (
                                    <div className={styles.section}>
                                        <Title variant="section">Observaciones</Title>
                                        <p className={styles.observaciones}>{socio.SocObserva}</p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Pestaña "Datos del Responsable" deshabilitada por ahora (a pedido).
                    {activeTab === 'responsable' && mostrarTabResponsable && (
                        <div className={styles.section}>
                            <Title variant="section">Datos del responsable</Title>
                            <div className={styles.grid}>
                                <div className={styles.field}>
                                    <span className={styles.label}>Nombre</span>
                                    <span className={styles.value}>{socio.ResponsableNombre || '-'}</span>
                                </div>
                                <div className={styles.field}>
                                    <span className={styles.label}>Apellido</span>
                                    <span className={styles.value}>{socio.ResponsableApellido || '-'}</span>
                                </div>
                                <div className={styles.field}>
                                    <span className={styles.label}>Cédula de Identidad</span>
                                    <span className={styles.value}>{socio.ResponsableCI || '-'}</span>
                                </div>
                                <div className={styles.field}>
                                    <span className={styles.label}>Presentó DJ</span>
                                    <span className={styles.value}>{socio.ResponsablePresentoDJ ? 'Sí' : 'No'}</span>
                                </div>
                                <div className={styles.field}>
                                    <span className={styles.label}>Domicilio</span>
                                    <span className={styles.value}>{socio.ResponsableDomicilio || '-'}</span>
                                </div>
                                <div className={styles.field}>
                                    <span className={styles.label}>N.° Puerta</span>
                                    <span className={styles.value}>{socio.ResponsableDomicilioNroPuerta || '-'}</span>
                                </div>
                                <div className={styles.field}>
                                    <span className={styles.label}>Apto</span>
                                    <span className={styles.value}>{socio.ResponsableDomicilioApto || '-'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    */}

                        {activeTab === 'padres' && (
                            <>
                                <div className={styles.section}>
                                    <Title variant="section">Datos de los padres</Title>
                                    <div className={styles.grid}>
                                        <div className={styles.field}>
                                            <span className={styles.label}>Nombre del Padre</span>
                                            <span className={styles.value}>{trim(socio.SocNomPad) || '-'}</span>
                                        </div>
                                        <div className={styles.field}>
                                            <span className={styles.label}>Teléfono del Padre</span>
                                            <span className={styles.value}>{trim(socio.SocTelPad) || '-'}</span>
                                        </div>
                                        <div className={styles.field}>
                                            <span className={styles.label}>Nombre de la Madre</span>
                                            <span className={styles.value}>{trim(socio.SocNomMad) || '-'}</span>
                                        </div>
                                        <div className={styles.field}>
                                            <span className={styles.label}>Teléfono de la Madre</span>
                                            <span className={styles.value}>{trim(socio.SocTelMad) || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.section}>
                                    <Title variant="section">Personas autorizadas a retirar</Title>
                                    {(() => {
                                        const autorizados = AUTORIZADOS_KEYS.map((n) => ({
                                            n,
                                            ci: trim(socio[`SocAuto${n}CI`]),
                                            nombre: trim(socio[`SocAuto${n}`]),
                                            tel: trim(socio[`SocAuto${n}Tel`]),
                                        })).filter((a) => a.ci || a.nombre || a.tel);

                                        if (autorizados.length === 0) {
                                            return <p className={styles.noData}>No hay personas autorizadas registradas.</p>;
                                        }

                                        return autorizados.map((a) => (
                                            <div className={`${styles.grid} ${styles.autorizadoBlock}`} key={a.n}>
                                                <div className={styles.field}>
                                                    <span className={styles.label}>Autorizado {a.n} · Nombre</span>
                                                    <span className={styles.value}>{a.nombre || '-'}</span>
                                                </div>
                                                <div className={styles.field}>
                                                    <span className={styles.label}>Autorizado {a.n} · Cédula</span>
                                                    <span className={styles.value}>{a.ci || '-'}</span>
                                                </div>
                                                <div className={styles.field}>
                                                    <span className={styles.label}>Autorizado {a.n} · Teléfono</span>
                                                    <span className={styles.value}>{a.tel || '-'}</span>
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </>
                        )}

                        {activeTab === 'cuentaCorriente' && (
                            <div className={styles.section}>
                                <Title variant="section">Estado de cuenta</Title>

                                <div className={styles.filterBar}>
                                    <div className={styles.dateField}>
                                        <label>Fecha Desde</label>
                                        <input
                                            type="date"
                                            className={styles.dateInput}
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.dateField}>
                                        <label>Fecha Hasta</label>
                                        <input
                                            type="date"
                                            className={styles.dateInput}
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.dateField}>
                                        <label>Ordenar por</label>
                                        <select
                                            className={`${styles.dateInput} ${styles.orderSelect}`}
                                            value={orden}
                                            onChange={(e) => handleOrdenChange(e.target.value)}
                                        >
                                            <option value="vencimiento-desc">Vencimiento (más nuevo primero)</option>
                                            <option value="vencimiento-asc">Vencimiento (más antiguo primero)</option>
                                            <option value="emision-desc">N.° Emisión (mayor primero)</option>
                                            <option value="emision-asc">N.° Emisión (menor primero)</option>
                                        </select>
                                    </div>
                                    <Button
                                        variant="soft"
                                        size="sm"
                                        onClick={() => socio && loadCuentaCorriente(socio.SocDocIde)}
                                    >
                                        Filtrar
                                    </Button>
                                    {(startDate || endDate) && (
                                        <Button variant="ghost" size="sm" onClick={handleClearDates}>
                                            Limpiar
                                        </Button>
                                    )}
                                </div>

                                <div className={styles.ccHeaderRow}>
                                    {!loadingCC && cuentaCorriente.length > 0 && (
                                        <div className={styles.debtSummary}>
                                            <span className={styles.debtIconWrap}>{DebtIcon}</span>
                                            <div className={styles.debtText}>
                                                <span className={styles.debtLabel}>Total Adeudado</span>
                                                <span className={styles.debtValue}>
                                                    {formatCurrency(
                                                        cuentaCorriente
                                                            .filter(mov => !mov.FechaPago)
                                                            .reduce((acc, mov) => acc + (parseFloat(mov.Importe) || 0), 0)
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {!isHistorical && (
                                        <div className={styles.ccActions}>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                icon={PlusIcon}
                                                onClick={() => setIsCrearCargoOpen(true)}
                                            >
                                                Crear Cargo
                                            </Button>
                                            <Button
                                                variant="soft-danger"
                                                size="sm"
                                                icon={MinusIcon}
                                                onClick={() => setIsAnularCargoOpen(true)}
                                            >
                                                Anular Cargo
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {loadingCC ? (
                                    <p className={styles.loadingText}>Cargando movimientos...</p>
                                ) : cuentaCorriente.length > 0 ? (
                                    <div className={styles.tableContainer}>
                                        <table className={styles.ccTable}>
                                            <thead>
                                                <tr>
                                                    <th>Nro Emisión</th>
                                                    <th>N.° Recibo</th>
                                                    <th>Rubro</th>
                                                    <th>Mes</th>
                                                    {/* <th>Fecha Cargo</th> */}
                                                    <th>Fecha Vencimiento</th>
                                                    <th>Importe</th>
                                                    <th>Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cuentaCorriente.map((mov, index) => (
                                                    <tr key={index}>
                                                        <td className={styles.muted}>{mov.Id || '-'}</td>
                                                        <td>
                                                            <span className={styles.reciboCell}>
                                                                {mov.NroRecibo || '-'}
                                                                {tieneComprobante(mov) && (
                                                                    <button
                                                                        type="button"
                                                                        className={styles.downloadBtn}
                                                                        onClick={() => handleDescargarComprobante(
                                                                            mov,
                                                                            cuentaCorriente,
                                                                            [socio.PrimerNombre, socio.SegundoNombre, socio.PrimerApellido, socio.SegundoApellido].map(trim).filter(Boolean).join(' '),
                                                                            socio.SocDocIde
                                                                        )}
                                                                        title={esDebitoAutomatico(mov) ? 'Descargar comprobante de pago' : 'Descargar recibo'}
                                                                        aria-label={esDebitoAutomatico(mov) ? 'Descargar comprobante de pago' : 'Descargar recibo'}
                                                                    >
                                                                        {DownloadIcon}
                                                                    </button>
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td>{mov.RubDsc?.trim() || '-'}</td>
                                                        <td>{formatMonthYear(mov.Mes)}</td>
                                                        {/* <td>{mov.FechaCargo ? new Date(mov.FechaCargo).toLocaleDateString() : '-'}</td> */}
                                                        <td>{formatFecha(mov.FechaVto)}</td>
                                                        <td className={styles.amount}>{formatCurrency(parseFloat(mov.Importe) || 0)}</td>
                                                        <td>
                                                            {mov.FechaPago ? (
                                                                <Badge variant="success">{formatFecha(mov.FechaPago)}</Badge>
                                                            ) : (
                                                                <Badge variant="danger">Pendiente</Badge>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className={styles.noData}>No hay movimientos registrados.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'cuentaCorrienteFamiliar' && (
                            <div className={styles.section}>
                                <Title variant="section">Estado de cuenta familiar</Title>

                                <p className={styles.dateNote}>
                                    {InfoIcon}
                                    <span>
                                        Mostrando movimientos del <strong>{formatDateStr(startDate)}</strong> al{' '}
                                        <strong>{formatDateStr(endDate)}</strong>. Para cambiar el rango de fechas, modificar en la misma
                                        pestaña{' '}
                                        <button
                                            type="button"
                                            className={styles.dateNoteLink}
                                            onClick={() => handleTabChange('cuentaCorriente')}
                                        >
                                            Cuenta Corriente
                                        </button>
                                        .
                                    </span>
                                </p>

                                <div className={styles.filterBar}>
                                    <div className={styles.dateField}>
                                        <label>Ordenar por</label>
                                        <select
                                            className={`${styles.dateInput} ${styles.orderSelect}`}
                                            value={orden}
                                            onChange={(e) => handleOrdenChange(e.target.value)}
                                        >
                                            <option value="vencimiento-desc">Vencimiento (más nuevo primero)</option>
                                            <option value="vencimiento-asc">Vencimiento (más antiguo primero)</option>
                                            <option value="emision-desc">N.° Emisión (mayor primero)</option>
                                            <option value="emision-asc">N.° Emisión (menor primero)</option>
                                        </select>
                                    </div>
                                </div>

                                {!loadingCCFam && cuentaCorrienteFamiliar.length > 0 && (
                                    <div className={styles.debtSummary}>
                                        <span className={styles.debtIconWrap}>{DebtIcon}</span>
                                        <div className={styles.debtText}>
                                            <span className={styles.debtLabel}>Total Adeudado del Grupo</span>
                                            <span className={styles.debtValue}>
                                                {formatCurrency(
                                                    cuentaCorrienteFamiliar
                                                        .filter(mov => !mov.FechaPago)
                                                        .reduce((acc, mov) => acc + (parseFloat(mov.Importe) || 0), 0)
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {loadingCCFam ? (
                                    <p className={styles.loadingText}>Cargando movimientos del grupo familiar...</p>
                                ) : cuentaCorrienteFamiliar.length > 0 ? (
                                    <div className={styles.tableContainer}>
                                        <table className={styles.ccTable}>
                                            <thead>
                                                <tr>
                                                    <th>Integrante</th>
                                                    <th>Nro Emisión</th>
                                                    <th>N.° Recibo</th>
                                                    <th>Rubro</th>
                                                    <th>Mes</th>
                                                    <th>Fecha Vencimiento</th>
                                                    <th>Importe</th>
                                                    <th>Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cuentaCorrienteFamiliar.map((mov, index) => (
                                                    <tr key={index}>
                                                        <td className={styles.nameCell}>{mov.IntegranteNombre?.trim() || mov.IntegranteCi || '-'}</td>
                                                        <td className={styles.muted}>{mov.Id || '-'}</td>
                                                        <td>
                                                            <span className={styles.reciboCell}>
                                                                {mov.NroRecibo || '-'}
                                                                {tieneComprobante(mov) && (
                                                                    <button
                                                                        type="button"
                                                                        className={styles.downloadBtn}
                                                                        onClick={() => handleDescargarComprobante(
                                                                            mov,
                                                                            cuentaCorrienteFamiliar.filter((m) => String(m.IntegranteCi) === String(mov.IntegranteCi)),
                                                                            mov.IntegranteNombre?.trim() || '-',
                                                                            mov.IntegranteCi
                                                                        )}
                                                                        title={esDebitoAutomatico(mov) ? 'Descargar comprobante de pago' : 'Descargar recibo'}
                                                                        aria-label={esDebitoAutomatico(mov) ? 'Descargar comprobante de pago' : 'Descargar recibo'}
                                                                    >
                                                                        {DownloadIcon}
                                                                    </button>
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td>{mov.RubDsc?.trim() || '-'}</td>
                                                        <td>{formatMonthYear(mov.Mes)}</td>
                                                        <td>{formatFecha(mov.FechaVto)}</td>
                                                        <td className={styles.amount}>{formatCurrency(parseFloat(mov.Importe) || 0)}</td>
                                                        <td>
                                                            {mov.FechaPago ? (
                                                                <Badge variant="success">{formatFecha(mov.FechaPago)}</Badge>
                                                            ) : (
                                                                <Badge variant="danger">Pendiente</Badge>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className={styles.noData}>Este socio no tiene cuenta corriente familiar.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CrearCargoModal
                isOpen={isCrearCargoOpen}
                onClose={() => setIsCrearCargoOpen(false)}
                onSuccess={handleCargoCreado}
                socio={socio}
                usuario={usuario?.nombre}
                showToast={showToast}
            />

            <AnularCargoModal
                isOpen={isAnularCargoOpen}
                onClose={() => setIsAnularCargoOpen(false)}
                onSuccess={handleCargoCreado}
                socio={socio}
                showToast={showToast}
            />
        </div>
    );
};

export default SocioDetailsPage;
