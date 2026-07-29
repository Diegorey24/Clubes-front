import { useState } from 'react';
import { getCuotasPendientes, generarCuotas } from '../services/api';
import { ConfirmDialog } from '../components/ui';
import styles from './GenerarCuotasPage.module.css';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(amount || 0);
};

// periodo viene como "AAAA-MM" del input type=month; se muestra como MM/AAAA.
const formatPeriodo = (value) => {
    if (!value) return '-';
    const [y, m] = value.split('-');
    return `${m}/${y}`;
};

const GenerarCuotasPage = ({ showToast }) => {
    const [periodo, setPeriodo] = useState('');
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [generando, setGenerando] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const periodoToAniomes = (value) => {
        // value viene como "AAAA-MM" del input type=month
        return value.replace('-', '');
    };

    const handleConsultar = async () => {
        if (!periodo) {
            showToast('Seleccioná el año y mes', 'error');
            return;
        }
        setResult(null);
        setLoadingPreview(true);
        try {
            const aniomes = periodoToAniomes(periodo);
            const data = await getCuotasPendientes(aniomes);
            setPreview(data);
        } catch (err) {
            console.error('Error al consultar cuotas pendientes:', err);
            showToast('Error al consultar las cuotas pendientes', 'error');
            setPreview(null);
        } finally {
            setLoadingPreview(false);
        }
    };

    const handleGenerar = () => {
        if (!preview) return;
        setIsConfirmOpen(true);
    };

    const handleConfirmarGenerar = async () => {
        if (!preview) return;
        setGenerando(true);
        try {
            const data = await generarCuotas(preview.aniomes);
            setResult(data);
            setPreview(null);
            setIsConfirmOpen(false);
            showToast(`Se generaron ${data.generadas} cuotas correctamente`, 'success');
        } catch (err) {
            console.error('Error al generar cuotas:', err);
            showToast('Error al generar las cuotas', 'error');
        } finally {
            setGenerando(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Generación de Cuotas</h2>
                    <p className={styles.subtitle}>
                        Genera la cuota social (Rubro 1) del período seleccionado para los socios activos que todavía no la tengan.
                    </p>
                </div>

                <div className={styles.card}>
                    <div className={styles.field}>
                        <label>Período (Año y Mes)</label>
                        <input
                            type="month"
                            value={periodo}
                            onChange={(e) => {
                                setPeriodo(e.target.value);
                                setPreview(null);
                                setResult(null);
                            }}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button
                            className={styles.btnSecondary}
                            onClick={handleConsultar}
                            disabled={loadingPreview || !periodo}
                        >
                            {loadingPreview ? 'Consultando...' : 'Consultar Pendientes'}
                        </button>
                        <button
                            className={styles.btnPrimary}
                            onClick={handleGenerar}
                            disabled={!preview || preview.cantidad === 0 || generando}
                        >
                            {generando ? 'Generando...' : 'Generar Cuotas'}
                        </button>
                    </div>

                    {preview && (
                        <div className={styles.preview}>
                            {preview.cantidad > 0 ? (
                                <p>
                                    Hay <strong>{preview.cantidad}</strong> socios sin la cuota de{' '}
                                    <strong>{periodo}</strong>, por un total estimado de{' '}
                                    <strong>{formatCurrency(preview.totalEstimado)}</strong>.
                                </p>
                            ) : (
                                <p>Todos los socios activos ya tienen la cuota de {periodo} generada.</p>
                            )}
                        </div>
                    )}

                    {result && (
                        <div className={styles.result}>
                            <p>
                                Se generaron <strong>{result.generadas}</strong> cuotas por un total de{' '}
                                <strong>{formatCurrency(result.totalImporte)}</strong>. Se actualizó el período de
                                cargos en Parámetros.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={isConfirmOpen}
                title="¿Generar las cuotas de este período?"
                description="Esta acción crea la cuota social en la cuenta corriente de cada socio incluido y no se puede deshacer."
                confirmLabel="Sí, generar cuotas"
                variant="primary"
                loading={generando}
                onConfirm={handleConfirmarGenerar}
                onCancel={() => setIsConfirmOpen(false)}
            >
                {preview && (
                    <div className={styles.confirmDetail}>
                        <span>Período {formatPeriodo(periodo)}</span>
                        <span>{preview.cantidad} cuota{preview.cantidad !== 1 ? 's' : ''} · {formatCurrency(preview.totalEstimado)} estimado</span>
                    </div>
                )}
            </ConfirmDialog>
        </div>
    );
};

export default GenerarCuotasPage;
