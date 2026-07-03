import { useState } from 'react';
import styles from './GeneracionArchivosPage.module.css';
import { generarArchivo } from '../services/api';
import api from '../services/api';

const FINANCIERAS = [
    { id: 'master', label: 'Master Débito' },
    { id: 'visa', label: 'Visa Débito' },
    { id: 'oca', label: 'OCA Débito' },
    { id: 'abitab', label: 'Abitab' },
    { id: 'redpagos', label: 'Redpagos-Banred' },
];

const GeneracionArchivosPage = ({ showToast }) => {
    const [financieraSeleccionada, setFinancieraSeleccionada] = useState(null);
    const [emision, setEmision] = useState('');
    const [resultado, setResultado] = useState(null);
    const [generando, setGenerando] = useState(false);

    const handleSeleccionar = (id) => {
        setFinancieraSeleccionada(id);
        setResultado(null);
    };

    const handleGenerar = async () => {
        if (!financieraSeleccionada) {
            showToast('Seleccioná una financiera', 'error');
            return;
        }
        if (!emision) {
            showToast('Seleccioná una fecha de emisión', 'error');
            return;
        }

        setGenerando(true);
        setResultado(null);
        try {
            const data = await generarArchivo(financieraSeleccionada, emision);
            setResultado(data);
            showToast('Archivo generado correctamente', 'success');
        } catch (err) {
            console.error('Error al generar archivo:', err);
            showToast('Error al generar el archivo', 'error');
        } finally {
            setGenerando(false);
        }
    };

    const handleDescargar = async () => {
        try {
            const response = await api.get(`/generacion-archivos/descargar/${financieraSeleccionada}`);
            const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');

            // Si tiene múltiples archivos (Visa)
            if (response.data.archivos) {
                response.data.archivos.forEach(({ nombre, contenido }) => {
                    const blob = new Blob([contenido], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = nombre;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                });
                return;
            }

            // Un solo archivo (Master y el resto)
            const blob = new Blob([response.data], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${financieraSeleccionada.toUpperCase()}_${fecha}.txt`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error('Error al descargar archivo:', err);
            showToast('Error al descargar el archivo', 'error');
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Generación de Archivos</h2>
                    <p className={styles.subtitle}>
                        Seleccioná la financiera y la fecha de emisión para generar el archivo de envío.
                    </p>
                </div>

                <div className={styles.card}>
                    <p className={styles.sectionLabel}>1. Seleccioná la financiera</p>
                    <div className={styles.financieras}>
                        {FINANCIERAS.map((f) => (
                            <button
                                key={f.id}
                                className={`${styles.financieraBtn} ${financieraSeleccionada === f.id ? styles.selected : ''}`}
                                onClick={() => handleSeleccionar(f.id)}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <p className={styles.sectionLabel}>2. Fecha de emisión</p>
                    <input
                        className={styles.input}
                        type="date"
                        value={emision}
                        onChange={(e) => setEmision(e.target.value)}
                    />

                    <button
                        className={styles.btnPrimary}
                        onClick={handleGenerar}
                        disabled={generando || !financieraSeleccionada || !emision}
                    >
                        {generando ? 'Generando...' : 'Generar Archivo'}
                    </button>
                    {resultado && (
                        <div className={styles.resultado}>
                            <p>Archivo generado para <strong>{resultado.financiera.toUpperCase()}</strong>.</p>
                            {resultado.codigoComercio && (
                                <p>Código de comercio: <strong>{resultado.codigoComercio}</strong></p>
                            )}
                            <p>Registros: <strong>{resultado.registros}</strong></p>
                            <p>Importe total: <strong>{resultado.importe}</strong></p>
                            <button className={styles.btnDescargar} onClick={handleDescargar}>
                                Descargar .txt
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GeneracionArchivosPage;