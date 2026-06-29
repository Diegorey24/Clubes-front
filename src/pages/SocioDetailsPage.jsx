import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSocioById, getSocioHistoricoById } from '../services/api';
import ResponsableModal from '../components/ResponsableModal/ResponsableModal';
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

const SocioDetailsPage = ({ isHistorical = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [socio, setSocio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [cuentaCorriente, setCuentaCorriente] = useState([]);
    const [loadingCC, setLoadingCC] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activeTab, setActiveTab] = useState('info');

    const [cuentaCorrienteFamiliar, setCuentaCorrienteFamiliar] = useState([]);
    const [loadingCCFam, setLoadingCCFam] = useState(false);
    const [ccFamLoaded, setCcFamLoaded] = useState(false);

    const [showResponsableModal, setShowResponsableModal] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(amount);
    };

    useEffect(() => {
        loadSocio();
    }, [id]);

    const loadSocio = async () => {
        setLoading(true);
        try {
            const fetchFn = isHistorical ? getSocioHistoricoById : getSocioById;
            const data = await fetchFn(id);
            if (data) {
                setSocio(data);
                if (data.SocDocIde) {
                    loadCuentaCorriente(data.SocDocIde);
                }
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

    const loadCuentaCorriente = async (ci) => {
        setLoadingCC(true);
        try {
            const { getCuentaCorriente } = await import('../services/api');
            const data = await getCuentaCorriente(ci, startDate, endDate);
            setCuentaCorriente(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading cuenta corriente:', err);
        } finally {
            setLoadingCC(false);
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

    const handleFamiliarTabClick = () => {
        setActiveTab('cuentaCorrienteFamiliar');
        if (!ccFamLoaded && socio?.SocDocIde) {
            loadCuentaCorrienteFamiliar(socio.SocDocIde);
        }
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
                <div className={styles.container} style={{ padding: '2rem', textAlign: 'center' }}>
                    <h2>Error</h2>
                    <p>{error || 'No se pudo encontrar el socio'}</p>
                    <button className={styles.backButton} onClick={() => navigate('/socios')}>
                        Volver al listado
                    </button>
                </div>
            </div>
        );
    }

    const hasResponsableData = RESPONSABLE_FIELDS.some((field) => {
        const value = socio[field];
        return value !== null && value !== undefined && value !== '';
    });

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={`${styles.header} ${isHistorical ? styles.headerInactive : ''}`}>
                    <div>
                        <h1 className={styles.title}>
                            {socio.PrimerNombre} {socio.PrimerApellido}
                        </h1>
                        <p className={styles.subtitle}>Socio N° {socio.SocNro}</p>
                    </div>
                    <div className={`${styles.status} ${isHistorical ? styles.inactive : ''}`}>
                        {isHistorical ? 'INACTIVO' : 'ACTIVO'}
                    </div>
                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'info' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('info')}
                    >
                        Información General
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'cuentaCorriente' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('cuentaCorriente')}
                    >
                        Cuenta Corriente
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'cuentaCorrienteFamiliar' ? styles.activeTab : ''}`}
                        onClick={handleFamiliarTabClick}
                    >
                        Cuenta Corriente Familiar
                    </button>
                </div>

                <div className={styles.content}>
                    {activeTab === 'info' && (
                        <>
                            <div className={styles.section}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 className={styles.sectionTitle} style={{ flex: 1 }}>Información Personal</h3>
                                    {hasResponsableData && (
                                        <button
                                            className={styles.editButton}
                                            onClick={() => setShowResponsableModal(true)}
                                            style={{ marginBottom: '1.5rem' }}
                                        >
                                            Ver Datos del Responsable
                                        </button>
                                    )}
                                </div>
                                <div className={styles.grid}>
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
                                        <span className={styles.value}>{socio.NacCod || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>Información de Contacto</h3>
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
                                <h3 className={styles.sectionTitle}>Membresía</h3>
                                <div className={styles.grid}>
                                    <div className={styles.field}>
                                        <span className={styles.label}>Fecha de Ingreso</span>
                                        <span className={styles.value}>
                                            {socio.SocFchIng ? new Date(socio.SocFchIng).toLocaleDateString() : '-'}
                                        </span>
                                    </div>
                                    <div className={styles.field}>
                                        <span className={styles.label}>Categoría</span>
                                        <span className={styles.value}>{socio.CatCod || '-'}</span>
                                    </div>
                                    <div className={styles.field}>
                                        <span className={styles.label}>Forma de Pago</span>
                                        <span className={styles.value}>{socio.ForPagCod || '-'}</span>
                                    </div>
                                    <div className={styles.field}>
                                        <span className={styles.label}>Radio</span>
                                        <span className={styles.value}>{socio.RadCod || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {socio.SocObserva && (
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Observaciones</h3>
                                    <p>{socio.SocObserva}</p>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'cuentaCorriente' && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Estado de Cuenta</h3>

                            <div className={styles.filterContainer} style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'end' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Fecha Desde</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Fecha Hasta</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                    />
                                </div>
                                <button
                                    onClick={() => socio && loadCuentaCorriente(socio.SocDocIde)}
                                    className={styles.editButton}
                                    style={{ height: '38px' }}
                                >
                                    Filtrar
                                </button>
                                {(startDate || endDate) && (
                                    <button
                                        onClick={() => {
                                            setStartDate('');
                                            setEndDate('');
                                            // Need to clear state first, then reload, but react state is async.
                                            // So we pass empty strings directly to load function if we wanted to be pure,
                                            // but loadCuentaCorriente uses state. 
                                            // Workaround: set state then call a specific clear handler or just let user click filter again?
                                            // Better UX: Trigger reload with params.
                                            // For simplicity, I'll just reset and let user click filter, OR modify load func to accept params.
                                            // Let's modify loadCuentaCorriente slightly or just reload with empty args if I refactor.
                                            // Actually best is to just clear inputs and let user trigger, or handle effect.
                                            // Let's just clear for now.
                                        }}
                                        className={styles.backButton}
                                        style={{ height: '38px' }}
                                        onClick={async () => {
                                            setStartDate('');
                                            setEndDate('');
                                            // We need to wait for state update or pass explicit nulls. 
                                            // Let's refactor loadCuentaCorriente to take optional overrides or just use current state.
                                            // Since I can't easily change the signature without affecting the initial load call in useEffect (which is fine actually),
                                            // I will use a helper or just inline the fetch here for clear.
                                            // Simpler: Just clear state. User clicks filter. Or better:
                                            const { getCuentaCorriente } = await import('../services/api');
                                            if (socio) {
                                                setLoadingCC(true);
                                                try {
                                                    const data = await getCuentaCorriente(socio.SocDocIde, '', '');
                                                    setCuentaCorriente(Array.isArray(data) ? data : []);
                                                } finally {
                                                    setLoadingCC(false);
                                                }
                                            }
                                        }}
                                    >
                                        Limpiar
                                    </button>
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
                                <p>Cargando movimientos...</p>
                            ) : cuentaCorriente.length > 0 ? (
                                <div className={styles.tableContainer}>
                                    <table className={styles.ccTable}>
                                        <thead>
                                            <tr>
                                                <th>Id</th>
                                                <th>NroRecibo</th>
                                                <th>Importe</th>
                                                <th>Fecha</th>
                                                <th>FechaPago</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cuentaCorriente.map((mov, index) => (
                                                <tr key={index}>
                                                    <td>{mov.Id || '-'}</td>
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
                            <h3 className={styles.sectionTitle}>Estado de Cuenta Familiar</h3>

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
                                <p>Cargando movimientos del grupo familiar...</p>
                            ) : cuentaCorrienteFamiliar.length > 0 ? (
                                <div className={styles.tableContainer}>
                                    <table className={styles.ccTable}>
                                        <thead>
                                            <tr>
                                                <th>Integrante</th>
                                                <th>Id</th>
                                                <th>NroRecibo</th>
                                                <th>Importe</th>
                                                <th>Fecha</th>
                                                <th>FechaPago</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cuentaCorrienteFamiliar.map((mov, index) => (
                                                <tr key={index}>
                                                    <td>{mov.IntegranteNombre?.trim() || mov.IntegranteCi || '-'}</td>
                                                    <td>{mov.Id || '-'}</td>
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

                <div className={styles.actions}>
                    <button className={styles.backButton} onClick={() => navigate(isHistorical ? '/socios-historicos' : '/socios')}>
                        Volver al Listado
                    </button>
                    {!isHistorical && (
                        <button className={styles.editButton} onClick={() => navigate(`/socios/edit/${id}`)}>
                            Editar Socio
                        </button>
                    )}
                </div>
            </div>

            <ResponsableModal
                isOpen={showResponsableModal}
                onClose={() => setShowResponsableModal(false)}
                socio={socio}
            />
        </div>
    );
};

export default SocioDetailsPage;
