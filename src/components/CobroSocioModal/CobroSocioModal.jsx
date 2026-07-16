import { useState, useEffect } from 'react';
import { buscarCuotasPendientes, cobrarCuotasSocio, getMediosPago } from '../../services/api';
import { Button } from '../ui';
import { generarReciboPDF } from '../../utils/reciboPdf';
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

// SocNom viene como char fijo y a veces llega en blanco. En ese caso
// armamos el nombre con Primer/Segundo Nombre y Apellido, trimeados.
const nombreCompleto = (s) => {
    if (!s) return '';
    const socNom = (s.SocNom || '').trim();
    if (socNom) return socNom;
    const partes = [s.PrimerNombre, s.SegundoNombre, s.PrimerApellido, s.SegundoApellido]
        .map((p) => (p || '').trim())
        .filter(Boolean);
    return partes.join(' ');
};

const nuevaFormaPago = (importe = '') => ({ medioPago: '', importe });

const CobrarIcon = (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2m9-8a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CloseIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SearchIcon = (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);

const PlusIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const RemoveIcon = (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const BackArrowIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const DownloadIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

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
    const [reciboData, setReciboData] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSocio(null);
            setCandidatos(null);
            setCuotas([]);
            setSelectedIds(new Set());
            setPaso('cuotas');
            setFormasPago([nuevaFormaPago()]);
            setReciboData(null);
            getMediosPago()
                .then((data) => setMediosPago(Array.isArray(data) ? data : []))
                .catch(() => setMediosPago([]));
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape' && !submitting) onClose?.();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, submitting]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !submitting) onClose?.();
    };

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
            const result = await cobrarCuotasSocio({
                caja,
                usuario,
                ci: socio.SocDocIde,
                nombreSocio: nombreCompleto(socio),
                cuotaIds: Array.from(selectedIds),
                formasPago: formasPago.map((fp) => ({
                    medioPago: Number(fp.medioPago),
                    importe: parseFloat(fp.importe) || 0,
                })),
            });
            showToast(`Cobro registrado: ${formatCurrency(total)}`, 'success');
            setReciboData({
                nroDoc: result.nroDoc,
                nombreSocio: nombreCompleto(socio),
                ci: socio.SocDocIde,
                cuotas: cuotas.filter(c => selectedIds.has(c.Id)),
                formasPago,
                mediosPago,
                total,
                fecha: new Date().toLocaleDateString('es-UY'),
                usuario,
                caja,
            });
            onSuccess();

        } catch (err) {
            showToast(err.response?.data?.error || 'Error al registrar el cobro', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // El armado real del PDF vive en utils/reciboPdf.js (compartido con otros
    // lugares que necesitan imprimir un comprobante, ej. la cuenta corriente
    // del socio). Acá solo se adaptan los datos de este cobro a ese formato.
    const generarPDF = async () => {
        try {
            const { nroDoc, nombreSocio, ci, cuotas, formasPago, mediosPago, total, fecha, usuario, caja } = reciboData;

            await generarReciboPDF({
                nroDoc,
                titulo: 'Recibo de Cobro',
                nombreSocio,
                ci,
                items: cuotas.map((c) => ({
                    periodo: formatAniomes(c.Aniomes),
                    concepto: c.RubroNombre?.trim() || `Rubro ${c.Rubro}`,
                    importe: c.Importe,
                })),
                total,
                fecha,
                meta: `Caja N° ${caja}  ·  Atendido por ${usuario}`,
                formasPago: formasPago.map((fp) => {
                    const mp = mediosPago.find((m) => String(m.IdMedioPago) === String(fp.medioPago));
                    return {
                        descripcion: mp?.Descripcion?.trim() || `Medio ${fp.medioPago}`,
                        importe: fp.importe,
                    };
                }),
                filenamePrefix: 'recibo',
            });
        } catch (err) {
            console.error('Error generando el PDF del recibo:', err);
            showToast('No se pudo generar el PDF del recibo', 'error');
        }
    };

    return (
        <div className={styles.overlay} onClick={handleBackdropClick}>
            <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="cobro-socio-title">
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <span className={styles.iconWrap}>{CobrarIcon}</span>
                        <div>
                            <h3 id="cobro-socio-title" className={styles.title}>Cobrar Cuota a Socio</h3>
                            <p className={styles.stepLabel}>
                                {paso === 'cuotas' ? 'Paso 1 · Buscar socio y seleccionar cuotas' : 'Paso 2 · Forma de pago'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={onClose}
                        disabled={submitting}
                        aria-label="Cerrar"
                    >
                        {CloseIcon}
                    </button>
                </div>

                <div className={styles.body}>
                    {paso === 'cuotas' && (
                        <>
                            <form onSubmit={handleBuscar} className={styles.searchRow}>
                                <div className={styles.searchInputWrap}>
                                    <span className={styles.searchIcon}>{SearchIcon}</span>
                                    <input
                                        type="text"
                                        className={styles.searchInput}
                                        placeholder="Cédula o nombre del socio"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <Button type="submit" variant="soft" loading={searching}>
                                    Buscar
                                </Button>
                            </form>

                            {candidatos && (
                                <div className={styles.candidatos}>
                                    {candidatos.map((c) => (
                                        <button
                                            key={c.SocNro}
                                            type="button"
                                            className={styles.candidatoBtn}
                                            onClick={() => handleElegirCandidato(c)}
                                        >
                                            <span className={styles.candidatoNombre}>{nombreCompleto(c)}</span>
                                            <span className={styles.candidatoMeta}>CI {c.SocDocIde}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {socio && (
                                <>
                                    <div className={styles.socioInfo}>
                                        <span className={styles.socioNombre}>{nombreCompleto(socio)}</span>
                                        <span className={styles.socioMeta}>CI {socio.SocDocIde} · Socio N.° {socio.SocNro}</span>
                                    </div>

                                    {cuotas.length === 0 ? (
                                        <p className={styles.empty}>Este socio no tiene cuotas pendientes.</p>
                                    ) : (
                                        <>
                                            <div className={styles.cuotasList}>
                                                {cuotas.map((c) => (
                                                    <label
                                                        className={`${styles.cuotaRow} ${selectedIds.has(c.Id) ? styles.cuotaRowChecked : ''}`}
                                                        key={c.Id}
                                                        htmlFor={`cuota-${c.Id}`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className={styles.checkbox}
                                                            checked={selectedIds.has(c.Id)}
                                                            onChange={() => toggleCuota(c.Id)}
                                                            id={`cuota-${c.Id}`}
                                                        />
                                                        <span className={styles.cuotaPeriodo}>{formatAniomes(c.Aniomes)}</span>
                                                        <span className={styles.cuotaRubro}>{c.RubroNombre?.trim() || `Rubro ${c.Rubro}`}</span>
                                                        <span className={styles.cuotaImporte}>{formatCurrency(c.Importe)}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            <div className={styles.totalBox}>
                                                <span className={styles.totalLabel}>Total seleccionado</span>
                                                <span className={styles.totalValue}>{formatCurrency(total)}</span>
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
                                <span className={styles.socioNombre}>{nombreCompleto(socio)}</span>
                                <span className={styles.socioMeta}>CI {socio.SocDocIde} · Total a cobrar: {formatCurrency(total)}</span>
                            </div>

                            <div className={styles.formasPagoList}>
                                {formasPago.map((fp, index) => (
                                    <div className={styles.formaPagoRow} key={index}>
                                        <select
                                            className={styles.select}
                                            value={fp.medioPago}
                                            onChange={(e) => handleChangeFormaPago(index, 'medioPago', e.target.value)}
                                            disabled={!!reciboData}
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
                                            className={styles.input}
                                            step="0.01"
                                            min="0"
                                            placeholder="Importe"
                                            value={fp.importe}
                                            onChange={(e) => handleChangeFormaPago(index, 'importe', e.target.value)}
                                            disabled={!!reciboData}
                                        />
                                        {formasPago.length > 1 && !reciboData && (
                                            <button
                                                type="button"
                                                className={styles.removeFormaPagoBtn}
                                                onClick={() => handleQuitarFormaPago(index)}
                                                aria-label="Quitar forma de pago"
                                            >
                                                {RemoveIcon}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {!reciboData && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    icon={PlusIcon}
                                    onClick={handleAgregarFormaPago}
                                >
                                    Agregar otra forma de pago
                                </Button>
                            )}

                            {reciboData ? (
                                <p className={styles.reciboListo}>
                                    Cobro registrado correctamente. Ya podés descargar el recibo.
                                </p>
                            ) : (
                                <div className={`${styles.totalBox} ${Math.abs(restante) >= 0.01 ? styles.totalBoxAlerta : ''}`}>
                                    <span className={styles.totalLabel}>Restante por asignar</span>
                                    <span className={styles.totalValue}>{formatCurrency(restante)}</span>
                                </div>
                            )}
                        </>
                    )}

                    <div className={styles.actions}>
                        {paso === 'cuotas' && (
                            <>
                                <Button type="button" variant="secondary" onClick={onClose}>
                                    Cancelar
                                </Button>
                                {socio && cuotas.length > 0 && (
                                    <Button
                                        type="button"
                                        variant="primary"
                                        onClick={handleIrAFormaPago}
                                        disabled={selectedIds.size === 0}
                                    >
                                        Continuar
                                    </Button>
                                )}
                            </>
                        )}
                        {paso === 'pago' && (
                            reciboData ? (
                                <>
                                    <Button type="button" variant="secondary" onClick={onClose}>
                                        Cerrar
                                    </Button>
                                    <Button type="button" variant="outline" icon={DownloadIcon} onClick={generarPDF}>
                                        Descargar recibo
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button type="button" variant="secondary" icon={BackArrowIcon} onClick={handleVolverACuotas}>
                                        Volver
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="primary"
                                        onClick={handleCobrar}
                                        loading={submitting}
                                        disabled={!formasPagoValidas}
                                    >
                                        Cobrar
                                    </Button>
                                </>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CobroSocioModal;
