import { useState, useEffect } from 'react';
import styles from './CategoriasSociosModal.module.css';

const CategoriasSociosModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        CatCod: '', // Assuming manual entry for Code if generic, or read-only if it shouldn't change
        CatNom: '',
        GrpCatCod: '',
        CatFlgEmi: '',
        CatAniIni: 0,
        CatAniFin: 0,
        CatAcuGrp: '',
        CatApliDto: '',
        CatTieAct: 0,
        CatPrc: 0,
        Importe3: 0,
        Importe4: 0,
        Importe5: 0,
        Importe6: 0,
        Importe7: 0,
        Activa: true,
        EsColonia: false
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                CatCod: initialData.CatCod || '',
                CatNom: initialData.CatNom?.trim() || '',
                GrpCatCod: initialData.GrpCatCod || '',
                CatFlgEmi: initialData.CatFlgEmi || '',
                CatAniIni: initialData.CatAniIni || 0,
                CatAniFin: initialData.CatAniFin || 0,
                CatAcuGrp: initialData.CatAcuGrp || '',
                CatApliDto: initialData.CatApliDto || '',
                CatTieAct: initialData.CatTieAct || 0,
                CatPrc: initialData.CatPrc || 0,
                Importe3: initialData.Importe3 || 0,
                Importe4: initialData.Importe4 || 0,
                Importe5: initialData.Importe5 || 0,
                Importe6: initialData.Importe6 || 0,
                Importe7: initialData.Importe7 || 0,
                Activa: initialData.Activa ?? true,
                EsColonia: initialData.EsColonia ?? false
            });
        } else {
            setFormData({
                CatCod: '',
                CatNom: '',
                GrpCatCod: '',
                CatFlgEmi: '',
                CatAniIni: 0,
                CatAniFin: 0,
                CatAcuGrp: '',
                CatApliDto: '',
                CatTieAct: 0,
                CatPrc: 0,
                Importe3: 0,
                Importe4: 0,
                Importe5: 0,
                Importe6: 0,
                Importe7: 0,
                Activa: true,
                EsColonia: false
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.CatNom.trim()) {
            alert('El nombre es requerido');
            return;
        }
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3 className={styles.title}>
                        {initialData ? 'Editar Categoría' : 'Nueva Categoría'}
                    </h3>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGrid}>
                        {/* Primary Info */}
                        <div className={styles.formGroup}>
                            <label htmlFor="CatCod">Código</label>
                            <input
                                type="number"
                                id="CatCod"
                                name="CatCod"
                                value={formData.CatCod}
                                onChange={handleChange}
                                placeholder="Auto/Man"
                                disabled={!!initialData} // Disable code editing on update
                            />
                        </div>

                        <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                            <label htmlFor="CatNom">Nombre <span className={styles.required}>*</span></label>
                            <input
                                type="text"
                                id="CatNom"
                                name="CatNom"
                                value={formData.CatNom}
                                onChange={handleChange}
                                required
                                placeholder="Nombre de la categoría"
                            />
                        </div>

                        {/* Grouping & Config */}
                        <div className={styles.formGroup}>
                            <label htmlFor="GrpCatCod">GrpCatCod</label>
                            <input
                                type="number"
                                id="GrpCatCod"
                                name="GrpCatCod"
                                value={formData.GrpCatCod}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="CatFlgEmi">CatFlgEmi</label>
                            <input
                                type="text"
                                id="CatFlgEmi"
                                name="CatFlgEmi"
                                value={formData.CatFlgEmi}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="CatAcuGrp">CatAcuGrp</label>
                            <input
                                type="text"
                                id="CatAcuGrp"
                                name="CatAcuGrp"
                                value={formData.CatAcuGrp}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Numeric Configs */}
                        <div className={styles.formGroup}>
                            <label htmlFor="CatAniIni">Año Inicial</label>
                            <input type="number" name="CatAniIni" value={formData.CatAniIni} onChange={handleChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="CatAniFin">Año Final</label>
                            <input type="number" name="CatAniFin" value={formData.CatAniFin} onChange={handleChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="CatTieAct">CatTieAct</label>
                            <input type="number" name="CatTieAct" value={formData.CatTieAct} onChange={handleChange} />
                        </div>

                        {/* Importes */}
                        <div className={styles.formGroup}>
                            <label htmlFor="Importe3">Importe 3</label>
                            <input type="number" name="Importe3" value={formData.Importe3} onChange={handleChange} placeholder="0.00" step="0.01" />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="Importe4">Importe 4</label>
                            <input type="number" name="Importe4" value={formData.Importe4} onChange={handleChange} placeholder="0.00" step="0.01" />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="Importe5">Importe 5</label>
                            <input type="number" name="Importe5" value={formData.Importe5} onChange={handleChange} placeholder="0.00" step="0.01" />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="Importe6">Importe 6</label>
                            <input type="number" name="Importe6" value={formData.Importe6} onChange={handleChange} placeholder="0.00" step="0.01" />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="Importe7">Importe 7</label>
                            <input type="number" name="Importe7" value={formData.Importe7} onChange={handleChange} placeholder="0.00" step="0.01" />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="CatPrc">CatPrc</label>
                            <input type="number" name="CatPrc" value={formData.CatPrc} onChange={handleChange} placeholder="0.00" step="0.01" />
                        </div>

                        {/* Checkboxes */}
                        <div className={`${styles.formGroup} ${styles.checkboxGroup}`} style={{ gridColumn: '1 / -1' }}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="Activa"
                                    checked={formData.Activa}
                                    onChange={handleChange}
                                />
                                Activa
                            </label>

                            <label style={{ marginLeft: '1rem' }}>
                                <input
                                    type="checkbox"
                                    name="EsColonia"
                                    checked={formData.EsColonia}
                                    onChange={handleChange}
                                />
                                Es Colonia
                            </label>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button type="button" className={styles.btnCancel} onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.btnSubmit}>
                            {initialData ? 'Actualizar' : 'Crear'} Categoría
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoriasSociosModal;
