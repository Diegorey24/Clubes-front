// Las fechas que devuelve la API son "date-only" (representan un día
// calendario: fecha de nacimiento, fecha de un movimiento, etc.), pero el
// motor de base de datos las serializa como datetime UTC a medianoche
// (ej: "2026-07-15T00:00:00.000Z"). Si se parsean con `new Date(...)` y se
// muestran con `toLocaleDateString()`, el navegador las convierte a la zona
// horaria local y, en zonas horarias negativas (como UY, UTC-3), el día
// se corre uno para atrás (14/7 en vez de 15/7).
//
// Por eso estas fechas nunca deben pasar por el constructor `Date` para
// mostrarse: hay que leer año/mes/día directo del string ISO, sin
// conversión de zona horaria.

/**
 * Formatea una fecha "date-only" que viene de la API como DD/MM/YYYY,
 * sin pasar por conversión de zona horaria.
 * @param {string|null|undefined} fechaIso - ej: "2026-07-15T00:00:00.000Z" o "2026-07-15"
 * @returns {string} "15/07/2026" o "-" si no hay fecha / es inválida
 */
export const formatFecha = (fechaIso) => {
    if (!fechaIso) return '-';
    const datePart = String(fechaIso).slice(0, 10);
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
    if (!match) return '-';
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
};

/**
 * Igual que formatFecha, pero devuelve "YYYY-MM-DD" (útil para <input type="date">).
 * @param {string|null|undefined} fechaIso
 * @returns {string}
 */
export const toInputDate = (fechaIso) => {
    if (!fechaIso) return '';
    const datePart = String(fechaIso).slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : '';
};
