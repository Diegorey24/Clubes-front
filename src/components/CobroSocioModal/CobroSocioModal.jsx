import { useState, useEffect } from 'react';
import { buscarCuotasPendientes, cobrarCuotasSocio, getMediosPago } from '../../services/api';
import styles from './CobroSocioModal.module.css';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(amount || 0);
};

const formatAniomes = (aniomes) => {
    const value = Number(aniomes);
    const year = Math.floor(value / 100);
    const month = value % 100;
    return `${String(month).padStart(2, '0')}/${year}`;
};

const nuevaFormaPago = (importe = '') => ({ medioPago: '', importe });

const CobroSocioModal = ({ isOpen, onClose, onSuccess, caja, usuario, showToast }) => {
    const [query, setQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [socio, setSocio] = useState(null);
    const [candidatos, setCandidatos] = useState(null);
    const [cuotas, setCuotas] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [submitting, setSubmitting] = useState(false);

    const [mediosPago, setMediosPago] = useState([]);
    const [paso, setPaso] = useState('cuotas'); // 'cuotas' | 'pago'
    const [formasPago, setFormasPago] = useState([nuevaFormaPago()]);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSocio(null);
            setCandidatos(null);
            setCuotas([]);
            setSelectedIds(new Set());
            setPaso('cuotas');
            setFormasPago([nuevaFormaPago()]);
            getMediosPago()
                .then((data) => setMediosPago(Array.isArray(data) ? data : []))
                .catch(() => setMediosPago([]));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const buscar = async (params) => {
        setSearching(true);
        setSocio(null);
        setCandidatos(null);
        setCuotas([]);
        setSelectedIds(new Set());
        try {
            const data = await buscarCuotasPendientes(params);
            if (data.candidatos && data.candidatos.length > 0) {
                setCandidatos(data.candidatos);
            } else if (data.socio) {
                setSocio(data.socio);
                setCuotas(data.cuotas || []);
            } else {
                showToast('No se encontró ningún socio', 'error');
            }
        } catch (err) {
            showToast(err.response?.data?.error || 'Error al buscar al socio', 'error');
        } finally {
            setSearching(false);
        }
    };

    const handleBuscar = (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        const esCi = /^\d+$/.test(query.trim());
        buscar(esCi ? { ci: query.trim() } : { nombre: query.trim() });
    };

    const handleElegirCandidato = (candidato) => {
        setQuery(String(candidato.SocDocIde));
        buscar({ ci: candidato.SocDocIde });
    };

    const toggleCuota = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const total = cuotas
        .filter((c) => selectedIds.has(c.Id))
        .reduce((acc, c) => acc + (parseFloat(c.Importe) || 0), 0);

    const totalFormasPago = formasPago.reduce((acc, fp) => acc + (parseFloat(fp.importe) || 0), 0);
    const restante = total - totalFormasPago;

    const handleIrAFormaPago = () => {
        if (selectedIds.size === 0) {
            showToast('Seleccione al menos una cuota', 'error');
            return;
        }
        setFormasPago([nuevaFormaPago(total)]);
        setPaso('pago');
    };

    const handleVolverACuotas = () => {
        setPaso('cuotas');
    };

    const handleChangeFormaPago = (index, field, value) => {
        setFormasPago((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const handleAgregarFormaPago = () => {
        setFormasPago((prev) => [...prev, nuevaFormaPago(restante > 0 ? restante : '')]);
    };

    const handleQuitarFormaPago = (index) => {
        setFormasPago((prev) => prev.filter((_, i) => i !== index));
    };

    const formasPagoValidas =
        formasPago.length > 0 &&
        formasPago.every((fp) => fp.medioPago && parseFloat(fp.importe) > 0) &&
        Math.abs(restante) < 0.01;

    const handleCobrar = async () => {
        if (!formasPagoValidas) {
            showToast('Las formas de pago deben cubrir exactamente el total a cobrar', 'error');
            return;
        }
        setSubmitting(true);
        try {
            await cobrarCuotasSocio({
                caja,
                usuario,
                ci: socio.SocDocIde,
                nombreSocio: socio.SocNom?.trim(),
                cuotaIds: Array.from(selectedIds),
                formasPago: formasPago.map((fp) => ({
                    medioPago: Number(fp.medioPago),
                    importe: parseFloat(fp.importe) || 0,
                })),
            });
            showToast(`Cobro registrado: ${formatCurrency(total)}`, 'success');
            onSuccess();
        } catch (err) {
            showToast(err.response?.data?.error || 'Error al registrar el cobro', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Cobrar Cuota a Socio</h3>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                <div className={styles.body}>
                    {paso === 'cuotas' && (
                        <>
                            <form onSubmit={handleBuscar} className={styles.searchRow}>
                                <input
                                    type="text"
                                    placeholder="Cédula o nombre del socio"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    autoFocus
                                />
                                <button type="submit" className="btn-secondary" disabled={searching}>
                                    {searching ? 'Buscando...' : 'Buscar'}
                                </button>
                            </form>

                            {candidatos && (
                                <div className={styles.candidatos}>
                                    {candidatos.map((c) => (
                                        <button
                                            key={c.SocNro}
                                            className={styles.candidatoBtn}
                                            onClick={() => handleElegirCandidato(c)}
                                        >
                                            {c.SocNom?.trim()} — CI {c.SocDocIde}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {socio && (
                                <>
                                    <div className={styles.socioInfo}>
                                        {socio.SocNom?.trim()} — CI {socio.SocDocIde} — Socio N° {socio.SocNro}
                                    </div>

                                    {cuotas.length === 0 ? (
                                        <p className={styles.empty}>Este socio no tiene cuotas pendientes.</p>
                                    ) : (
                                        <>
                                            <div className={styles.cuotasList}>
                                                {cuotas.map((c) => (
                                                    <div className={styles.cuotaRow} key={c.Id}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.has(c.Id)}
                                                            onChange={() => toggleCuota(c.Id)}
                                                            id={`cuota-${c.Id}`}
                                                        />
                                                        <label htmlFor={`cuota-${c.Id}`}>
                                                            <span>{formatAniomes(c.Aniomes)}</span>
                                                            <span>{c.Rubro} - {c.RubroNombre?.trim() || 'Sin rubro'}</span>
                                                            <span>{formatCurrency(c.Importe)}</span>
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className={styles.totalBox}>
                                                <span>Total seleccionado</span>
                                                <span>{formatCurrency(total)}</span>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {paso === 'pago' && (
                        <>
                            <div className={styles.socioInfo}>
                                {socio.SocNom?.trim()} — CI {socio.SocDocIde} — Total a cobrar: {formatCurrency(total)}
                            </div>

                            <div className={styles.cuotasList}>
                                {formasPago.map((fp, index) => (
                                    <div className={styles.formaPagoRow} key={index}>
                                        <select
                                            value={fp.medioPago}
                                            onChange={(e) => handleChangeFormaPago(index, 'medioPago', e.target.value)}
                                        >
                                            <option value="">Seleccione medio de pago</option>
                                            {mediosPago.map((mp) => (
                                                <option key={mp.IdMedioPago} value={mp.IdMedioPago}>
                                                    {mp.Descripcion}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="Importe"
                                            value={fp.importe}
                                            onChange={(e) => handleChangeFormaPago(index, 'importe', e.target.value)}
                                        />
                                        {formasPago.length > 1 && (
                                            <button
                                                type="button"
                                                className={styles.removeFormaPagoBtn}
                                                onClick={() => handleQuitarFormaPago(index)}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button type="button" className="btn-secondary" onClick={handleAgregarFormaPago}>
                                + Agregar otra forma de pago
                            </button>

                            <div className={`${styles.totalBox} ${Math.abs(restante) >= 0.01 ? styles.totalBoxAlerta : ''}`}>
                                <span>Restante por asignar</span>
                                <span>{formatCurrency(restante)}</span>
                            </div>
                        </>
                    )}

                    <div className={styles.actions}>
                        {paso === 'cuotas' && (
                            <>
                                <button type="button" className="btn-secondary" onClick={onClose}>
                                    Cancelar
                                </button>
                                {socio && cuotas.length > 0 && (
                                    <button
                                        type="button"
                                        className="btn-primary"
                                        onClick={handleIrAFormaPago}
                                        disabled={selectedIds.size === 0}
                                    >
                                        Continuar
                                    </button>
                                )}
                            </>
                        )}
                        {paso === 'pago' && (
                            <>
                                <button type="button" className="btn-secondary" onClick={handleVolverACuotas}>
                                    Volver
                                </button>
                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={handleCobrar}
                                    disabled={submitting || !formasPagoValidas}
                                >
                                    {submitting ? 'Procesando...' : 'Cobrar'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CobroSocioModal;
