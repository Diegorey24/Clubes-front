import { useState, useEffect } from 'react';
import styles from './ParametrosForm.module.css';

const ParametrosForm = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        Reg: '',
        IDSolicitud: '',
        NroOrden: 0,
        NroRemitoS: 0,
        AnioMesCargos: '',
        NombreBase: '',
        CarpetaBackups: '',
        NroRecibo: 0,
        NroOtraCobranza: 0,
        CaminoBancos: '',
        CaminoCont: '',
        TopeCaja: 0,
        CaminoReloj: '',
        TopeSalidaCaja: 0,
        ClaveAutorizaSalida: '',
        ARTICCTDO: '',
        RutaFotos: '',
        ImpresoraCarne: '',
        ImpresoraRecibos: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {/* Sección: Identificación */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Identificación</h3>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label htmlFor="Reg">Registro</label>
                        <input
                            type="number"
                            id="Reg"
                            name="Reg"
                            value={formData.Reg}
                            onChange={handleChange}
                            disabled
                            className={styles.readonly}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="IDSolicitud">ID Solicitud</label>
                        <input
                            type="text"
                            id="IDSolicitud"
                            name="IDSolicitud"
                            value={formData.IDSolicitud}
                            onChange={handleChange}
                            placeholder="ID de solicitud"
                        />
                    </div>
                </div>
            </div>

            {/* Sección: Numeración */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Numeración de Documentos</h3>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label htmlFor="NroOrden">Nro. Orden</label>
                        <input
                            type="number"
                            id="NroOrden"
                            name="NroOrden"
                            value={formData.NroOrden}
                            onChange={handleChange}
                            placeholder="0"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="NroRemitoS">Nro. Remito</label>
                        <input
                            type="number"
                            id="NroRemitoS"
                            name="NroRemitoS"
                            value={formData.NroRemitoS}
                            onChange={handleChange}
                            placeholder="0"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="NroRecibo">Nro. Recibo</label>
                        <input
                            type="number"
                            id="NroRecibo"
                            name="NroRecibo"
                            value={formData.NroRecibo}
                            onChange={handleChange}
                            placeholder="0"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="NroOtraCobranza">Nro. Otra Cobranza</label>
                        <input
                            type="number"
                            id="NroOtraCobranza"
                            name="NroOtraCobranza"
                            value={formData.NroOtraCobranza}
                            onChange={handleChange}
                            placeholder="0"
                        />
                    </div>
                </div>
            </div>

            {/* Sección: Base de Datos */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Base de Datos</h3>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label htmlFor="NombreBase">Nombre Base de Datos</label>
                        <input
                            type="text"
                            id="NombreBase"
                            name="NombreBase"
                            value={formData.NombreBase}
                            onChange={handleChange}
                            placeholder="Nombre de la base de datos"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="CarpetaBackups">Carpeta Backups</label>
                        <input
                            type="text"
                            id="CarpetaBackups"
                            name="CarpetaBackups"
                            value={formData.CarpetaBackups}
                            onChange={handleChange}
                            placeholder="C:\\Backups"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="AnioMesCargos">Año/Mes Cargos</label>
                        <input
                            type="text"
                            id="AnioMesCargos"
                            name="AnioMesCargos"
                            value={formData.AnioMesCargos}
                            onChange={handleChange}
                            placeholder="YYYYMM"
                        />
                    </div>
                </div>
            </div>

            {/* Sección: Rutas de Archivos */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Rutas de Archivos</h3>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label htmlFor="CaminoBancos">Camino Bancos</label>
                        <input
                            type="text"
                            id="CaminoBancos"
                            name="CaminoBancos"
                            value={formData.CaminoBancos}
                            onChange={handleChange}
                            placeholder="C:\\Bancos"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="CaminoCont">Camino Contabilidad</label>
                        <input
                            type="text"
                            id="CaminoCont"
                            name="CaminoCont"
                            value={formData.CaminoCont}
                            onChange={handleChange}
                            placeholder="C:\\Contabilidad"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="CaminoReloj">Camino Reloj</label>
                        <input
                            type="text"
                            id="CaminoReloj"
                            name="CaminoReloj"
                            value={formData.CaminoReloj}
                            onChange={handleChange}
                            placeholder="C:\\Reloj"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="RutaFotos">Ruta Fotos</label>
                        <input
                            type="text"
                            id="RutaFotos"
                            name="RutaFotos"
                            value={formData.RutaFotos}
                            onChange={handleChange}
                            placeholder="C:\\Fotos"
                        />
                    </div>
                </div>
            </div>

            {/* Sección: Configuración de Caja */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Configuración de Caja</h3>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label htmlFor="TopeCaja">Tope Caja</label>
                        <input
                            type="number"
                            step="0.01"
                            id="TopeCaja"
                            name="TopeCaja"
                            value={formData.TopeCaja}
                            onChange={handleChange}
                            placeholder="0.00"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="TopeSalidaCaja">Tope Salida Caja</label>
                        <input
                            type="number"
                            step="0.01"
                            id="TopeSalidaCaja"
                            name="TopeSalidaCaja"
                            value={formData.TopeSalidaCaja}
                            onChange={handleChange}
                            placeholder="0.00"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="ClaveAutorizaSalida">Clave Autoriza Salida</label>
                        <input
                            type="password"
                            id="ClaveAutorizaSalida"
                            name="ClaveAutorizaSalida"
                            value={formData.ClaveAutorizaSalida}
                            onChange={handleChange}
                            placeholder="******"
                        />
                    </div>
                </div>
            </div>

            {/* Sección: Otros */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Otros</h3>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label htmlFor="ARTICCTDO">ARTIC. CTDO</label>
                        <input
                            type="text"
                            id="ARTICCTDO"
                            name="ARTICCTDO"
                            value={formData.ARTICCTDO}
                            onChange={handleChange}
                            placeholder="Artículo contado"
                        />
                    </div>
                </div>
            </div>

            {/* Sección: Impresoras */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Impresoras</h3>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label htmlFor="ImpresoraCarne">Impresora Carné</label>
                        <input
                            type="text"
                            id="ImpresoraCarne"
                            name="ImpresoraCarne"
                            value={formData.ImpresoraCarne}
                            onChange={handleChange}
                            placeholder="Nombre de impresora"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="ImpresoraRecibos">Impresora Recibos</label>
                        <input
                            type="text"
                            id="ImpresoraRecibos"
                            name="ImpresoraRecibos"
                            value={formData.ImpresoraRecibos}
                            onChange={handleChange}
                            placeholder="Nombre de impresora"
                        />
                    </div>
                </div>
            </div>

            {/* Botones de acción */}
            <div className={styles.actions}>
                <button type="button" className={styles.btnCancel} onClick={onCancel}>
                    Cancelar
                </button>
                <button type="submit" className={styles.btnSubmit}>
                    Guardar Cambios
                </button>
            </div>
        </form>
    );
};

export default ParametrosForm;
