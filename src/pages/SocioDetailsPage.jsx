import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSocioById, getSocioHistoricoById } from '../services/api';
import { Button, Badge, Tabs, Title } from '../components/ui';
import styles from './SocioDetailsPage.module.css';

const RESPONSABLE_FIELDS = [
    'ResponsableCI',
    'ResponsableApellido',
    'ResponsableNombre',
    'ResponsableDomicilio',
    'ResponsableDomicilioNroPuerta',
    'ResponsableDomicilioApto',
    'ResponsablePresentoDJ',
];

const BackIcon = (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const EditIcon = (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const SocioDetailsPage = ({ isHistorical = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [socio, setSocio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [cuentaCorriente, setCuentaCorriente] = useState([]);
    const [loadingCC, setLoadingCC] = useState(false);
    const [ccLoaded, setCcLoaded] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activeTab, setActiveTab] = useState('info');

    const [cuentaCorrienteFamiliar, setCuentaCorrienteFamiliar] = useState([]);
    const [loadingCCFam, setLoadingCCFam] = useState(false);
    const [ccFamLoaded, setCcFamLoaded] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(amount);
    };

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

    const loadCuentaCorriente = async (ci, from = startDate, to = endDate) => {
        setLoadingCC(true);
        try {
            const { getCuentaCorriente } = await import('../services/api');
            const data = await getCuentaCorriente(ci, from, to);
            setCuentaCorriente(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading cuenta corriente:', err);
        } finally {
            setLoadingCC(false);
            setCcLoaded(true);
        }
    };

    const loadCuentaCorrienteFamiliar = async (ci) => {
        setLoadingCCFam(true);
        try {
            const { getCuentaCorrienteFamiliar } = await import('../services/api');
            const data = await getCuentaCorrienteFamiliar(ci, startDate, endDate);
            setCuentaCorrienteFamiliar(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading cuenta corriente familiar:', err);
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

    const handleClearDates = () => {
        setStartDate('');
        setEndDate('');
        if (socio) loadCuentaCorriente(socio.SocDocIde, '', '');
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

    const hasResponsableData = RESPONSABLE_FIELDS.some((field) => {
        const value = socio[field];
        return value !== null && value !== undefined && value !== '';
    });

    // Solo tiene sentido mostrar la pestaña "Datos del Responsable" si el
    // socio pertenece a un grupo familiar (GruFamNro distinto de 0) y ese
    // grupo no es el suyo propio (si GruFamNro === SocDocIde, el socio ES
    // el titular del grupo, o sea su propio responsable).
    const perteneceAGrupoFamiliar = socio.GruFamNro !== null
        && socio.GruFamNro !== undefined
        && Number(socio.GruFamNro) !== 0;
    const esTitularDeSuGrupo = perteneceAGrupoFamiliar
        && String(socio.GruFamNro) === String(socio.SocDocIde);
    const mostrarTabResponsable = hasResponsableData && perteneceAGrupoFamiliar && !esTitularDeSuGrupo;

    const tabs = [
        { id: 'info', label: 'Información General' },
        ...(mostrarTabResponsable ? [{ id: 'responsable', label: 'Datos del Responsable' }] : []),
        { id: 'cuentaCorriente', label: 'Cuenta Corriente' },
        { id: 'cuentaCorrienteFamiliar', label: 'Cuenta Corriente Familiar' },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.pageInner}>
                <button
                    type="button"
                    className={styles.backLink}
                    onClick={() => navigate(isHistorical ? '/socios-historicos' : '/socios')}
                >
                    {BackIcon}
                    Volver al listado
                </button>

                <div className={styles.container}>
                    <div className={`${styles.header} ${isHistorical ? styles.headerInactive : ''}`}>
                        <div>
                            <h1 className={styles.title}>
                                {socio.PrimerNombre} {socio.PrimerApellido}
                            </h1>
                            <p className={styles.subtitle}>Socio N.° {socio.SocNro}</p>
                        </div>
                        <div className={styles.headerActions}>
                            <Badge variant={isHistorical ? 'glass-danger' : 'glass-success'} className={styles.statusBadge}>
                                {isHistorical ? 'Inactivo' : 'Activo'}
                            </Badge>
                            {!isHistorical && (
                                <Button
                                    variant="glass"
                                    icon={EditIcon}
                                    onClick={() => navigate(`/socios/edit/${id}`)}
                                >
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
                                            {socio.SocFchNac ? new Date(socio.SocFchNac).toLocaleDateString() : '-'}
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
                                            {socio.SocFchIng ? new Date(socio.SocFchIng).toLocaleDateString() : '-'}
                                        </span>
                                    </div>
                                    <div className={styles.field}>
                                        <span className={styles.label}>Categoría</span>
                                        <span className={styles.value}>{socio.CatNom || socio.CatCod || '-'}</span>
                                    </div>
                                    <div className={styles.field}>
                                        <span className={styles.label}>Forma de Pago</span>
                                        <span className={styles.value}>{socio.ForPagCod || '-'}</span>
                                    </div>
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

                            {!loadingCC && cuentaCorriente.length > 0 && (
                                <div className={styles.debtSummary}>
                                    <span className={styles.debtLabel}>Total Adeudado:</span>
                                    <span className={styles.debtValue}>
                                        {formatCurrency(
                                            cuentaCorriente
                                                .filter(mov => !mov.FechaPago)
                                                .reduce((acc, mov) => acc + (parseFloat(mov.Importe) || 0), 0)
                                        )}
                                    </span>
                                </div>
                            )}

                            {loadingCC ? (
                                <p className={styles.loadingText}>Cargando movimientos...</p>
                            ) : cuentaCorriente.length > 0 ? (
                                <div className={styles.tableContainer}>
                                    <table className={styles.ccTable}>
                                        <thead>
                                            <tr>
                                                <th>Id</th>
                                                <th>N.° Recibo</th>
                                                <th>Importe</th>
                                                <th>Fecha</th>
                                                <th>Fecha Pago</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cuentaCorriente.map((mov, index) => (
                                                <tr key={index}>
                                                    <td className={styles.muted}>{mov.Id || '-'}</td>
                                                    <td>{mov.NroRecibo || '-'}</td>
                                                    <td className={styles.amount}>{formatCurrency(parseFloat(mov.Importe) || 0)}</td>
                                                    <td>{mov.Mes ? new Date(mov.Mes).toLocaleDateString() : '-'}</td>
                                                    <td>{mov.FechaPago ? new Date(mov.FechaPago).toLocaleDateString() : '-'}</td>
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

                            {!loadingCCFam && cuentaCorrienteFamiliar.length > 0 && (
                                <div className={styles.debtSummary}>
                                    <span className={styles.debtLabel}>Total Adeudado del Grupo:</span>
                                    <span className={styles.debtValue}>
                                        {formatCurrency(
                                            cuentaCorrienteFamiliar
                                                .filter(mov => !mov.FechaPago)
                                                .reduce((acc, mov) => acc + (parseFloat(mov.Importe) || 0), 0)
                                        )}
                                    </span>
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
                                                <th>Id</th>
                                                <th>N.° Recibo</th>
                                                <th>Importe</th>
                                                <th>Fecha</th>
                                                <th>Fecha Pago</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cuentaCorrienteFamiliar.map((mov, index) => (
                                                <tr key={index}>
                                                    <td className={styles.nameCell}>{mov.IntegranteNombre?.trim() || mov.IntegranteCi || '-'}</td>
                                                    <td className={styles.muted}>{mov.Id || '-'}</td>
                                                    <td>{mov.NroRecibo || '-'}</td>
                                                    <td className={styles.amount}>{formatCurrency(parseFloat(mov.Importe) || 0)}</td>
                                                    <td>{mov.Mes ? new Date(mov.Mes).toLocaleDateString() : '-'}</td>
                                                    <td>{mov.FechaPago ? new Date(mov.FechaPago).toLocaleDateString() : '-'}</td>
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
        </div>
    );
};

export default SocioDetailsPage;
