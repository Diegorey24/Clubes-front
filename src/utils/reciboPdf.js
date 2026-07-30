import jsPDF from 'jspdf';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(amount || 0);
};

// Carga el logo del cliente (public/cliente.png) como dataURL para poder
// insertarlo en el PDF. Usa BASE_URL para no romperse si la app está
// deployada en una subcarpeta. Si por algo falla (archivo ausente, etc.)
// el comprobante se genera igual, simplemente sin logo.
const cargarLogo = () => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d').drawImage(img, 0, 0);
            resolve({
                dataUrl: canvas.toDataURL('image/png'),
                ratio: img.naturalWidth / img.naturalHeight,
            });
        } catch {
            resolve(null);
        }
    };
    img.onerror = () => resolve(null);
    img.src = `${import.meta.env.BASE_URL}cliente.png`;
});

/**
 * Genera y descarga un PDF de comprobante (recibo de cobro, comprobante de
 * pago de débito automático, etc). Es una única función compartida para no
 * duplicar el armado del documento en cada lugar que necesita imprimir uno.
 *
 * @param {object} data
 * @param {string|number} data.nroDoc - Número a mostrar en el encabezado (N° recibo, N° emisión, etc).
 * @param {string} [data.titulo] - Título del documento (ej. "Recibo de Cobro", "Comprobante de Pago").
 * @param {string} [data.numeroLabel] - Prefijo del número (ej. "N°", "Emisión N°").
 * @param {string} data.nombreSocio
 * @param {string|number} data.ci
 * @param {string} [data.categoriaSocio] - Si se pasa, se muestra debajo del nombre en el recuadro de datos del socio.
 * @param {Array<{periodo: string, concepto: string, importe: number}>} data.items
 * @param {number} data.total
 * @param {string} data.fecha - Ya formateada (ej. "15/07/2026").
 * @param {string} [data.meta] - Línea opcional debajo del encabezado (ej. "Caja N° 1 · Atendido por Juan").
 * @param {Array<{descripcion: string, importe: number}>} [data.formasPago] - Si se omite, no se muestra la sección.
 * @param {string} [data.filenamePrefix] - Prefijo del archivo descargado (se usa junto con nroDoc si no se pasa nombreArchivo).
 * @param {string} [data.nombreArchivo] - Nombre completo del archivo (sin ".pdf"). Si se pasa, tiene prioridad sobre filenamePrefix.
 */
export const generarReciboPDF = async ({
    nroDoc,
    titulo = 'Recibo de Cobro',
    numeroLabel = 'N°',
    nombreSocio,
    ci,
    categoriaSocio = '',
    items = [],
    total,
    fecha,
    meta = '',
    formasPago = null,
    filenamePrefix = 'recibo',
    nombreArchivo = '',
}) => {
    const doc = new jsPDF();

    const PAGE_WIDTH = 210;
    const PAGE_HEIGHT = 297;
    const MARGIN = 20;
    const RIGHT = PAGE_WIDTH - MARGIN;

    // Paleta neutra: sin color de marca, todo en escala de grises.
    const dark = [31, 41, 55];
    const muted = [107, 114, 128];
    const bandFill = [237, 238, 240];
    const rowAltFill = [247, 248, 249];
    const borderColor = [214, 217, 222];

    const logo = await cargarLogo();

    // El logo del cliente ocupa siempre un 30% del ancho de la hoja (se ve
    // grande y prolijo sin importar el tamaño original del archivo). La
    // banda y el resto del encabezado se acomodan según la altura real que
    // le corresponda a ese ancho.
    let logoWidth = 0;
    let logoHeight = 0;
    if (logo) {
        logoWidth = PAGE_WIDTH * 0.3;
        logoHeight = logoWidth / logo.ratio;
    }

    // ---------- Encabezado (banda fina, gris claro) ----------
    const headerPadding = 8;
    const bandHeight = logo ? Math.max(26, logoHeight + headerPadding * 2) : 26;
    doc.setFillColor(...bandFill);
    doc.rect(0, 0, PAGE_WIDTH, bandHeight, 'F');

    if (logo) {
        doc.addImage(logo.dataUrl, 'PNG', MARGIN, (bandHeight - logoHeight) / 2, logoWidth, logoHeight);
    }

    doc.setTextColor(...dark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(titulo, RIGHT, bandHeight / 2 - 2, { align: 'right' });
    doc.setTextColor(...muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`${numeroLabel} ${nroDoc}  ·  ${fecha}`, RIGHT, bandHeight / 2 + 5, { align: 'right' });

    // ---------- Meta opcional (caja / usuario / etc) ----------
    let y = bandHeight + 8;
    if (meta) {
        doc.setTextColor(...muted);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(meta, MARGIN, y);
        y += 5;
    }

    // ---------- Datos del socio ----------
    const categoria = (categoriaSocio || '').trim();
    const socioBoxHeight = categoria ? 24 : 18;
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.setFillColor(...rowAltFill);
    doc.roundedRect(MARGIN, y, RIGHT - MARGIN, socioBoxHeight, 2, 2, 'FD');
    doc.setTextColor(...muted);
    doc.setFontSize(8);
    doc.text('SOCIO', MARGIN + 6, y + 8);
    doc.setTextColor(...dark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(nombreSocio || '-', MARGIN + 6, y + 14.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`CI ${ci}`, RIGHT - 6, y + 14.5, { align: 'right' });
    if (categoria) {
        doc.setTextColor(...muted);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.text(categoria, MARGIN + 6, y + 20.5);
    }
    y += socioBoxHeight + 11;

    // ---------- Tabla de conceptos ----------
    const rowHeight = 9;
    const drawTablaHeader = (yPos) => {
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.3);
        doc.setFillColor(...bandFill);
        doc.rect(MARGIN, yPos, RIGHT - MARGIN, rowHeight, 'FD');
        doc.setTextColor(...dark);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('PERÍODO', MARGIN + 4, yPos + 6);
        doc.text('CONCEPTO', MARGIN + 40, yPos + 6);
        doc.text('IMPORTE', RIGHT - 4, yPos + 6, { align: 'right' });
        return yPos + rowHeight;
    };

    y = drawTablaHeader(y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    items.forEach((item, idx) => {
        if (y + rowHeight > PAGE_HEIGHT - 30) {
            doc.addPage();
            y = drawTablaHeader(20);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9.5);
        }
        if (idx % 2 === 1) {
            doc.setFillColor(...rowAltFill);
            doc.rect(MARGIN, y, RIGHT - MARGIN, rowHeight, 'F');
        }
        doc.setTextColor(...dark);
        doc.text(item.periodo || '-', MARGIN + 4, y + 6);
        doc.text(item.concepto || '-', MARGIN + 40, y + 6);
        doc.text(formatCurrency(item.importe), RIGHT - 4, y + 6, { align: 'right' });
        y += rowHeight;
    });

    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, RIGHT, y);

    // ---------- Total ----------
    y += 3;
    if (y + 11 > PAGE_HEIGHT - 30) {
        doc.addPage();
        y = 20;
    }
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.setFillColor(...bandFill);
    doc.roundedRect(MARGIN, y, RIGHT - MARGIN, 11, 1.5, 1.5, 'FD');
    doc.setTextColor(...dark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL', MARGIN + 5, y + 7.3);
    doc.text(formatCurrency(total), RIGHT - 5, y + 7.3, { align: 'right' });
    y += 20;

    // ---------- Forma de pago (opcional) ----------
    if (formasPago && formasPago.length > 0) {
        if (y + 6 + formasPago.length * 7 > PAGE_HEIGHT - 30) {
            doc.addPage();
            y = 20;
        }
        doc.setTextColor(...muted);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('FORMA DE PAGO', MARGIN, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(...dark);
        formasPago.forEach((fp) => {
            doc.text(fp.descripcion || '-', MARGIN + 2, y);
            doc.text(formatCurrency(fp.importe), RIGHT - 4, y, { align: 'right' });
            y += 7;
        });
    }

    // ---------- Pie de página ----------
    const totalPages = doc.internal.getNumberOfPages();
    for (let page = 1; page <= totalPages; page++) {
        doc.setPage(page);
        const footerY = PAGE_HEIGHT - 18;
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.3);
        doc.line(MARGIN, footerY, RIGHT, footerY);
        doc.setTextColor(...muted);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`${titulo} generado electrónicamente.`, MARGIN, footerY + 6);
        if (totalPages > 1) {
            doc.text(`Página ${page} de ${totalPages}`, RIGHT, footerY + 6, { align: 'right' });
        }
    }

    doc.save(`${nombreArchivo || `${filenamePrefix}_${nroDoc}`}.pdf`);
};
