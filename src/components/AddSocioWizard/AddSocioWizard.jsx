import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkCedula, fetchItems } from '../../services/api';
import { ConfirmDialog } from '../ui';
import styles from './AddSocioWizard.module.css';

const AddSocioWizard = ({ onSubmit, showToast }) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isValidatingCedula, setIsValidatingCedula] = useState(false);
    const [cedulaValidated, setCedulaValidated] = useState(false);
    const [categorias, setCategorias] = useState([]);
    const [radios, setRadios] = useState([]);
    const [nacionalidades, setNacionalidades] = useState([]);
    const [mostrarSegundoAutorizado, setMostrarSegundoAutorizado] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const [formData, setFormData] = useState({
        // Step 1
        SocDocIde: '',
        // Step 2
        PrimerNombre: '',
        SegundoNombre: '',
        PrimerApellido: '',
        SegundoApellido: '',
        SocFchNac: '',
        SocSex: '',
        NacCod: '',
        // Step 3
        SocDom: '',
        SocEMail: '',
        SocTel: '',
        SocTelCel: '',
        // Step 4
        SocFchIng: new Date().toISOString().split('T')[0],
        CatCod: '',
        ForPagCod: 1, // Forma de pago fija: ya no se pregunta en el wizard.
        RadCod: '',
        SocFchMed: '',
        // Step 5 (opcionales: familiares y responsables autorizados)
        SocNomPad: '',
        SocTelPad: '',
        SocNomMad: '',
        SocTelMad: '',
        SocAuto1CI: '',
        SocAuto1: '',
        SocAuto1Tel: '',
        SocAuto2CI: '',
        SocAuto2: '',
        SocAuto2Tel: '',
        // Step 6
        SocEmeMov: '',
        SocObserva: ''
    });

    const totalSteps = 6;

    useEffect(() => {
        const loadData = async () => {
            try {
                const [catsData, radiosData, nacData] = await Promise.all([
                    fetchItems('categoriaSocios'),
                    fetchItems('radios'),
                    fetchItems('nacionalidades')
                ]);
                setCategorias(Array.isArray(catsData) ? catsData : []);
                setRadios(Array.isArray(radiosData) ? radiosData : []);
                setNacionalidades(Array.isArray(nacData) ? nacData : []);
            } catch (error) {
                console.error('Error loading initial data:', error);
                showToast('Error al cargar listas de datos', 'error');
            }
        };
        loadData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Nombres y apellidos (del socio, padres y responsables autorizados) se
    // guardan y muestran en mayúsculas.
    const handleUppercaseChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value.toUpperCase()
        }));
    };

    const handleQuitarSegundoAutorizado = () => {
        setFormData(prev => ({
            ...prev,
            SocAuto2CI: '',
            SocAuto2: '',
            SocAuto2Tel: ''
        }));
        setMostrarSegundoAutorizado(false);
    };

    const validateCedula = async () => {
        if (!formData.SocDocIde.trim()) {
            showToast('Por favor ingrese una cédula', 'error');
            return;
        }

        setIsValidatingCedula(true);
        try {
            const data = await checkCedula(formData.SocDocIde);

            if (data.exists) {
                showToast('Esta cédula ya existe en el sistema', 'error');
                setCedulaValidated(false);
            } else {
                // Success: auto-advance without toast to avoid spam
                setCedulaValidated(true);
                // Small delay to show the green checkmark before moving
                setTimeout(() => {
                    setCurrentStep(prev => prev + 1);
                }, 1000);
            }
        } catch (error) {
            console.error('Error validating cedula:', error);
            showToast('Error al validar la cédula', 'error');
        } finally {
            setIsValidatingCedula(false);
        }
    };

    const validateStep = () => {
        switch (currentStep) {
            case 1:
                return cedulaValidated;
            case 2:
                return formData.PrimerNombre && formData.PrimerApellido &&
                    formData.SocFchNac && formData.SocSex;
            case 3:
                return formData.SocDom;
            case 4:
                return formData.SocFchIng && formData.CatCod;
            case 5:
                return true;
            case 6:
                return true;
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (currentStep === 1 && !cedulaValidated) {
            validateCedula();
            return;
        }

        if (!validateStep()) {
            showToast('Por favor complete los campos requeridos', 'error');
            return;
        }

        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // If not on the last step, treat Enter key/Submit as "Next"
        if (currentStep < totalSteps) {
            nextStep();
            return;
        }

        if (!validateStep()) {
            showToast('Por favor complete los campos requeridos', 'error');
            return;
        }

        await onSubmit(formData);
    };

    const handleCancel = () => {
        setShowCancelConfirm(true);
    };

    const confirmCancel = () => {
        setShowCancelConfirm(false);
        navigate('/');
    };

    return (
        <div className={styles.wizard}>
            <div className={styles.wizardHeader}>
                <h2 className={styles.title}>Agregar Nuevo Socio</h2>
                <div className={styles.stepIndicator}>
                    {[1, 2, 3, 4, 5, 6].map(step => (
                        <div key={step} className={styles.stepWrapper}>
                            <div
                                className={`${styles.step} ${step === currentStep ? styles.active : ''
                                    } ${step < currentStep ? styles.completed : ''}`}
                            >
                                {step < currentStep ? (
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    step
                                )}
                            </div>
                            {step < totalSteps && <div className={styles.stepLine} />}
                        </div>
                    ))}
                </div>
                <div className={styles.stepTitle}>
                    {currentStep === 1 && 'Validación de Cédula'}
                    {currentStep === 2 && 'Información Personal'}
                    {currentStep === 3 && 'Información de Contacto'}
                    {currentStep === 4 && 'Detalles de Membresía'}
                    {currentStep === 5 && 'Familiares y Responsables Autorizados'}
                    {currentStep === 6 && 'Información Adicional'}
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                onKeyDown={(e) => {
                    // Sin esto, al presionar Enter dentro de cualquier input
                    // el navegador dispara el submit implícito del form: en
                    // el último paso eso crea el socio sin que el usuario
                    // haya tocado "Crear Socio". Interceptamos Enter acá y lo
                    // tratamos como "Siguiente" en los pasos intermedios, y
                    // lo ignoramos en el último paso (requiere click
                    // explícito). Los textarea quedan afuera para no romper
                    // el salto de línea. e.defaultPrevented evita duplicar
                    // la validación de cédula del paso 1, que ya maneja su
                    // propio Enter.
                    if (e.key !== 'Enter' || e.target.tagName === 'TEXTAREA' || e.defaultPrevented) return;
                    e.preventDefault();
                    if (currentStep < totalSteps) {
                        nextStep();
                    }
                }}
                className={styles.form}
            >
                {/* Step 1: Cedula Validation */}
                {currentStep === 1 && (
                    <div className={styles.stepContent}>
                        <div className={styles.formGroup}>
                            <label htmlFor="SocDocIde">
                                Cédula de Identidad <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                id="SocDocIde"
                                name="SocDocIde"
                                value={formData.SocDocIde}
                                onChange={handleInputChange}
                                placeholder="Ingrese la cédula y presione Enter"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        validateCedula();
                                    }
                                }}
                                disabled={cedulaValidated}
                                className={cedulaValidated ? styles.validated : ''}
                            />
                            {cedulaValidated && (
                                <div className={styles.validationSuccess}>
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Cédula validada correctamente</span>
                                </div>
                            )}
                        </div>
                        <p className={styles.stepDescription}>
                            Ingrese la cédula del socio. El sistema verificará que no exista en los registros actuales o históricos.
                        </p>
                    </div>
                )}

                {/* Step 2: Personal Information */}
                {currentStep === 2 && (
                    <div className={styles.stepContent}>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="PrimerNombre">
                                    Primer Nombre <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    id="PrimerNombre"
                                    name="PrimerNombre"
                                    value={formData.PrimerNombre}
                                    onChange={handleUppercaseChange}
                                    placeholder="Ej: JUAN"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="SegundoNombre">Segundo Nombre</label>
                                <input
                                    type="text"
                                    id="SegundoNombre"
                                    name="SegundoNombre"
                                    value={formData.SegundoNombre}
                                    onChange={handleUppercaseChange}
                                    placeholder="Ej: CARLOS"
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="PrimerApellido">
                                    Primer Apellido <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    id="PrimerApellido"
                                    name="PrimerApellido"
                                    value={formData.PrimerApellido}
                                    onChange={handleUppercaseChange}
                                    placeholder="Ej: PÉREZ"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="SegundoApellido">Segundo Apellido</label>
                                <input
                                    type="text"
                                    id="SegundoApellido"
                                    name="SegundoApellido"
                                    value={formData.SegundoApellido}
                                    onChange={handleUppercaseChange}
                                    placeholder="Ej: GONZÁLEZ"
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="SocFchNac">
                                    Fecha de Nacimiento <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="date"
                                    id="SocFchNac"
                                    name="SocFchNac"
                                    value={formData.SocFchNac}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="SocSex">
                                    Sexo <span className={styles.required}>*</span>
                                </label>
                                <select
                                    id="SocSex"
                                    name="SocSex"
                                    value={formData.SocSex}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="NacCod">Nacionalidad</label>
                            <select
                                id="NacCod"
                                name="NacCod"
                                value={formData.NacCod}
                                onChange={handleInputChange}
                            >
                                <option value="">Seleccione Nacionalidad...</option>
                                {nacionalidades.map(nac => (
                                    <option key={nac.NacCod} value={nac.NacCod}>
                                        {nac.NacDsc}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Step 3: Contact Information */}
                {currentStep === 3 && (
                    <div className={styles.stepContent}>
                        <div className={styles.formGroup}>
                            <label htmlFor="SocDom">
                                Domicilio <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                id="SocDom"
                                name="SocDom"
                                value={formData.SocDom}
                                onChange={handleInputChange}
                                placeholder="Dirección completa"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="SocEMail">Email</label>
                            <input
                                type="email"
                                id="SocEMail"
                                name="SocEMail"
                                value={formData.SocEMail}
                                onChange={handleInputChange}
                                placeholder="correo@ejemplo.com"
                            />
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="SocTel">Teléfono Fijo</label>
                                <input
                                    type="tel"
                                    id="SocTel"
                                    name="SocTel"
                                    value={formData.SocTel}
                                    onChange={handleInputChange}
                                    placeholder="Ej: 25605895"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="SocTelCel">Teléfono Celular</label>
                                <input
                                    type="tel"
                                    id="SocTelCel"
                                    name="SocTelCel"
                                    value={formData.SocTelCel}
                                    onChange={handleInputChange}
                                    placeholder="Ej: 099123456"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Membership Details */}
                {currentStep === 4 && (
                    <div className={styles.stepContent}>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="SocFchIng">
                                    Fecha de Ingreso <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="date"
                                    id="SocFchIng"
                                    name="SocFchIng"
                                    value={formData.SocFchIng}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="SocFchMed">Vigencia de la ficha médica</label>
                                <input
                                    type="date"
                                    id="SocFchMed"
                                    name="SocFchMed"
                                    value={formData.SocFchMed}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="CatCod">
                                    Categoría <span className={styles.required}>*</span>
                                </label>
                                <select
                                    id="CatCod"
                                    name="CatCod"
                                    value={formData.CatCod}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Seleccione Categoría...</option>
                                    {categorias.map(cat => (
                                        <option key={cat.CatCod} value={cat.CatCod}>
                                            {cat.CatNom}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="RadCod">Radio</label>
                                <select
                                    id="RadCod"
                                    name="RadCod"
                                    value={formData.RadCod}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Seleccione Radio...</option>
                                    {radios.map(radio => (
                                        <option key={radio.IdRadio} value={radio.IdRadio}>
                                            {radio.Nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5: Familiares y Responsables Autorizados (opcional) */}
                {currentStep === 5 && (
                    <div className={styles.stepContent}>
                        <p className={styles.stepDescription}>
                            Estos datos son opcionales. Completalos si corresponde, por ejemplo para socios menores de edad.
                        </p>

                        <h4 className={styles.sectionTitle}>Padres</h4>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="SocNomPad">Nombre del padre</label>
                                <input
                                    type="text"
                                    id="SocNomPad"
                                    name="SocNomPad"
                                    value={formData.SocNomPad}
                                    onChange={handleUppercaseChange}
                                    placeholder="Nombre completo del padre"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="SocTelPad">Teléfono del padre</label>
                                <input
                                    type="tel"
                                    id="SocTelPad"
                                    name="SocTelPad"
                                    value={formData.SocTelPad}
                                    onChange={handleInputChange}
                                    placeholder="Ej: 099123456"
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="SocNomMad">Nombre de la madre</label>
                                <input
                                    type="text"
                                    id="SocNomMad"
                                    name="SocNomMad"
                                    value={formData.SocNomMad}
                                    onChange={handleUppercaseChange}
                                    placeholder="Nombre completo de la madre"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="SocTelMad">Teléfono de la madre</label>
                                <input
                                    type="tel"
                                    id="SocTelMad"
                                    name="SocTelMad"
                                    value={formData.SocTelMad}
                                    onChange={handleInputChange}
                                    placeholder="Ej: 099123456"
                                />
                            </div>
                        </div>

                        <h4 className={styles.sectionTitle}>Responsable autorizado 1</h4>
                        <div className={styles.formGroup}>
                            <label htmlFor="SocAuto1">Nombre</label>
                            <input
                                type="text"
                                id="SocAuto1"
                                name="SocAuto1"
                                value={formData.SocAuto1}
                                onChange={handleUppercaseChange}
                                placeholder="Nombre completo"
                            />
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="SocAuto1CI">Cédula</label>
                                <input
                                    type="text"
                                    id="SocAuto1CI"
                                    name="SocAuto1CI"
                                    value={formData.SocAuto1CI}
                                    onChange={handleInputChange}
                                    placeholder="Ej: 12345678"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="SocAuto1Tel">Teléfono</label>
                                <input
                                    type="tel"
                                    id="SocAuto1Tel"
                                    name="SocAuto1Tel"
                                    value={formData.SocAuto1Tel}
                                    onChange={handleInputChange}
                                    placeholder="Ej: 099123456"
                                />
                            </div>
                        </div>

                        {mostrarSegundoAutorizado ? (
                            <>
                                <div className={styles.sectionHeaderRow}>
                                    <h4 className={styles.sectionTitle}>Responsable autorizado 2</h4>
                                    <button
                                        type="button"
                                        className={styles.removeLinkButton}
                                        onClick={handleQuitarSegundoAutorizado}
                                    >
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Quitar
                                    </button>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="SocAuto2">Nombre</label>
                                    <input
                                        type="text"
                                        id="SocAuto2"
                                        name="SocAuto2"
                                        value={formData.SocAuto2}
                                        onChange={handleUppercaseChange}
                                        placeholder="Nombre completo"
                                    />
                                </div>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="SocAuto2CI">Cédula</label>
                                        <input
                                            type="text"
                                            id="SocAuto2CI"
                                            name="SocAuto2CI"
                                            value={formData.SocAuto2CI}
                                            onChange={handleInputChange}
                                            placeholder="Ej: 12345678"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="SocAuto2Tel">Teléfono</label>
                                        <input
                                            type="tel"
                                            id="SocAuto2Tel"
                                            name="SocAuto2Tel"
                                            value={formData.SocAuto2Tel}
                                            onChange={handleInputChange}
                                            placeholder="Ej: 099123456"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <button
                                type="button"
                                className={styles.addLinkButton}
                                onClick={() => setMostrarSegundoAutorizado(true)}
                            >
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Agregar otro responsable autorizado
                            </button>
                        )}
                    </div>
                )}

                {/* Step 6: Additional Information */}
                {currentStep === 6 && (
                    <div className={styles.stepContent}>
                        <div className={styles.formGroup}>
                            <label htmlFor="SocEmeMov">Teléfono de Emergencia</label>
                            <input
                                type="tel"
                                id="SocEmeMov"
                                name="SocEmeMov"
                                value={formData.SocEmeMov}
                                onChange={handleInputChange}
                                placeholder="Ej: 099123456"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="SocObserva">Observaciones</label>
                            <textarea
                                id="SocObserva"
                                name="SocObserva"
                                value={formData.SocObserva}
                                onChange={handleInputChange}
                                placeholder="Observaciones adicionales..."
                                rows="5"
                            />
                        </div>

                        <div className={styles.summary}>
                            <h3>Resumen de Datos</h3>
                            <div className={styles.summaryGrid}>
                                <div className={styles.summaryItem}>
                                    <strong>Cédula:</strong>
                                    <span>{formData.SocDocIde}</span>
                                </div>
                                <div className={styles.summaryItem}>
                                    <strong>Nombre:</strong>
                                    <span>{formData.PrimerNombre} {formData.SegundoNombre} {formData.PrimerApellido} {formData.SegundoApellido}</span>
                                </div>
                                <div className={styles.summaryItem}>
                                    <strong>Email:</strong>
                                    <span>{formData.SocEMail}</span>
                                </div>
                                <div className={styles.summaryItem}>
                                    <strong>Fecha de Ingreso:</strong>
                                    <span>{formData.SocFchIng}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={handleCancel}
                    >
                        Cancelar
                    </button>

                    <div className={styles.navigationButtons}>
                        {currentStep > 1 && (
                            <button
                                type="button"
                                className={styles.btnSecondary}
                                onClick={prevStep}
                            >
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Anterior
                            </button>
                        )}

                        {currentStep < totalSteps ? (
                            <button
                                type="button"
                                className={styles.btnPrimary}
                                onClick={nextStep}
                                disabled={currentStep === 1 && isValidatingCedula}
                            >
                                {currentStep === 1 && isValidatingCedula ? 'Validando...' : 'Siguiente'}
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className={styles.btnPrimary}
                            >
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Crear Socio
                            </button>
                        )}
                    </div>
                </div>
            </form>

            <ConfirmDialog
                isOpen={showCancelConfirm}
                title="¿Cancelar alta de socio?"
                description="Se perderán todos los datos ingresados."
                confirmLabel="Sí, cancelar"
                cancelLabel="Seguir completando"
                onConfirm={confirmCancel}
                onCancel={() => setShowCancelConfirm(false)}
            />
        </div>
    );
};

export default AddSocioWizard;
