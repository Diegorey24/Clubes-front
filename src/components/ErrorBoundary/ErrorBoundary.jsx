import { Component } from 'react';
import styles from './ErrorBoundary.module.css';

/**
 * Red de contención para errores de render que antes no atrapaba nadie:
 * sin esto, cualquier excepción no controlada en cualquier página (por
 * ejemplo el wizard de alta de socio, o cualquier otra pantalla) hacía que
 * React desmontara todo el árbol y el usuario veía la app "cerrarse" a una
 * pantalla en blanco, sin ningún mensaje.
 *
 * Envuelve las rutas en App.jsx. Se resetea automáticamente cuando cambia
 * la ruta (ver `key={location.pathname}` en el uso), así que navegar lejos
 * de la pantalla rota alcanza para recuperarse sin recargar la página.
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('Error no controlado en la interfaz:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className={styles.wrap}>
                    <div className={styles.card}>
                        <h2 className={styles.title}>Algo salió mal en esta pantalla</h2>
                        <p className={styles.description}>
                            Ocurrió un error inesperado. Los datos que ya guardaste no se perdieron.
                            Podés volver al panel principal e intentar de nuevo.
                        </p>
                        <a className={styles.button} href="#/">Volver al panel</a>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
