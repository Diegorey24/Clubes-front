import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSocioById, updateSocio, fetchItems } from '../services/api';
import { Button, Title } from '../components/ui';
import styles from './SocioEditPage.module.css';

const BackIcon = (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

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
        SocObserva: '',
        // Datos de padres/responsables (se muestran/editan para todos los socios)
        SocNomPad: '', SocTelPad: '', SocNomMad: '', SocTelMad: '',
        SocAuto1CI: '', SocAuto1: '', SocAuto1Tel: '',
        SocAuto2CI: '', SocAuto2: '', SocAuto2Tel: '',
        SocAuto3CI: '', SocAuto3: '', SocAuto3Tel: '',
    });

    // Copia de los datos originales tal cual quedaron cargados, para poder
    // enviar en el PUT únicamente los campos que el usuario realmente cambió.
    const [originalData, setOriginalData] = useState(null);

    // Lists
    const [categorias, setCategorias] = useState([]);
    const [radios, setRadios] = useState([]);
    const [formasPago, setFormasPago] = useState([]);
    const [nacionalidades, setNacionalidades] = useState([]);

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

                // Los campos de padres/autorizados vienen como char fijo,
                // rellenados con espacios en blanco cuando no tienen dato.
                const trim = (v) => (v || '').toString().trim();

                const normalized = {
                    ...socioData,
                    SocFchNac: formatDate(socioData.SocFchNac),
                    SocFchIng: formatDate(socioData.SocFchIng),
                    SocFchMed: formatDate(socioData.SocFchMed),
                    SocNomPad: trim(socioData.SocNomPad),
                    SocTelPad: trim(socioData.SocTelPad),
                    SocNomMad: trim(socioData.SocNomMad),
                    SocTelMad: trim(socioData.SocTelMad),
                    SocAuto1CI: trim(socioData.SocAuto1CI),
                    SocAuto1: trim(socioData.SocAuto1),
                    SocAuto1Tel: trim(socioData.SocAuto1Tel),
                    SocAuto2CI: trim(socioData.SocAuto2CI),
                    SocAuto2: trim(socioData.SocAuto2),
                    SocAuto2Tel: trim(socioData.SocAuto2Tel),
                    SocAuto3CI: trim(socioData.SocAuto3CI),
                    SocAuto3: trim(socioData.SocAuto3),
                    SocAuto3Tel: trim(socioData.SocAuto3Tel),
                };
                setFormData(normalized);
                setOriginalData(normalized);
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

    // Compara de forma laxa (ignorando null/undefined/'' y diferencias de
    // tipo string vs number) para no marcar como "cambiado" un campo que
    // en realidad quedó igual.
    const valuesDiffer = (a, b) => {
        const normalize = (v) => (v === null || v === undefined ? '' : String(v));
        return normalize(a) !== normalize(b);
    };

    // Campos que el backend espera como número (smallint/int) aunque los
    // <select> del formulario los manejen como string.
    const NUMERIC_FIELDS = ['CatCod', 'RadCod', 'ForPagCod', 'NacCod'];

    const castFieldValue = (key, value) => {
        if (!NUMERIC_FIELDS.includes(key)) return value;
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return Number.isNaN(num) ? value : num;
    };

    const getChangedFields = () => {
        const changed = {};
        Object.keys(formData).forEach((key) => {
            if (valuesDiffer(formData[key], originalData?.[key])) {
                changed[key] = castFieldValue(key, formData[key]);
            }
        });
        return changed;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const changedFields = getChangedFields();
        if (Object.keys(changedFields).length === 0) {
            showToast('No hay cambios para guardar', 'success');
            return;
        }
        setSaving(true);
        try {
            await updateSocio(id, changedFields);
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

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner}></div>
                    <p>Cargando datos del socio...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.pageInner}>
                <button type="button" className={styles.backLink} onClick={() => navigate('/socios')}>
                    {BackIcon}
                    Volver al listado
                </button>

                <div className={styles.container}>
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.title}>
                                {formData.PrimerNombre} {formData.PrimerApellido}
                            </h1>
                            <p className={styles.subtitle}>
                                {formData.SocNro ? `Editando socio N.° ${formData.SocNro}` : 'Editando datos del socio'}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className={styles.content}>
                            <div className={styles.section}>
                                <Title variant="section">Información personal</Title>
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
                            </div>

                            <div className={styles.section}>
                                <Title
                                    variant="section"
                                    subtitle="Completá estos datos si están disponibles."
                                >
                                    Datos de los Padres/Responsables
                                </Title>
                                <div className={styles.grid}>
                                    <div className={styles.formGroup}>
                                        <label>Nombre del Padre</label>
                                        <input name="SocNomPad" value={formData.SocNomPad || ''} onChange={handleChange} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Teléfono del Padre</label>
                                        <input name="SocTelPad" value={formData.SocTelPad || ''} onChange={handleChange} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Nombre de la Madre</label>
                                        <input name="SocNomMad" value={formData.SocNomMad || ''} onChange={handleChange} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Teléfono de la Madre</label>
                                        <input name="SocTelMad" value={formData.SocTelMad || ''} onChange={handleChange} />
                                    </div>
                                </div>

                                <p className={styles.autorizadosHint}>Personas autorizadas a retirar al socio</p>

                                <div className={`${styles.grid} ${styles.gridThree}`}>
                                    <div className={styles.formGroup}>
                                        <label>Autorizado 1 · Nombre</label>
                                        <input name="SocAuto1" value={formData.SocAuto1 || ''} onChange={handleChange} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Autorizado 1 · Cédula</label>
                                        <input name="SocAuto1CI" value={formData.SocAuto1CI || ''} onChange={handleChange} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Autorizado 1 · Teléfono</label>
                                        <input name="SocAuto1Tel" value={formData.SocAuto1Tel || ''} onChange={handleChange} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Autorizado 2 · Nombre</label>
                                        <input name="SocAuto2" value={formData.SocAuto2 || ''} onChange={handleChange} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Autorizado 2 · Cédula</label>
                                        <input name="SocAuto2CI" value={formData.SocAuto2CI || ''} onChange={handleChange} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Autorizado 2 · Teléfono</label>
                                        <input name="SocAuto2Tel" value={formData.SocAuto2Tel || ''} onChange={handleChange} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Autorizado 3 · Nombre</label>
                                        <input name="SocAuto3" value={formData.SocAuto3 || ''} onChange={handleChange} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Autorizado 3 · Cédula</label>
                                        <input name="SocAuto3CI" value={formData.SocAuto3CI || ''} onChange={handleChange} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Autorizado 3 · Teléfono</label>
                                        <input name="SocAuto3Tel" value={formData.SocAuto3Tel || ''} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.section}>
                                <Title variant="section">Información de contacto</Title>
                                <div className={styles.grid}>
                                    <div className={`${styles.formGroup} ${styles.formGroupWide}`}>
                                        <label>Domicilio</label>
                                        <input name="SocDom" value={formData.SocDom || ''} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className={`${styles.grid} ${styles.gridThree}`}>
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
                            </div>

                            <div className={styles.section}>
                                <Title variant="section">Membresía</Title>
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
                            </div>

                            <div className={styles.actions}>
                                <Button type="button" variant="secondary" onClick={() => navigate('/socios')}>
                                    Cancelar
                                </Button>
                                <Button type="submit" variant="primary" loading={saving}>
                                    Guardar Cambios
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SocioEditPage;
