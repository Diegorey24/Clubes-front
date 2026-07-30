import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../services/api';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error('Error loading dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    if (loading) {
        return <div className={styles.loading}>Cargando panel de control...</div>;
    }

    if (!stats) {
        return <div className={styles.loading}>Error al cargar datos</div>;
    }

    // Helper to calculate max for bars
    const maxCategory = Math.max(...(stats.byCategory?.map(c => c.count) || [0])) || 1;
    const maxRadio = Math.max(...(stats.byRadio?.map(r => r.count) || [0])) || 1;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Panel de Control</h1>
                    <p className={styles.subtitle}>Resumen general</p>
                </div>
                <Link to="/agregar-socio" className={styles.addButton}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Socio
                </Link>
            </div>

            {/* Main Content Grid that fills remaining space */}
            <div className={styles.mainLayout}>
                {/* Top Summary Cards */}
                <div className={styles.summaryGrid}>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryContent}>
                            <div className={styles.cardTitle}>Socios Activos</div>
                            <div className={styles.cardValue}>{stats.totalActive}</div>
                        </div>
                        <div className={styles.cardIcon}>
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className={styles.summaryCard}>
                        <div className={styles.summaryContent}>
                            <div className={styles.cardTitle}>Socios Históricos</div>
                            <div className={styles.cardValue}>{stats.totalHistorical}</div>
                        </div>
                        <div className={`${styles.cardIcon} ${styles.historical}`}>
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Charts/Lists Grid */}
                <div className={styles.chartsGrid}>
                    {/* Categories */}
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}>Distribución por Categoría</h3>
                        <div className={styles.barList}>
                            {stats.byCategory?.slice(0, 10).map((cat, idx) => (
                                <div key={idx} className={styles.barItem}>
                                    <div className={styles.barHeader}>
                                        <span>{cat.name || 'Sin Categoría'}</span>
                                        <span>{cat.count}</span>
                                    </div>
                                    <div className={styles.barContainer}>
                                        <div
                                            className={styles.barFill}
                                            style={{ width: `${(cat.count / maxCategory) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Radios */}
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}>Distribución por Radio</h3>
                        <div className={styles.barList}>
                            {stats.byRadio?.slice(0, 10).map((rad, idx) => (
                                <div key={idx} className={styles.barItem}>
                                    <div className={styles.barHeader}>
                                        <span>{rad.name || 'Sin Radio'}</span>
                                        <span>{rad.count}</span>
                                    </div>
                                    <div className={styles.barContainer}>
                                        <div
                                            className={styles.barFill}
                                            style={{
                                                width: `${(rad.count / maxRadio) * 100}%`,
                                                background: 'linear-gradient(90deg, var(--secondary-500), var(--secondary-400))'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gender */}
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}>Género</h3>
                        <div className={styles.genderContainer}>
                            {stats.byGender?.map((g, idx) => (
                                <div key={idx} className={styles.genderItem}>
                                    <span className={styles.genderName}>{g.name}</span>
                                    <span className={styles.genderCount}>{g.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
