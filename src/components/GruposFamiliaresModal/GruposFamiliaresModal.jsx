import { useState, useEffect } from 'react';
import { getGrupoFamiliar, createGrupoFamiliar } from '../../services/api';
import { nombreCompleto } from '../../utils/socioNombre';
import { describeGrupoFamiliarConflict } from '../../utils/grupoFamiliarError';
import { Button } from '../ui';
import SocioSearchPicker from '../SocioSearchPicker/SocioSearchPicker';
import styles from './GruposFamiliaresModal.module.css';

const FamilyIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM14.5 9a2 2 0 100-4 2 2 0 000 4zM2.5 16.5c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5a1 1 0 01-1 1H3.5a1 1 0 01-1-1zM12.5 12.35c1.762.372 3.05 1.98 3.05 3.9a1 1 0 01-.083.35H14.5a1 1 0 01-1-1c0-1.212-.395-2.33-1.062-3.24.02-.003.041-.007.062-.01z" />
    </svg>
);

const CloseIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const BackArrowIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const RemoveIcon = (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

/**
 * Alta de un grupo familiar. No existe una tabla propia de grupos: crear
 * uno es, en el fondo, elegir un titular (por su cédula) y una lista de
 * integrantes (por su SocNro) para que el backend les cargue GruFamNro.
 *
 * Paso 1: elegir el titular. Se valida enseguida (GET /gruposfamiliares/:ci)
 * si esa cédula ya es titular de otro grupo, para avisar antes de que el
 * usuario arme toda la lista de integrantes y se encuentre con el error
 * recién al final.
 * Paso 2: elegir los integrantes (además del titular) y confirmar el alta.
 * El buscador de socios (SocioSearchPicker) ya solo ofrece gente sin grupo
 * familiar (GruFamNro = 0), pero el backend igual revalida todo al crear:
 * si algún SocNro enviado ya pertenece a otra familia, responde 409 con el
 * detalle de quiénes son (ver describeGrupoFamiliarConflict), por si hubo
 * un cambio entre que se buscó y se confirmó.
 */
const CrearGrupoFamiliarModal = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState('titular'); // 'titular' | 'integrantes'
    const [titular, setTitular] = useState(null);
    const [checkingTitular, setCheckingTitular] = useState(false);
    const [titularError, setTitularError] = useState('');
    const [integrantes, setIntegrantes] = useState([]);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setStep('titular');
        setTitular(null);
        setCheckingTitular(false);
        setTitularError('');
        setIntegrantes([]);
        setSaving(false);
        setFormError('');
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape' && !saving) onClose?.();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, saving]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !saving) onClose?.();
    };

    const handlePickTitular = async (socio) => {
        setTitular(socio);
        setTitularError('');
        setCheckingTitular(true);
        try {
            // Si esto resuelve sin error, ya existe un grupo con este titular.
            await getGrupoFamiliar(socio.SocDocIde);
            setTitularError('Este socio ya es titular de un grupo familiar. Para modificarlo, entrá a su grupo y editá los integrantes.');
        } catch (err) {
            if (err.response?.status !== 404) {
                console.error('Error verificando si el socio ya es titular:', err);
                setTitularError('No se pudo verificar el socio. Intentá de nuevo.');
            }
            // 404 = no es titular de ningún grupo todavía: todo bien.
        } finally {
            setCheckingTitular(false);
        }
    };

    const handleCambiarTitular = () => {
        setTitular(null);
        setTitularError('');
    };

    const handleContinuar = () => {
        if (!titular || titularError || checkingTitular) return;
        setStep('integrantes');
    };

    const handleVolver = () => {
        setFormError('');
        setStep('titular');
    };

    const handleAgregarIntegrante = (socio) => {
        setIntegrantes((prev) => [...prev, socio]);
    };

    const handleQuitarIntegrante = (socNro) => {
        setIntegrantes((prev) => prev.filter((s) => s.SocNro !== socNro));
    };

    const handleCrear = async () => {
        setFormError('');
        setSaving(true);
        try {
            await createGrupoFamiliar({
                titularSocDocIde: titular.SocDocIde,
                socNros: integrantes.map((s) => s.SocNro),
            });
            await onSuccess?.();
        } catch (err) {
            console.error('Error creando el grupo familiar:', err);
            if (err.response?.status === 409) {
                setFormError(describeGrupoFamiliarConflict(err));
            } else if (err.response?.status === 404) {
                setFormError('No se encontró un socio con esa cédula.');
            } else if (err.response?.status === 400) {
                setFormError('Faltan datos para crear el grupo.');
            } else {
                setFormError('No se pudo crear el grupo familiar. Intentá nuevamente.');
            }
        } finally {
            setSaving(false);
        }
    };

    const excludeSocNros = [
        ...(titular ? [titular.SocNro] : []),
        ...integrantes.map((s) => s.SocNro),
    ];

    return (
        <div className={styles.overlay} onClick={handleBackdropClick}>
            <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="grupo-familiar-modal-title">
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <span className={styles.iconWrap}>{FamilyIcon}</span>
                        <div>
                            <h3 id="grupo-familiar-modal-title" className={styles.title}>Nuevo Grupo Familiar</h3>
                            <p className={styles.stepLabel}>
                                {step === 'titular' ? 'Paso 1 · Elegir titular' : 'Paso 2 · Elegir integrantes'}
                            </p>
                        </div>
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

                <div className={styles.body}>
                    {step === 'titular' && (
                        <>
                            <p className={styles.hint}>
                                Buscá y elegí el socio que va a ser el titular del grupo. Su cédula queda como identificador del grupo.
                            </p>

                            {!titular ? (
                                <SocioSearchPicker onPick={handlePickTitular} autoFocus placeholder="Buscar titular por nombre o cédula" />
                            ) : (
                                <div className={`${styles.socioInfo} ${titularError ? styles.socioInfoError : ''}`}>
                                    <div>
                                        <span className={styles.socioNombre}>{nombreCompleto(titular)}</span>
                                        <span className={styles.socioMeta}>
                                            CI {titular.SocDocIde} · Socio N.° {titular.SocNro}
                                        </span>
                                    </div>
                                    <Button type="button" variant="ghost" size="sm" onClick={handleCambiarTitular} disabled={checkingTitular}>
                                        Cambiar
                                    </Button>
                                </div>
                            )}

                            {checkingTitular && <p className={styles.checking}>Verificando...</p>}
                            {titularError && <p className={styles.formError}>{titularError}</p>}
                        </>
                    )}

                    {step === 'integrantes' && (
                        <>
                            <div className={styles.socioInfo}>
                                <div>
                                    <span className={styles.socioNombre}>{nombreCompleto(titular)}</span>
                                    <span className={styles.socioMeta}>Titular · CI {titular.SocDocIde}</span>
                                </div>
                            </div>

                            <p className={styles.hint}>Buscá y agregá los demás integrantes del grupo (el titular ya queda incluido).</p>

                            <SocioSearchPicker
                                onPick={handleAgregarIntegrante}
                                excludeSocNros={excludeSocNros}
                                placeholder="Buscar integrante por nombre o cédula"
                            />

                            {integrantes.length === 0 ? (
                                <p className={styles.empty}>Todavía no agregaste integrantes.</p>
                            ) : (
                                <div className={styles.chips}>
                                    {integrantes.map((s) => (
                                        <span className={styles.chip} key={s.SocNro}>
                                            {nombreCompleto(s)}
                                            <button
                                                type="button"
                                                className={styles.chipRemove}
                                                onClick={() => handleQuitarIntegrante(s.SocNro)}
                                                aria-label={`Quitar a ${nombreCompleto(s)}`}
                                            >
                                                {RemoveIcon}
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {formError && <p className={styles.formError}>{formError}</p>}
                        </>
                    )}

                    <div className={styles.actions}>
                        {step === 'titular' && (
                            <>
                                <Button type="button" variant="secondary" onClick={onClose}>
                                    Cancelar
                                </Button>
                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={handleContinuar}
                                    disabled={!titular || !!titularError || checkingTitular}
                                >
                                    Continuar
                                </Button>
                            </>
                        )}
                        {step === 'integrantes' && (
                            <>
                                <Button type="button" variant="secondary" icon={BackArrowIcon} onClick={handleVolver} disabled={saving}>
                                    Volver
                                </Button>
                                <Button type="button" variant="primary" onClick={handleCrear} loading={saving}>
                                    Crear Grupo
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrearGrupoFamiliarModal;
