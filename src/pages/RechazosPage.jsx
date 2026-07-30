import { useState } from 'react';
import { getSocios, getPagosCuentaCorriente } from '../services/api';
import { nombreCompleto } from '../utils/socioNombre';
import SocioSearchPicker from '../components/SocioSearchPicker/SocioSearchPicker';
import RechazosTable from '../components/RechazosTable/RechazosTable';
import { PageHeader } from '../components/ui';
import styles from './RechazosPage.module.css';

const ChangeIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

// Busca entre todos los socios activos (no solo los que no tienen grupo
// familiar, a diferencia del uso habitual de SocioSearchPicker): acá
// cualquier socio puede tener pagos para rechazar. Se pide una sola página
// chica de resultados, alcanza para un buscador en vivo.
const buscarSocios = (term) => getSocios(1, 8, term);

const RechazosPage = ({ showToast }) => {
    const [socio, setSocio] = useState(null);
    const [mes, setMes] = useState('');
    const [pagos, setPagos] = useState(null);
    const [loadingPagos, setLoadingPagos] = useState(false);

    const cargarPagos = async (ci, mesValor) => {
        setLoadingPagos(true);
        try {
            const data = await getPagosCuentaCorriente(ci, mesValor);
            setPagos(Array.isArray(data) ? data : (data?.items || []));
        } catch (err) {
            console.error('Error al buscar los pagos:', err);
            showToast('Error al buscar los pagos del socio', 'error');
            setPagos([]);
        } finally {
            setLoadingPagos(false);
        }
    };

    const handlePickSocio = (s) => {
        setSocio(s);
        setMes('');
        setPagos(null);
    };

    const handleCambiarSocio = () => {
        setSocio(null);
        setMes('');
        setPagos(null);
    };

    const handleMesChange = (e) => {
        const value = e.target.value;
        setMes(value);
        if (value && socio) {
            cargarPagos(socio.SocDocIde, value);
        } else {
            setPagos(null);
        }
    };

    const handleRechazado = () => {
        showToast('Pago rechazado correctamente', 'success');
        if (socio && mes) {
            cargarPagos(socio.SocDocIde, mes);
        }
    };

    return (
        <div className={styles.page}>
            <PageHeader
                title="Rechazos"
                subtitle="Buscá un socio y un mes para revertir un pago registrado por error."
            />

            <div className={styles.card}>
                <p className={styles.sectionLabel}>1. Buscar socio</p>
                {socio ? (
                    <div className={styles.socioInfo}>
                        <div>
                            <span className={styles.socioNombre}>{nombreCompleto(socio)}</span>
                            <span className={styles.socioMeta}>CI {socio.SocDocIde} · Socio N.° {socio.SocNro}</span>
                        </div>
                        <button type="button" className={styles.cambiarBtn} onClick={handleCambiarSocio}>
                            {ChangeIcon}
                            <span>Cambiar socio</span>
                        </button>
                    </div>
                ) : (
                    <SocioSearchPicker
                        onPick={handlePickSocio}
                        fetcher={buscarSocios}
                        placeholder="Buscar por nombre o cédula"
                    />
                )}

                {socio && (
                    <>
                        <p className={styles.sectionLabel}>2. Seleccioná el mes</p>
                        <input
                            type="month"
                            className={styles.monthInput}
                            value={mes}
                            onChange={handleMesChange}
                        />
                    </>
                )}
            </div>

            {socio && mes && (
                loadingPagos ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Buscando pagos...</p>
                    </div>
                ) : (
                    pagos !== null && (
                        <RechazosTable pagos={pagos} onRechazado={handleRechazado} />
                    )
                )
            )}
        </div>
    );
};

export default RechazosPage;
