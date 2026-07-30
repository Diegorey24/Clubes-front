import { useState, useEffect } from 'react';
import { updateGrupoFamiliar } from '../../services/api';
import { nombreCompleto } from '../../utils/socioNombre';
import { describeGrupoFamiliarConflict } from '../../utils/grupoFamiliarError';
import { Button } from '../ui';
import SocioSearchPicker from '../SocioSearchPicker/SocioSearchPicker';
import styles from './GrupoFamiliarIntegrantesModal.module.css';

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

const RemoveIcon = (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

/**
 * Edita los integrantes de un grupo familiar ya existente. El titular está
 * fijo (viene de `grupo`, no se puede cambiar acá); esto sincroniza la
 * lista completa de integrantes vía PUT /gruposfamiliares/:socDocIde, que
 * no es incremental: hay que mandar siempre la lista completa deseada.
 *
 * El buscador (SocioSearchPicker) solo ofrece socios sin grupo familiar
 * todavía, pero el backend igual revalida al guardar: si algún SocNro ya
 * pertenece a otra familia responde 409 con el detalle (ver
 * describeGrupoFamiliarConflict).
 */
const GrupoFamiliarIntegrantesModal = ({ isOpen, onClose, onSuccess, grupo }) => {
    const [integrantes, setIntegrantes] = useState([]);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setIntegrantes(grupo?.integrantes ? [...grupo.integrantes] : []);
        setFormError('');
    }, [isOpen, grupo]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape' && !saving) onClose?.();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, saving]);

    if (!isOpen || !grupo) return null;

    const { titular } = grupo;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !saving) onClose?.();
    };

    const handleAgregar = (socio) => {
        setIntegrantes((prev) => [...prev, socio]);
    };

    const handleQuitar = (socNro) => {
        setIntegrantes((prev) => prev.filter((s) => s.SocNro !== socNro));
    };

    const handleGuardar = async () => {
        setFormError('');
        setSaving(true);
        try {
            await updateGrupoFamiliar(titular.SocDocIde, integrantes.map((s) => s.SocNro));
            await onSuccess?.();
        } catch (err) {
            console.error('Error actualizando integrantes del grupo familiar:', err);
            if (err.response?.status === 409) {
                setFormError(describeGrupoFamiliarConflict(err));
            } else if (err.response?.status === 404) {
                setFormError('Este socio ya no es titular de ningún grupo.');
            } else {
                setFormError('No se pudieron guardar los cambios. Intentá nuevamente.');
            }
        } finally {
            setSaving(false);
        }
    };

    const excludeSocNros = [titular.SocNro, ...integrantes.map((s) => s.SocNro)];

    return (
        <div className={styles.overlay} onClick={handleBackdropClick}>
            <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="editar-integrantes-title">
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <span className={styles.iconWrap}>{FamilyIcon}</span>
                        <h3 id="editar-integrantes-title" className={styles.title}>Editar Integrantes</h3>
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
                    <div className={styles.socioInfo}>
                        <span className={styles.socioNombre}>{nombreCompleto(titular)}</span>
                        <span className={styles.socioMeta}>Titular · CI {titular.SocDocIde}</span>
                    </div>

                    <p className={styles.hint}>
                        Buscá para agregar integrantes o quitá los que ya no correspondan. El titular siempre queda incluido.
                    </p>

                    <SocioSearchPicker
                        onPick={handleAgregar}
                        excludeSocNros={excludeSocNros}
                        placeholder="Buscar integrante por nombre o cédula"
                        autoFocus
                        disabled={saving}
                    />

                    {integrantes.length === 0 ? (
                        <p className={styles.empty}>Este grupo no tiene otros integrantes además del titular.</p>
                    ) : (
                        <div className={styles.chips}>
                            {integrantes.map((s) => (
                                <span className={styles.chip} key={s.SocNro}>
                                    {nombreCompleto(s)}
                                    <button
                                        type="button"
                                        className={styles.chipRemove}
                                        onClick={() => handleQuitar(s.SocNro)}
                                        disabled={saving}
                                        aria-label={`Quitar a ${nombreCompleto(s)}`}
                                    >
                                        {RemoveIcon}
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {formError && <p className={styles.formError}>{formError}</p>}

                    <div className={styles.actions}>
                        <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button type="button" variant="primary" onClick={handleGuardar} loading={saving}>
                            Guardar Cambios
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrupoFamiliarIntegrantesModal;
