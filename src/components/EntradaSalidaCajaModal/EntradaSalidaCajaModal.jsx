import { useState, useEffect } from 'react';
import { crearEntradaCaja, crearSalidaCaja, crearCobranzaEspecial } from '../../services/api';
import styles from './EntradaSalidaCajaModal.module.css';

const TIPO_CONFIG = {
    'Entrada Caja': { titulo: 'Entrada de Caja', accion: crearEntradaCaja },
    'Salida Caja': { titulo: 'Salida de Caja', accion: crearSalidaCaja },
    'Cobranza Especial': { titulo: 'Cobranza Especial', accion: crearCobranzaEspecial },
};

const EntradaSalidaCajaModal = ({ isOpen, tipo, onClose, onSuccess, caja, usuario, showToast }) => {
    const [monto, setMonto] = useState('');
    const [detalle, setDetalle] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setMonto('');
            setDetalle('');
        }
    }, [isOpen, tipo]);

    if (!isOpen) return null;

    const { titulo, accion } = TIPO_CONFIG[tipo] || {};

    const handleSubmit = async (e) => {
        e.preventDefault();
        const montoNum = parseFloat(monto);
        if (!montoNum || montoNum <= 0) {
            showToast('Ingrese un monto válido', 'error');
            return;
        }
        if (!detalle.trim()) {
            showToast('Ingrese un detalle', 'error');
            return;
        }

        setSaving(true);
        try {
            await accion({ caja, usuario, monto: montoNum, detalle: detalle.trim() });
            showToast(`${titulo} registrada correctamente`, 'success');
            onSuccess();
        } catch (err) {
            showToast(err.response?.data?.error || `Error al registrar ${titulo.toLowerCase()}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{titulo}</h3>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="monto">Monto</label>
                        <input
                            type="number"
                            id="monto"
                            value={monto}
                            onChange={(e) => setMonto(e.target.value)}
                            min="0"
                            step="0.01"
                            required
                            autoFocus
                            placeholder="0.00"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="detalle">Detalle</label>
                        <input
                            type="text"
                            id="detalle"
                            value={detalle}
                            onChange={(e) => setDetalle(e.target.value)}
                            required
                            placeholder="Motivo del movimiento"
                        />
                    </div>
                    <div className={styles.actions}>
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Guardando...' : 'Registrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EntradaSalidaCajaModal;
