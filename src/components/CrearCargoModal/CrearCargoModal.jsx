import { useState, useEffect } from 'react';
import { crearCargo } from '../../services/api';
import { Button } from '../ui';
import BuscarRubroModal from '../BuscarRubroModal/BuscarRubroModal';
import styles from './CrearCargoModal.module.css';

const CargoIcon = (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m-6 4h6m-6 4h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
    </svg>
);

const CloseIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SearchIcon = (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);

// Trim seguro para campos char fijo que a veces llegan rellenados con
// espacios en blanco.
const trim = (value) => (value || '').toString().trim();

// A partir del input type="month" (AAAA-MM) calcula los tres formatos que
// pide la API: Mes (fecha, primer día del mes), Aniomes (AAAAMM numérico)
// y FechaVto (último día de ese mismo mes).
const derivarPeriodo = (mesAnio) => {
    const [y, m] = mesAnio.split('-').map(Number);
    const mesFecha = `${mesAnio}-01`;
    const aniomes = y * 100 + m;
    const ultimoDia = new Date(y, m, 0).getDate();
    const fechaVto = `${mesAnio}-${String(ultimoDia).padStart(2, '0')}`;
    return { mesFecha, aniomes, fechaVto };
};

const CrearCargoModal = ({ isOpen, onClose, onSuccess, socio, usuario, showToast }) => {
    const [mesAnio, setMesAnio] = useState('');
    const [rubro, setRubro] = useState(null);
    const [importe, setImporte] = useState('');
    const [showBuscarRubro, setShowBuscarRubro] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setMesAnio('');
        setRubro(null);
        setImporte('');
        setShowBuscarRubro(false);
        setFormError('');
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape' && !saving && !showBuscarRubro) onClose?.();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, saving, showBuscarRubro]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !saving) onClose?.();
    };

    const rubroImporteFijo = rubro && Number(rubro.Importe) !== 0;

    const handleSelectRubro = (rubroSeleccionado) => {
        setRubro(rubroSeleccionado);
        setImporte(Number(rubroSeleccionado.Importe) !== 0 ? rubroSeleccionado.Importe : '');
        setShowBuscarRubro(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!mesAnio) {
            setFormError('Seleccioná el mes del cargo');
            return;
        }
        if (!rubro) {
            setFormError('Seleccioná un rubro');
            return;
        }
        if (importe === '' || Number.isNaN(Number(importe)) || Number(importe) <= 0) {
            setFormError('Ingresá un importe válido');
            return;
        }
        if (!usuario) {
            setFormError('No se pudo identificar al usuario logueado');
            return;
        }
        setFormError('');

        const { mesFecha, aniomes, fechaVto } = derivarPeriodo(mesAnio);
        const payload = {
            CI: Number(socio.SocDocIde),
            Mes: mesFecha,
            Rubro: Number(rubro.IdRubro),
            Importe: Number(importe),
            Aniomes: aniomes,
            Usuario: usuario,
            FechaVto: fechaVto,
        };

        setSaving(true);
        try {
            await crearCargo(payload);
            showToast?.('Cargo creado exitosamente', 'success');
            onSuccess?.();
            onClose?.();
        } catch (err) {
            console.error('Error creando cargo:', err);
            showToast?.(err.response?.data?.error || 'Error al crear el cargo', 'error');
        } finally {
            setSaving(false);
        }
    };

    const periodoPreview = mesAnio ? derivarPeriodo(mesAnio) : null;

    return (
        <>
            <div className={styles.overlay} onClick={handleBackdropClick}>
                <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="crear-cargo-title">
                    <div className={styles.header}>
                        <div className={styles.headerLeft}>
                            <span className={styles.iconWrap}>{CargoIcon}</span>
                            <h3 id="crear-cargo-title" className={styles.title}>Crear Cargo</h3>
                        </div>
                        <button
                            type="button"
                            className={styles.closeBtn}
                            onClick={onClose}
                            disabled={saving}
                            aria-label="Cerrar"
                        >
                            {CloseIcon}
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.socioBox}>
                            <span className={styles.socioBoxLabel}>Socio</span>
                            <span className={styles.socioNombre}>
                                {[socio?.PrimerNombre, socio?.SegundoNombre, socio?.PrimerApellido, socio?.SegundoApellido]
                                    .map(trim)
                                    .filter(Boolean)
                                    .join(' ')}
                            </span>
                            <span className={styles.socioMeta}>
                                Socio N.° {socio?.SocNro} · CI {socio?.SocDocIde}
                            </span>
                        </div>

                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label htmlFor="mesAnio">Mes <span className={styles.required}>*</span></label>
                                <input
                                    type="month"
                                    id="mesAnio"
                                    className={styles.input}
                                    value={mesAnio}
                                    onChange={(e) => setMesAnio(e.target.value)}
                                    required
                                    disabled={saving}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="fechaVto">Vencimiento</label>
                                <input
                                    type="text"
                                    id="fechaVto"
                                    className={styles.input}
                                    value={periodoPreview ? periodoPreview.fechaVto.split('-').reverse().join('/') : '-'}
                                    disabled
                                />
                            </div>

                            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                <label htmlFor="rubroNombre">Rubro <span className={styles.required}>*</span></label>
                                <div className={styles.rubroField}>
                                    <input
                                        type="text"
                                        id="rubroNombre"
                                        className={styles.input}
                                        value={rubro ? `${rubro.Nombre?.trim()} (Código ${rubro.IdRubro})` : ''}
                                        placeholder="Seleccioná un rubro"
                                        readOnly
                                    />
                                    <button
                                        type="button"
                                        className={styles.searchBtn}
                                        onClick={() => setShowBuscarRubro(true)}
                                        disabled={saving}
                                        aria-label="Buscar rubro"
                                        title="Buscar rubro"
                                    >
                                        {SearchIcon}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="importe">Importe <span className={styles.required}>*</span></label>
                                <input
                                    type="number"
                                    id="importe"
                                    className={styles.input}
                                    value={importe}
                                    onChange={(e) => setImporte(e.target.value)}
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    required
                                    disabled={saving || rubroImporteFijo}
                                />
                                {rubroImporteFijo && (
                                    <span className={styles.hint}>Importe fijo del rubro seleccionado.</span>
                                )}
                                {rubro && !rubroImporteFijo && (
                                    <span className={styles.hint}>Este rubro no tiene importe fijo, ingresalo manualmente.</span>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="usuario">Usuario</label>
                                <input
                                    type="text"
                                    id="usuario"
                                    className={styles.input}
                                    value={usuario || ''}
                                    disabled
                                />
                            </div>
                        </div>

                        {formError && <p className={styles.formError}>{formError}</p>}

                        <div className={styles.actions}>
                            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="primary" loading={saving}>
                                Crear Cargo
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            <BuscarRubroModal
                isOpen={showBuscarRubro}
                onClose={() => setShowBuscarRubro(false)}
                onSelect={handleSelectRubro}
            />
        </>
    );
};

export default CrearCargoModal;
