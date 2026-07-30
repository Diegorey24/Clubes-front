import { useState, useEffect } from 'react';
import { fetchItems, crearCargoMasivo } from '../services/api';
import SeleccionarSociosList from '../components/SeleccionarSociosList/SeleccionarSociosList';
import { nombreCompleto } from '../utils/socioNombre';
import { Button, PageHeader, ConfirmDialog } from '../components/ui';
import styles from './GenerarCargosPage.module.css';

const CheckCircleIcon = (
    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(amount || 0);
};

// La API devuelve fechas como "YYYY-MM-DD" o ISO completo
// ("YYYY-MM-DDT00:00:00.000Z"); en ambos casos alcanza con la parte de
// fecha para mostrarla en formato local.
const formatDate = (value) => {
    if (!value) return '-';
    const soloFecha = value.split('T')[0];
    const [y, m, d] = soloFecha.split('-');
    return `${d}/${m}/${y}`;
};

// omitidos: la forma exacta todavía no está definida del lado del backend
// (puede venir como lista de CIs, o de objetos con motivo). Se cubre
// cualquiera de las dos para no romper el resumen.
const describirOmitido = (om) => {
    if (om && typeof om === 'object') {
        const ci = om.CI ?? om.ci ?? '';
        const motivo = om.motivo ?? om.Motivo ?? om.error ?? '';
        return [ci && `CI ${ci}`, motivo].filter(Boolean).join(' — ') || JSON.stringify(om);
    }
    return `CI ${om}`;
};

// Rubro reservado para la cuota social (lo emite el proceso "Generar
// Cuotas"): nunca se ofrece acá, así se evita duplicar cuotas o generarlas
// con importe fijo cuando en realidad depende de la categoría de cada
// socio.
const ID_RUBRO_CUOTA = 1;

// A partir del input type="month" (AAAA-MM) calcula los dos formatos que
// pide la API: Mes (fecha, primer día del mes) y Aniomes (AAAAMM
// numérico). La fecha de vencimiento no la calcula el front -- la resuelve
// la API a partir del mes.
const derivarPeriodo = (mesAnio) => {
    const [y, m] = mesAnio.split('-').map(Number);
    const mesFecha = `${mesAnio}-01`;
    const aniomes = y * 100 + m;
    return { mesFecha, aniomes };
};

/**
 * Proceso "Generación de Cargos": crea un mismo cargo (rubro + mes) para
 * un conjunto de socios elegido a mano -- todos los socios, o los de una
 * categoría puntual -- de una sola vez.
 *
 * Flujo: 1) elegir alcance (todos los socios / socios de una categoría),
 * 2) marcar a mano cuáles de esos socios corresponden (buscador + lista
 * paginada con checkbox), 3) elegir rubro y mes, 4) confirmar y emitir.
 *
 * El backend para el alta masiva todavía no existe (ver crearCargoMasivo
 * en services/api.js); esta pantalla ya está armada para consumirlo en
 * cuanto esté disponible.
 */
const GenerarCargosPage = ({ usuario, showToast }) => {
    // '' = todavía no eligió nada (radio sin marcar al inicio).
    const [alcance, setAlcance] = useState('');
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

    const [rubros, setRubros] = useState([]);
    const [rubroSeleccionado, setRubroSeleccionado] = useState('');
    const [mesAnio, setMesAnio] = useState('');

    // Map<SocNro, socio>: qué socios quedaron marcados. Vive acá (no en la
    // lista) para que sobreviva a los cambios de página/búsqueda.
    const [selected, setSelected] = useState(new Map());

    const [formError, setFormError] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [generando, setGenerando] = useState(false);

    // Respuesta de crearCargoMasivo tras generar con éxito. Mientras esté
    // seteado, la pantalla muestra el resumen en vez del formulario --
    // "Generar otro cargo masivo" es lo único que la limpia.
    const [resultado, setResultado] = useState(null);

    useEffect(() => {
        const loadCombos = async () => {
            try {
                const [catsData, rubrosData] = await Promise.all([
                    fetchItems('categoriaSocios'),
                    fetchItems('rubros'),
                ]);
                setCategorias(Array.isArray(catsData) ? catsData : []);
                const rubrosSinCuota = (Array.isArray(rubrosData) ? rubrosData : [])
                    .filter((r) => Number(r.IdRubro) !== ID_RUBRO_CUOTA);
                setRubros(rubrosSinCuota);
            } catch (err) {
                console.error('Error cargando categorías/rubros:', err);
                showToast?.('Error al cargar categorías y rubros', 'error');
            }
        };
        loadCombos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Cambiar el alcance (o la categoría elegida dentro de "por categoría")
    // invalida la selección: los socios marcados correspondían a otro
    // universo y podrían ya ni figurar en la lista nueva.
    const handleAlcanceChange = (value) => {
        setAlcance(value);
        setCategoriaSeleccionada('');
        setSelected(new Map());
        setFormError('');
    };

    const handleCategoriaChange = (value) => {
        setCategoriaSeleccionada(value);
        setSelected(new Map());
        setFormError('');
    };

    const toggleSocio = (socio) => {
        setSelected((prev) => {
            const next = new Map(prev);
            if (next.has(socio.SocNro)) next.delete(socio.SocNro);
            else next.set(socio.SocNro, socio);
            return next;
        });
    };

    const toggleAllVisible = (sociosPagina, marcarTodos) => {
        setSelected((prev) => {
            const next = new Map(prev);
            sociosPagina.forEach((socio) => {
                if (marcarTodos) next.set(socio.SocNro, socio);
                else next.delete(socio.SocNro);
            });
            return next;
        });
    };

    const rubro = rubros.find((r) => String(r.IdRubro) === String(rubroSeleccionado)) || null;
    // El importe sale siempre del rubro, sin excepciones: si el rubro no
    // tiene un importe cargado, no hay de dónde sacarlo y no se puede
    // generar el cargo.
    const rubroSinImporte = rubro && !(Number(rubro.Importe) > 0);

    const handleRubroChange = (value) => {
        setRubroSeleccionado(value);
    };

    const validar = () => {
        if (!alcance) return 'Elegí a quiénes corresponde el cargo: todos los socios o socios de una categoría.';
        if (alcance === 'categoria' && !categoriaSeleccionada) return 'Seleccioná una categoría.';
        if (selected.size === 0) return 'Marcá al menos un socio de la lista.';
        if (!rubroSeleccionado) return 'Seleccioná un rubro.';
        if (rubroSinImporte) return 'El rubro seleccionado no tiene un importe cargado, no se puede generar el cargo.';
        if (!mesAnio) return 'Seleccioná el mes del cargo.';
        if (!usuario?.nombre) return 'No se pudo identificar al usuario logueado.';
        return '';
    };

    const handleSubmitClick = () => {
        const error = validar();
        if (error) {
            setFormError(error);
            return;
        }
        setFormError('');
        setShowConfirm(true);
    };

    const handleConfirmar = async () => {
        const { mesFecha, aniomes } = derivarPeriodo(mesAnio);
        const sociosSeleccionados = Array.from(selected.values());
        // La API no devuelve el nombre del socio en cada item (llega ''),
        // así que se arma acá un CI -> nombre con lo que ya tenemos
        // seleccionado, para poder mostrarlo en el resumen.
        const nombrePorCi = new Map(sociosSeleccionados.map((s) => [Number(s.SocDocIde), nombreCompleto(s)]));

        setGenerando(true);
        try {
            const data = await crearCargoMasivo({
                cis: sociosSeleccionados.map((s) => Number(s.SocDocIde)),
                mes: mesFecha,
                rubro: rubro.IdRubro,
                importe: rubro.Importe,
                aniomes,
                usuario: usuario.nombre,
            });
            showToast?.(`Se generaron ${data?.generados ?? sociosSeleccionados.length} cargos correctamente`, 'success');
            setShowConfirm(false);
            setResultado({ ...data, nombrePorCi, rubroNombre: rubro.Nombre?.trim() });
        } catch (err) {
            console.error('Error al generar los cargos masivos:', err);
            showToast?.(err.response?.data?.error || 'Error al generar los cargos', 'error');
        } finally {
            setGenerando(false);
        }
    };

    // Vuelve la pantalla al estado inicial para armar un nuevo cargo
    // masivo desde cero.
    const resetForm = () => {
        setAlcance('');
        setCategoriaSeleccionada('');
        setRubroSeleccionado('');
        setMesAnio('');
        setSelected(new Map());
        setFormError('');
        setResultado(null);
    };

    if (resultado) {
        return (
            <div className={styles.page}>
                <PageHeader
                    title="Generación de Cargos"
                    subtitle="Emití un mismo cargo para todos los socios, o para los de una categoría puntual"
                />

                <div className={styles.resultCard}>
                    <div className={styles.resultHeader}>
                        <span className={styles.resultIcon}>{CheckCircleIcon}</span>
                        <div>
                            <h3 className={styles.resultTitle}>Cargos generados</h3>
                            <p className={styles.resultSubtitle}>
                                {resultado.rubroNombre} · Vencimiento {formatDate(resultado.fechaVto)}
                            </p>
                        </div>
                    </div>

                    <div className={styles.resultStats}>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Solicitados</span>
                            <span className={styles.statValue}>{resultado.solicitados}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Generados</span>
                            <span className={styles.statValue}>{resultado.generados}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Importe unitario</span>
                            <span className={styles.statValue}>{formatCurrency(resultado.importe)}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Total generado</span>
                            <span className={styles.statValue}>{formatCurrency(resultado.totalImporte)}</span>
                        </div>
                    </div>

                    {resultado.omitidos?.length > 0 && (
                        <div className={styles.omittedBox}>
                            <span className={styles.omittedTitle}>
                                {resultado.omitidos.length} socio{resultado.omitidos.length !== 1 ? 's' : ''} no se incluyeron:
                            </span>
                            <ul className={styles.omittedList}>
                                {resultado.omitidos.map((om, i) => (
                                    <li key={i}>{describirOmitido(om)}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {resultado.items?.length > 0 && (
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Cédula</th>
                                        <th>Nombre</th>
                                        <th>Importe</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resultado.items.map((item) => (
                                        <tr key={item.Id}>
                                            <td>{item.CI}</td>
                                            <td>{item.Nombre?.trim() || resultado.nombrePorCi?.get(Number(item.CI)) || '-'}</td>
                                            <td>{formatCurrency(item.Importe)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className={styles.actions}>
                        <Button variant="primary" onClick={resetForm}>
                            Generar otro cargo masivo
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <PageHeader
                title="Generación de Cargos"
                subtitle="Emití un mismo cargo para todos los socios, o para los de una categoría puntual"
            />

            <div className={styles.card}>
                <div className={styles.section}>
                    <span className={styles.sectionLabel}>1. ¿A quiénes corresponde?</span>
                    <div className={styles.radioGroup}>
                        <label className={styles.radioOption}>
                            <input
                                type="radio"
                                name="alcance"
                                value="todos"
                                checked={alcance === 'todos'}
                                onChange={() => handleAlcanceChange('todos')}
                                disabled={generando}
                            />
                            Todos los socios
                        </label>
                        <label className={styles.radioOption}>
                            <input
                                type="radio"
                                name="alcance"
                                value="categoria"
                                checked={alcance === 'categoria'}
                                onChange={() => handleAlcanceChange('categoria')}
                                disabled={generando}
                            />
                            Socios de una categoría
                        </label>
                    </div>

                    {alcance === 'categoria' && (
                        <select
                            className={styles.select}
                            value={categoriaSeleccionada}
                            onChange={(e) => handleCategoriaChange(e.target.value)}
                            disabled={generando}
                        >
                            <option value="">Seleccioná una categoría...</option>
                            {categorias.map((cat) => (
                                <option key={cat.CatCod} value={cat.CatCod}>{cat.CatNom}</option>
                            ))}
                        </select>
                    )}
                </div>

                {alcance && (alcance === 'todos' || categoriaSeleccionada) && (
                    <div className={styles.section}>
                        <span className={styles.sectionLabel}>2. Marcá los socios a incluir</span>
                        <SeleccionarSociosList
                            categoria={alcance === 'categoria' ? categoriaSeleccionada : ''}
                            selected={selected}
                            onToggle={toggleSocio}
                            onToggleAllVisible={toggleAllVisible}
                            disabled={generando}
                            showToast={showToast}
                        />
                    </div>
                )}

                <div className={styles.section}>
                    <span className={styles.sectionLabel}>3. Rubro y período</span>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label htmlFor="rubro">Rubro</label>
                            <select
                                id="rubro"
                                className={styles.select}
                                value={rubroSeleccionado}
                                onChange={(e) => handleRubroChange(e.target.value)}
                                disabled={generando}
                            >
                                <option value="">Seleccioná un rubro...</option>
                                {rubros.map((r) => (
                                    <option key={r.IdRubro} value={r.IdRubro}>{r.Nombre?.trim()}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="importe">Importe</label>
                            <input
                                type="text"
                                id="importe"
                                className={styles.input}
                                value={rubro ? (Number(rubro.Importe) > 0 ? formatCurrency(rubro.Importe) : 'Sin importe') : '-'}
                                disabled
                            />
                            <span className={styles.hint}>
                                {rubroSinImporte
                                    ? 'Este rubro no tiene importe cargado: no se puede generar el cargo.'
                                    : 'Importe del rubro seleccionado.'}
                            </span>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="mesAnio">Mes</label>
                            <input
                                type="month"
                                id="mesAnio"
                                className={styles.input}
                                value={mesAnio}
                                onChange={(e) => setMesAnio(e.target.value)}
                                disabled={generando}
                            />
                        </div>
                    </div>
                </div>

                {formError && <p className={styles.formError}>{formError}</p>}

                <div className={styles.actions}>
                    <Button variant="primary" onClick={handleSubmitClick} disabled={generando || rubroSinImporte}>
                        Generar Cargos
                    </Button>
                </div>
            </div>

            <ConfirmDialog
                isOpen={showConfirm}
                title="¿Generar los cargos?"
                description={`Se va a crear el cargo de "${rubro?.Nombre?.trim() || ''}" para ${selected.size} socio${selected.size !== 1 ? 's' : ''} en el período ${mesAnio}.`}
                confirmLabel="Sí, generar"
                cancelLabel="Cancelar"
                variant="primary"
                loading={generando}
                onConfirm={handleConfirmar}
                onCancel={() => !generando && setShowConfirm(false)}
            />
        </div>
    );
};

export default GenerarCargosPage;
