import { useState, useEffect } from 'react';
import { fetchItems, createCargoExtra, updateCargoExtra } from '../../services/api';
import { Button } from '../ui';
import styles from './CargoExtraModal.module.css';

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

// Trim seguro para campos char fijo que a veces llegan rellenados con
// espacios en blanco.
const trim = (value) => (value || '').toString().trim();

// Rubro especial de "cuota de categoría" (mismo ID_RUBRO_CATEGORIA que usa
// CrearCargoModal): su importe sale de la categoría del socio, no tiene
// sentido cargarlo como cargo extra, así que nunca se ofrece en el select.
const ID_RUBRO_CATEGORIA = 1;

// Alta/edición de un cargo extra (Ci, Rubro, Importe -- clave compuesta
// Ci+Rubro, un socio puede tener varios cargos extra pero no repetir
// rubro). Si "cargoExtraActual" viene cargado se edita (solo el importe,
// el rubro no se puede cambiar porque es parte de la clave); si no, se da
// de alta uno nuevo eligiendo el rubro de un select. Al elegir el rubro se
// autocompleta el importe con el importe del rubro; el usuario puede
// dejarlo o editarlo antes de guardar. "rubrosExcluidos" son los códigos
// de rubro que el socio ya tiene cargados (no se pueden repetir).
const CargoExtraModal = ({ isOpen, onClose, onSuccess, socio, cargoExtraActual, rubrosExcluidos = [], showToast }) => {
    const esEdicion = !!cargoExtraActual;

    const [rubros, setRubros] = useState([]);
    const [loadingRubros, setLoadingRubros] = useState(false);
    const [rubroSeleccionado, setRubroSeleccionado] = useState('');
    const [importe, setImporte] = useState('');
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setFormError('');
        if (esEdicion) {
            setRubroSeleccionado(String(cargoExtraActual.Rubro));
            setImporte(String(cargoExtraActual.Importe ?? ''));
            return;
        }
        setRubroSeleccionado('');
        setImporte('');
        loadRubros();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape' && !saving) onClose?.();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, saving, onClose]);

    if (!isOpen) return null;

    const loadRubros = async () => {
        setLoadingRubros(true);
        try {
            const data = await fetchItems('rubros');
            setRubros(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading rubros:', err);
            setFormError('No se pudieron cargar los rubros');
        } finally {
            setLoadingRubros(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !saving) onClose?.();
    };

    // Rubros disponibles para elegir: todos, salvo el rubro de "cuota de
    // categoría" (nunca se ofrece) y los que el socio ya tiene cargados
    // como cargo extra (Ci+Rubro es único).
    const rubrosDisponibles = rubros.filter(
        (r) => Number(r.IdRubro) !== ID_RUBRO_CATEGORIA
            && !rubrosExcluidos.some((cod) => String(cod) === String(r.IdRubro))
    );

    const handleSelectRubro = (e) => {
        const value = e.target.value;
        setRubroSeleccionado(value);
        const rubro = rubros.find((r) => String(r.IdRubro) === value);
        setImporte(rubro && Number(rubro.Importe) ? String(rubro.Importe) : '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rubroSeleccionado) {
            setFormError('Seleccioná un rubro');
            return;
        }
        const valor = Number(importe);
        if (importe === '' || Number.isNaN(valor) || valor <= 0) {
            setFormError('Ingresá un importe válido');
            return;
        }
        setFormError('');
        setSaving(true);
        try {
            if (esEdicion) {
                await updateCargoExtra(socio.SocDocIde, rubroSeleccionado, valor);
                showToast?.('Cargo extra actualizado exitosamente', 'success');
            } else {
                await createCargoExtra(socio.SocDocIde, rubroSeleccionado, valor);
                showToast?.('Cargo extra agregado exitosamente', 'success');
            }
            onSuccess?.();
            onClose?.();
        } catch (err) {
            console.error('Error guardando el cargo extra:', err);
            const mensaje = err.response?.status === 409
                ? 'Este socio ya tiene un cargo extra cargado para ese rubro'
                : (err.response?.data?.error || 'Error al guardar el cargo extra');
            showToast?.(mensaje, 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={handleBackdropClick}>
            <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="cargo-extra-title">
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <span className={styles.iconWrap}>{CargoIcon}</span>
                        <h3 id="cargo-extra-title" className={styles.title}>
                            {esEdicion ? 'Editar Cargo Extra' : 'Agregar Cargo Extra'}
                        </h3>
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

                    <div className={styles.formGroup}>
                        <label htmlFor="rubro">Rubro <span className={styles.required}>*</span></label>
                        {esEdicion ? (
                            <input
                                type="text"
                                id="rubro"
                                className={styles.input}
                                value={cargoExtraActual.RubDsc?.trim() || `Rubro ${cargoExtraActual.Rubro}`}
                                disabled
                            />
                        ) : (
                            <select
                                id="rubro"
                                className={styles.select}
                                value={rubroSeleccionado}
                                onChange={handleSelectRubro}
                                disabled={saving || loadingRubros}
                                required
                            >
                                <option value="">
                                    {loadingRubros ? 'Cargando rubros...' : 'Seleccioná un rubro'}
                                </option>
                                {rubrosDisponibles.map((r) => (
                                    <option key={r.IdRubro} value={r.IdRubro}>
                                        {r.Nombre?.trim?.() || r.Nombre}
                                    </option>
                                ))}
                            </select>
                        )}
                        {esEdicion && (
                            <span className={styles.hint}>El rubro no se puede modificar; para cambiarlo, eliminá este cargo y agregá uno nuevo.</span>
                        )}
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
                            disabled={saving}
                        />
                        {!esEdicion && (
                            <span className={styles.hint}>Se autocompleta con el importe del rubro elegido; podés dejarlo o editarlo.</span>
                        )}
                    </div>

                    {formError && <p className={styles.formError}>{formError}</p>}

                    <div className={styles.actions}>
                        <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" loading={saving}>
                            {esEdicion ? 'Guardar Cambios' : 'Agregar Cargo Extra'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CargoExtraModal;
