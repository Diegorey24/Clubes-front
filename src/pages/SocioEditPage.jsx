import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSocioById, updateSocio, fetchItems } from '../services/api';
import styles from './SocioEditPage.module.css';

const SocioEditPage = ({ showToast }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        PrimerNombre: '', SegundoNombre: '', PrimerApellido: '', SegundoApellido: '',
        SocFchNac: '', SocDocIde: '', SocSex: 'M', NacCod: '',
        SocDom: '', SocEMail: '', SocTel: '', SocTelCel: '', ResponsableDomicilio: '',
        SocFchIng: '', CatCod: '', ForPagCod: '', RadCod: '', SocFchMed: '',
        SocObserva: ''
    });

    // Lists
    const [categorias, setCategorias] = useState([]);
    const [radios, setRadios] = useState([]);
    const [formasPago, setFormasPago] = useState([]);
    const [nacionalidades, setNacionalidades] = useState([]);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const [socioData, catsData, radiosData, formasData, nacData] = await Promise.all([
                getSocioById(id),
                fetchItems('categoriaSocios'),
                fetchItems('radios'),
                fetchItems('formapago'),
                fetchItems('nacionalidades')
            ]);

            setCategorias(Array.isArray(catsData) ? catsData : []);
            setRadios(Array.isArray(radiosData) ? radiosData : []);
            setFormasPago(Array.isArray(formasData) ? formasData : []);
            setNacionalidades(Array.isArray(nacData) ? nacData : []);

            if (socioData) {
                // Format dates for input type="date"
                const formatDate = (dateString) => {
                    if (!dateString) return '';
                    return new Date(dateString).toISOString().split('T')[0];
                };

                setFormData({
                    ...socioData,
                    SocFchNac: formatDate(socioData.SocFchNac),
                    SocFchIng: formatDate(socioData.SocFchIng),
                    SocFchMed: formatDate(socioData.SocFchMed)
                });
            }
        } catch (error) {
            console.error('Error loading data:', error);
            showToast('Error al cargar datos', 'error');
            navigate('/socios');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateSocio(id, formData);
            showToast('Socio actualizado correctamente', 'success');
            navigate('/socios');
        } catch (error) {
            console.error('Error updating socio:', error);
            const msg = error.response?.data?.error || 'Error al actualizar socio';
            showToast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2 className={styles.title}>Editar Socio</h2>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>

                <h3 className={styles.sectionTitle}>Información Personal</h3>
                <div className={styles.grid}>
                    <div className={styles.formGroup}>
                        <label>Primer Nombre *</label>
                        <input name="PrimerNombre" value={formData.PrimerNombre} onChange={handleChange} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Segundo Nombre</label>
                        <input name="SegundoNombre" value={formData.SegundoNombre || ''} onChange={handleChange} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Primer Apellido *</label>
                        <input name="PrimerApellido" value={formData.PrimerApellido} onChange={handleChange} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Segundo Apellido</label>
                        <input name="SegundoApellido" value={formData.SegundoApellido || ''} onChange={handleChange} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Cédula *</label>
                        <input name="SocDocIde" value={formData.SocDocIde} onChange={handleChange} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Fecha Nacimiento</label>
                        <input type="date" name="SocFchNac" value={formData.SocFchNac} onChange={handleChange} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Sexo</label>
                        <select name="SocSex" value={formData.SocSex} onChange={handleChange}>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Nacionalidad</label>
                        <select name="NacCod" value={formData.NacCod || ''} onChange={handleChange}>
                            <option value="">Seleccione...</option>
                            {nacionalidades.map(n => <option key={n.NacCod} value={n.NacCod}>{n.NacDsc}</option>)}
                        </select>
                    </div>
                </div>

                <h3 className={styles.sectionTitle}>Contacto</h3>
                <div className={styles.grid}>
                    <div className={styles.formGroup}>
                        <label>Domicilio</label>
                        <input name="SocDom" value={formData.SocDom || ''} onChange={handleChange} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input type="email" name="SocEMail" value={formData.SocEMail || ''} onChange={handleChange} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Teléfono</label>
                        <input name="SocTel" value={formData.SocTel || ''} onChange={handleChange} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Celular</label>
                        <input name="SocTelCel" value={formData.SocTelCel || ''} onChange={handleChange} />
                    </div>
                </div>

                <h3 className={styles.sectionTitle}>Membresía</h3>
                <div className={styles.grid}>
                    <div className={styles.formGroup}>
                        <label>Fecha Ingreso *</label>
                        <input type="date" name="SocFchIng" value={formData.SocFchIng} onChange={handleChange} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Categoría</label>
                        <select name="CatCod" value={formData.CatCod || ''} onChange={handleChange}>
                            <option value="">Seleccione...</option>
                            {categorias.map(c => <option key={c.CatCod} value={c.CatCod}>{c.CatNom}</option>)}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Radio</label>
                        <select name="RadCod" value={formData.RadCod || ''} onChange={handleChange}>
                            <option value="">Seleccione...</option>
                            {radios.map(r => <option key={r.IdRadio} value={r.IdRadio}>{r.Nombre}</option>)}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Forma de Pago</label>
                        <select name="ForPagCod" value={formData.ForPagCod || ''} onChange={handleChange}>
                            <option value="">Seleccione...</option>
                            {formasPago.map(f => <option key={f.IdFormaPago} value={f.IdFormaPago}>{f.Nombre}</option>)}
                        </select>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button type="button" className={styles.cancelButton} onClick={() => navigate('/socios')}>Cancelar</button>
                    <button type="submit" className={styles.saveButton} disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SocioEditPage;
