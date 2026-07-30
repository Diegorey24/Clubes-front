import { useState, useEffect } from 'react';
import { crearCargo, getCategoriaSocio, getGrupoFamiliar } from '../../services/api';
import { Button } from '../ui';
import BuscarRubroModal from '../BuscarRubroModal/BuscarRubroModal';
import styles from './CrearCargoModal.module.css';

// Rubro especial: "cuota de categoría". Para este rubro el importe no lo
// define el rubro (a diferencia del resto) sino la categoría del socio y,
// si pertenece a un grupo familiar, la cantidad de integrantes de ese grupo.
const ID_RUBRO_CATEGORIA = 1;

// Mapea la cantidad total de integrantes del grupo familiar (titular +
// integrantes) al campo de importe escalonado que corresponde en la
// categoría del socio.
const importeSegunIntegrantes = (cantidad, categoria) => {
    if (cantidad <= 2) return categoria.CatPrc;
    if (cantidad === 3) return categoria.Importe3;
    if (cantidad === 4) return categoria.Importe4;
    if (cantidad === 5) return categoria.Importe5;
    if (cantidad === 6) return categoria.Importe6;
    return categoria.Importe7; // 7 o más integrantes
};

// Un socio puede tener un descuento porcentual propio (DescuentoPorcentaje,
// viene en el join de GET /socios/:id y /socios-historicos/:id). 0, null,
// undefined o '' significan "sin descuento cargado".
const tieneDescuentoValido = (socio) => {
    const valor = socio?.DescuentoPorcentaje;
    if (valor === null || valor === undefined || valor === '') return false;
    const numero = Number(valor);
    return !Number.isNaN(numero) && numero !== 0;
};

// Aplica el descuento del socio (si tiene uno cargado) sobre un importe que
// el sistema ya calculó solo -- rubro con importe fijo, o el que sale de la
// categoría/grupo familiar. Siempre redondea a dos decimales.
const aplicarDescuentoSocio = (importe, socio) => {
    const base = Number(importe) || 0;
    if (!tieneDescuentoValido(socio)) return Number(base.toFixed(2));
    const descuento = Number(socio.DescuentoPorcentaje);
    return Number((base * (1 - descuento / 100)).toFixed(2));
};

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
    const [calculandoImporte, setCalculandoImporte] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setMesAnio('');
        setRubro(null);
        setImporte('');
        setShowBuscarRubro(false);
        setFormError('');
        setCalculandoImporte(false);
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

    const esRubroCategoria = rubro && Number(rubro.IdRubro) === ID_RUBRO_CATEGORIA;
    const rubroImporteFijo = rubro && !esRubroCategoria && Number(rubro.Importe) !== 0;

    const handleSelectRubro = async (rubroSeleccionado) => {
        setRubro(rubroSeleccionado);
        setShowBuscarRubro(false);
        setFormError('');

        if (Number(rubroSeleccionado.IdRubro) !== ID_RUBRO_CATEGORIA) {
            const importeFijo = Number(rubroSeleccionado.Importe) !== 0 ? Number(rubroSeleccionado.Importe) : null;
            setImporte(importeFijo !== null ? aplicarDescuentoSocio(importeFijo, socio) : '');
            return;
        }

        // Rubro de "cuota de categoría": el importe se calcula, no lo carga
        // el usuario ni lo trae el rubro.
        setImporte('');

        if (!socio?.CatCod) {
            setFormError('El socio no tiene categoría asignada, no se puede calcular el importe.');
            return;
        }

        setCalculandoImporte(true);
        try {
            const categoria = await getCategoriaSocio(socio.CatCod);
            const grupoNro = Number(socio.GruFamNro) || 0;

            let importeBase;
            if (grupoNro === 0) {
                importeBase = categoria.CatPrc;
            } else {
                const grupo = await getGrupoFamiliar(grupoNro);
                const cantidadIntegrantes = 1 + (grupo?.integrantes?.length || 0);
                importeBase = importeSegunIntegrantes(cantidadIntegrantes, categoria);
            }
            setImporte(importeBase !== null && importeBase !== undefined ? aplicarDescuentoSocio(importeBase, socio) : '');
        } catch (err) {
            console.error('Error calculando importe por categoría:', err);
            setFormError('No se pudo calcular el importe de la categoría. Intentá nuevamente.');
        } finally {
            setCalculandoImporte(false);
        }
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
        if (calculandoImporte) {
            setFormError('Esperá a que termine de calcularse el importe');
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
                                    disabled={saving || rubroImporteFijo || esRubroCategoria || calculandoImporte}
                                />
                                {esRubroCategoria ? (
                                    <span className={styles.hint}>
                                        {calculandoImporte
                                            ? 'Calculando importe según la categoría del socio...'
                                            : tieneDescuentoValido(socio)
                                                ? `Importe calculado según la categoría del socio, con el ${socio.DescuentoPorcentaje}% de descuento del socio ya aplicado.`
                                                : 'Importe calculado según la categoría del socio.'}
                                    </span>
                                ) : rubroImporteFijo ? (
                                    <span className={styles.hint}>
                                        {tieneDescuentoValido(socio)
                                            ? `Importe fijo del rubro, con el ${socio.DescuentoPorcentaje}% de descuento del socio ya aplicado.`
                                            : 'Importe fijo del rubro seleccionado.'}
                                    </span>
                                ) : rubro ? (
                                    <span className={styles.hint}>Este rubro no tiene importe fijo, ingresalo manualmente.</span>
                                ) : null}
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
                            <Button type="submit" variant="primary" loading={saving} disabled={calculandoImporte}>
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
