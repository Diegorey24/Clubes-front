import { PageHeader, BackLink } from '../components/ui';
import styles from './InformePlaceholder.module.css';

const DocIcon = (
    <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

// Informe "Listado de socios y sus deudas, con detalles". Todavía sin
// implementar: por ahora solo existe la page y su ruta para poder linkearla
// desde Utilidades.
const InformeSociosDeudasDetallePage = () => {
    return (
        <div className={styles.page}>
            <BackLink to="/utilidades">Volver a Utilidades</BackLink>

            <PageHeader
                title="Listado de Socios y sus Deudas con Detalles"
                subtitle="Informe en construcción"
            />

            <div className={styles.panel}>
                {DocIcon}
                <p>Este informe todavía no está disponible. Se va a implementar próximamente.</p>
            </div>
        </div>
    );
};

export default InformeSociosDeudasDetallePage;
