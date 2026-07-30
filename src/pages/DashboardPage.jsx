import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../services/api';
import { Button, PageHeader } from '../components/ui';
import styles from './DashboardPage.module.css';

const PlusIcon = (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const SociosIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
);

const DeudasIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
);

const PlanillaIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v2h2V5H5zm4 0v2h2V5H9zm4 0v2h2V5h-2zM5 9v2h2V9H5zm4 0v2h2V9H9zm4 0v2h2V9h-2zM5 13v2h2v-2H5zm4 0v2h2v-2H9zm4 0v2h2v-2h-2z" clipRule="evenodd" />
    </svg>
);

const CobranzaIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1v-6zM8 7a1 1 0 011-1h2a1 1 0 011 1v10a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 3a1 1 0 011-1h2a1 1 0 011 1v14a1 1 0 01-1 1h-2a1 1 0 01-1-1V3z" />
    </svg>
);

const CajaIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
    </svg>
);

const UtilidadesIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);

const ArchiveIcon = (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const TagIcon = (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5.586a1 1 0 01.707.293l7.414 7.414a1 1 0 010 1.414l-7.586 7.586a1 1 0 01-1.414 0L3.707 12.293A1 1 0 013 11.586V7a4 4 0 014-4z" />
    </svg>
);

const MapPinIcon = (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

// Accesos rápidos a las tareas más frecuentes. Reutiliza la misma paleta de
// colores por "familia" que ya se usa en Utilidades (violeta=procesos,
// azul=socios, verde=cobranza, teal=informes, ámbar=caja) para que el
// lenguaje visual sea consistente en toda la app.
const QUICK_ACTIONS = [
    { to: '/socios', label: 'Ver Socios', icon: SociosIcon, tone: 'blue' },
    { to: '/informe-socios-deudas', label: 'Ver Deudas', icon: DeudasIcon, tone: 'rose' },
    { to: '/informe-planilla-socios', label: 'Planilla', icon: PlanillaIcon, tone: 'teal' },
    { to: '/informe-cobranza-periodo', label: 'Cobranza', icon: CobranzaIcon, tone: 'green' },
    { to: '/caja', label: 'Caja', icon: CajaIcon, tone: 'violet' },
    { to: '/utilidades', label: 'Utilidades', icon: UtilidadesIcon, tone: 'amber' },
];

// Paleta cíclica para las porciones del donut de Género: pasteles distintos
// pero sobrios, en línea con el resto de la paleta de la app.
const DONUT_PALETTE = [
    'hsl(210, 76%, 55%)',
    'hsl(330, 65%, 60%)',
    'hsl(174, 55%, 42%)',
    'hsl(38, 90%, 55%)',
    'hsl(258, 60%, 62%)',
];

const getSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 20) return 'Buenas tardes';
    return 'Buenas noches';
};

const getFechaHoy = () => {
    const texto = new Intl.DateTimeFormat('es-UY', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(new Date());
    return texto.charAt(0).toUpperCase() + texto.slice(1);
};

// Donut chart genérico en SVG puro (sin librerías): recibe slices ya
// resueltos [{ label, value, color }] y arma los arcos con
// stroke-dasharray/-offset acumulado. Pensado para pocas categorías (2-6),
// como Género o Activos/Históricos.
const DonutChart = ({ data, size = 140, strokeWidth = 20, centerValue, centerLabel }) => {
    const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Arma cada segmento con su offset acumulado sin mutar variables durante
    // el render: reduce devuelve un array nuevo, arrastrando el acumulado
    // dentro del propio acumulador en vez de una variable externa.
    const segmentos = data.reduce((acc, d) => {
        const prev = acc.length ? acc[acc.length - 1] : null;
        const acumuladoPrevio = prev ? prev.acumulado : 0;
        const dash = (d.value / total) * circumference;
        acc.push({ ...d, dash, offset: -acumuladoPrevio, acumulado: acumuladoPrevio + dash });
        return acc;
    }, []);

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={styles.donutSvg}>
            <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--gray-100)"
                    strokeWidth={strokeWidth}
                />
                {segmentos.filter(seg => seg.value > 0).map((seg, idx) => (
                    <circle
                        key={idx}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
                        strokeDashoffset={seg.offset}
                    />
                ))}
            </g>
            <text x="50%" y="47%" textAnchor="middle" className={styles.donutCenterValue}>
                {centerValue}
            </text>
            <text x="50%" y="64%" textAnchor="middle" className={styles.donutCenterLabel}>
                {centerLabel}
            </text>
        </svg>
    );
};

const DashboardPage = ({ usuario }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const loadStats = async () => {
            setLoading(true);
            setError(false);
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (err) {
                console.error('Error loading dashboard stats:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    // Derivados: se recalculan solo cuando cambian los stats, no en cada
    // render. Todo sale de los mismos campos que ya devuelve /dashboard/stats
    // (totalActive, totalHistorical, byCategory, byRadio, byGender); no se
    // inventa ningún dato nuevo del backend.
    const derived = useMemo(() => {
        if (!stats) return null;

        const byCategory = [...(stats.byCategory || [])].sort((a, b) => b.count - a.count);
        const byRadio = [...(stats.byRadio || [])].sort((a, b) => b.count - a.count);
        const byGender = stats.byGender || [];

        const totalActive = stats.totalActive || 0;
        const totalHistorical = stats.totalHistorical || 0;
        const totalSocios = totalActive + totalHistorical;
        const pctActivos = totalSocios ? Math.round((totalActive / totalSocios) * 100) : 0;

        const maxCategory = Math.max(...byCategory.map(c => c.count), 1);
        const maxRadio = Math.max(...byRadio.map(r => r.count), 1);
        const totalCategoriaCount = byCategory.reduce((sum, c) => sum + c.count, 0) || 1;
        const totalRadioCount = byRadio.reduce((sum, r) => sum + r.count, 0) || 1;

        const generoData = byGender.map((g, idx) => ({
            label: g.name || 'Sin dato',
            value: g.count || 0,
            color: DONUT_PALETTE[idx % DONUT_PALETTE.length],
        }));
        const totalGenero = generoData.reduce((sum, g) => sum + g.value, 0);

        return {
            byCategory,
            byRadio,
            totalActive,
            totalHistorical,
            pctActivos,
            maxCategory,
            maxRadio,
            totalCategoriaCount,
            totalRadioCount,
            topCategoria: byCategory[0],
            topRadio: byRadio[0],
            generoData,
            totalGenero,
        };
    }, [stats]);

    if (loading) {
        return (
            <div className={styles.page}>
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando panel de control...</p>
                </div>
            </div>
        );
    }

    if (error || !stats || !derived) {
        return (
            <div className={styles.page}>
                <p className={styles.errorBox}>No se pudieron cargar las estadísticas del panel. Probá recargar la página.</p>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <PageHeader
                title={`${getSaludo()}${usuario?.nombre ? `, ${usuario.nombre}` : ''}`}
                subtitle={`${getFechaHoy()} · Resumen general `}
                // actions={
                //     <Button to="/agregar-socio" variant="primary" icon={PlusIcon}>
                //         Nuevo Socio
                //     </Button>
                // }
            />

            {/* Accesos rápidos */}
            <div className={styles.quickActions}>
                {QUICK_ACTIONS.map((action, idx) => (
                    <Link
                        key={action.to}
                        to={action.to}
                        className={`${styles.quickTile} ${styles[action.tone]}`}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                        <span className={styles.quickIcon}>{action.icon}</span>
                        <span className={styles.quickLabel}>{action.label}</span>
                    </Link>
                ))}
            </div>

            {/* KPIs */}
            <div className={styles.summaryGrid}>
                <div className={styles.summaryCard} style={{ animationDelay: '0s' }}>
                    <div
                        className={styles.ring}
                        style={{ background: `conic-gradient(var(--primary-500) ${derived.pctActivos}%, var(--gray-100) 0)` }}
                    >
                        <div className={styles.ringHole}>{derived.pctActivos}%</div>
                    </div>
                    <div className={styles.summaryContent}>
                        <div className={styles.cardTitle}>Socios Activos</div>
                        <div className={styles.cardValue}>{derived.totalActive}</div>
                        <div className={styles.cardSubtext}>{derived.pctActivos}% del total de socios</div>
                    </div>
                </div>

                <div className={styles.summaryCard} style={{ animationDelay: '0.05s' }}>
                    <div className={`${styles.cardIcon} ${styles.slate}`}>{ArchiveIcon}</div>
                    <div className={styles.summaryContent}>
                        <div className={styles.cardTitle}>Socios Históricos</div>
                        <div className={styles.cardValue}>{derived.totalHistorical}</div>
                        <div className={styles.cardSubtext}>{100 - derived.pctActivos}% del total de socios</div>
                    </div>
                </div>

                <div className={styles.summaryCard} style={{ animationDelay: '0.1s' }}>
                    <div className={`${styles.cardIcon} ${styles.violet}`}>{TagIcon}</div>
                    <div className={styles.summaryContent}>
                        <div className={styles.cardTitle}>Categorías</div>
                        <div className={styles.cardValue}>{derived.byCategory.length}</div>
                        <div className={styles.cardSubtext}>
                            {derived.topCategoria ? `Top: ${derived.topCategoria.name || 'Sin categoría'} (${derived.topCategoria.count})` : 'Sin datos'}
                        </div>
                    </div>
                </div>

                <div className={styles.summaryCard} style={{ animationDelay: '0.15s' }}>
                    <div className={`${styles.cardIcon} ${styles.teal}`}>{MapPinIcon}</div>
                    <div className={styles.summaryContent}>
                        <div className={styles.cardTitle}>Radios</div>
                        <div className={styles.cardValue}>{derived.byRadio.length}</div>
                        <div className={styles.cardSubtext}>
                            {derived.topRadio ? `Top: ${derived.topRadio.name || 'Sin radio'} (${derived.topRadio.count})` : 'Sin datos'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráficas */}
            <div className={styles.chartsGrid}>
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Distribución por Categoría</h3>
                    <div className={styles.barList}>
                        {derived.byCategory.slice(0, 8).map((cat, idx) => {
                            const pct = Math.round((cat.count / derived.totalCategoriaCount) * 100);
                            return (
                                <div key={idx} className={styles.barItem}>
                                    <span className={`${styles.rankBadge} ${idx < 3 ? styles[`rank${idx + 1}`] : ''}`}>{idx + 1}</span>
                                    <div className={styles.barBody}>
                                        <div className={styles.barHeader}>
                                            <span>{cat.name || 'Sin Categoría'}</span>
                                            <span className={styles.barCount}>{cat.count} <span className={styles.barPct}>({pct}%)</span></span>
                                        </div>
                                        <div className={styles.barContainer}>
                                            <div
                                                className={`${styles.barFill} ${styles.blueFill}`}
                                                style={{ width: `${(cat.count / derived.maxCategory) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {derived.byCategory.length === 0 && <p className={styles.noData}>Sin datos de categorías.</p>}
                    </div>
                </div>

                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Distribución por Radio</h3>
                    <div className={styles.barList}>
                        {derived.byRadio.slice(0, 8).map((rad, idx) => {
                            const pct = Math.round((rad.count / derived.totalRadioCount) * 100);
                            return (
                                <div key={idx} className={styles.barItem}>
                                    <span className={`${styles.rankBadge} ${idx < 3 ? styles[`rank${idx + 1}`] : ''}`}>{idx + 1}</span>
                                    <div className={styles.barBody}>
                                        <div className={styles.barHeader}>
                                            <span>{rad.name || 'Sin Radio'}</span>
                                            <span className={styles.barCount}>{rad.count} <span className={styles.barPct}>({pct}%)</span></span>
                                        </div>
                                        <div className={styles.barContainer}>
                                            <div
                                                className={`${styles.barFill} ${styles.tealFill}`}
                                                style={{ width: `${(rad.count / derived.maxRadio) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {derived.byRadio.length === 0 && <p className={styles.noData}>Sin datos de radios.</p>}
                    </div>
                </div>

                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Género</h3>
                    {derived.generoData.length === 0 ? (
                        <p className={styles.noData}>Sin datos de género.</p>
                    ) : (
                        <div className={styles.donutWrap}>
                            <DonutChart
                                data={derived.generoData}
                                centerValue={derived.totalGenero}
                                centerLabel="socios"
                            />
                            <div className={styles.donutLegend}>
                                {derived.generoData.map((g, idx) => {
                                    const pct = derived.totalGenero ? Math.round((g.value / derived.totalGenero) * 100) : 0;
                                    return (
                                        <div key={idx} className={styles.legendRow}>
                                            <span className={styles.legendDot} style={{ background: g.color }}></span>
                                            <span className={styles.legendName}>{g.label}</span>
                                            <span className={styles.legendValue}>{g.value} <span className={styles.legendPct}>({pct}%)</span></span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
