import axios from 'axios';


const API_BASE_URL =
  window.globalConfig?.API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'https://apis.devmacrosoft.com/CLUBES_API/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generic CRUD operations
export const fetchItems = async (type) => {
  try {
    const response = await api.get(`/${type}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    throw error;
  }
};

export const createItem = async (type, data) => {
  try {
    const response = await api.post(`/${type}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error creating ${type}:`, error);
    throw error;
  }
};

export const updateItem = async (type, id, data) => {
  try {
    // Si no hay ID (como en parametros), no lo agregamos a la URL
    const url = id ? `/${type}/${id}` : `/${type}`;
    const response = await api.put(url, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating ${type}:`, error);
    throw error;
  }
};

export const deleteItem = async (type, id) => {
  try {
    const response = await api.delete(`/${type}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting ${type}:`, error);
    throw error;
  }
};

// Socios-specific operations
export const checkCedula = async (cedula) => {
  try {
    const response = await api.post('/socios/check-cedula', { cedula });
    return response.data;
  } catch (error) {
    console.error('Error checking cedula:', error);
    throw error;
  }
};

export const getSocios = async (page = 1, limit = 10, search = '', categoria = '', radio = '') => {
  try {
    const response = await api.get('/socios', {
      params: { page, limit, search, categoria, radio }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching socios:', error);
    throw error;
  }
};

// Informe "Listado de socios y sus deudas". Paginado igual que getSocios
// ({ items, total, page, limit, totalPages }): el corte se hace en la
// consulta SQL (OFFSET/FETCH) y la deuda se calcula solo para los socios de
// esa página, así que el costo por página es constante aunque haya miles
// de socios. Cada objeto de "items" incluye el detalle de sus movimientos
// pendientes de recibo en DetalleDeuda.
// soloConDeuda: si es true, solo trae socios con al menos un movimiento
// pendiente (NroRecibo = 0). fechaDesde/fechaHasta (YYYY-MM-DD) acotan esos
// movimientos por el campo Mes; combinado con soloConDeuda, solo devuelve
// socios con deuda pendiente dentro de ese rango.
export const getSociosDeudas = async (page = 1, limit = 10, search = '', categoria = '', radio = '', soloConDeuda = false, fechaDesde = '', fechaHasta = '') => {
  try {
    const params = { page, limit, search, categoria, radio };
    if (soloConDeuda) params.soloConDeuda = 'true';
    if (fechaDesde) params.fechaDesde = fechaDesde;
    if (fechaHasta) params.fechaHasta = fechaHasta;

    const response = await api.get('/socios/deudas', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener el listado de socios y sus deudas:', error);
    throw error;
  }
};

// Exporta el listado de socios y sus deudas (una fila por socio). Mismos
// filtros que getSociosDeudas, pero sin paginar: el backend arma el Excel
// completo para el filtro dado.
export const exportSociosDeudas = async (search = '', categoria = '', radio = '', soloConDeuda = false, fechaDesde = '', fechaHasta = '') => {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (categoria) params.append('categoria', categoria);
    if (radio) params.append('radio', radio);
    if (soloConDeuda) params.append('soloConDeuda', 'true');
    if (fechaDesde) params.append('fechaDesde', fechaDesde);
    if (fechaHasta) params.append('fechaHasta', fechaHasta);

    const response = await api.get('/socios/deudas/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error al exportar el listado de socios y sus deudas:', error);
    throw error;
  }
};

// Exporta el detalle de deudas (una fila por movimiento pendiente de
// recibo, DetalleDeuda). Mismos filtros que exportSociosDeudas.
export const exportSociosDeudasDetalle = async (search = '', categoria = '', radio = '', soloConDeuda = false, fechaDesde = '', fechaHasta = '') => {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (categoria) params.append('categoria', categoria);
    if (radio) params.append('radio', radio);
    if (soloConDeuda) params.append('soloConDeuda', 'true');
    if (fechaDesde) params.append('fechaDesde', fechaDesde);
    if (fechaHasta) params.append('fechaHasta', fechaHasta);

    const response = await api.get('/socios/deudas/export-detalle', {
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error al exportar el detalle de deudas:', error);
    throw error;
  }
};

// Total de deuda para el filtro dado (sin paginar, suma de todo el
// resultado filtrado). Mismos filtros que getSociosDeudas salvo
// soloConDeuda, que este endpoint no admite.
export const getSociosDeudasTotal = async (search = '', categoria = '', radio = '', fechaDesde = '', fechaHasta = '') => {
  try {
    const params = { search, categoria, radio };
    if (fechaDesde) params.fechaDesde = fechaDesde;
    if (fechaHasta) params.fechaHasta = fechaHasta;

    const response = await api.get('/socios/deudas/total', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener el total de deudas:', error);
    throw error;
  }
};

// Deuda agrupada por categoría de socio. Mismos filtros que getSociosDeudas
// salvo "categoria": no se admite porque es el campo por el que agrupa.
// Respuesta: { items: [{ CatCod, Categoria, Total }] }.
export const getSociosDeudasPorCategoria = async (search = '', radio = '', fechaDesde = '', fechaHasta = '') => {
  try {
    const params = { search, radio };
    if (fechaDesde) params.fechaDesde = fechaDesde;
    if (fechaHasta) params.fechaHasta = fechaHasta;

    const response = await api.get('/socios/deudas/por-categoria', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener la deuda por categoría:', error);
    throw error;
  }
};

// Deuda agrupada por rubro. Mismos filtros que getSociosDeudas. Respuesta:
// { items: [{ Rubro, RubroDescripcion, Total }] }.
export const getSociosDeudasPorRubro = async (search = '', categoria = '', radio = '', fechaDesde = '', fechaHasta = '') => {
  try {
    const params = { search, categoria, radio };
    if (fechaDesde) params.fechaDesde = fechaDesde;
    if (fechaHasta) params.fechaHasta = fechaHasta;

    const response = await api.get('/socios/deudas/por-rubro', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener la deuda por rubro:', error);
    throw error;
  }
};

// Informe "Planilla de socios y deudas". A diferencia de getSociosDeudas,
// fechaDesde/fechaHasta son obligatorios: definen las columnas de la
// planilla (un mes -Aniomes AAAAMM- por columna). El backend hace la
// conversión de YYYY-MM-DD a Aniomes, acá solo se mandan las fechas.
// rubro (opcional) acota la planilla a un solo concepto; sin él, cada
// celda suma todos los rubros. Respuesta: { meses, items, total, page,
// limit, totalPages }, donde cada item trae PorMes: { [aniomes]: importe }.
export const getSociosDeudasPlanilla = async (page = 1, limit = 10, fechaDesde, fechaHasta, search = '', categoria = '', radio = '', soloConDeuda = false, rubro = '') => {
  try {
    const params = { page, limit, fechaDesde, fechaHasta, search, categoria, radio };
    if (soloConDeuda) params.soloConDeuda = 'true';
    if (rubro) params.rubro = rubro;

    const response = await api.get('/socios/deudas/planilla', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener la planilla de socios y deudas:', error);
    throw error;
  }
};

// Exporta la planilla de socios y deudas a Excel. Un solo endpoint cubre
// las tres presentaciones (detalle / importe / cruces); "vista" solo
// cambia cómo arma las columnas el backend, no la URL. Mismos filtros que
// getSociosDeudasPlanilla, sin paginar.
export const exportSociosDeudasPlanilla = async (fechaDesde, fechaHasta, search = '', categoria = '', radio = '', soloConDeuda = false, rubro = '', vista = 'detalle') => {
  try {
    const params = new URLSearchParams();
    if (fechaDesde) params.append('fechaDesde', fechaDesde);
    if (fechaHasta) params.append('fechaHasta', fechaHasta);
    if (search) params.append('search', search);
    if (categoria) params.append('categoria', categoria);
    if (radio) params.append('radio', radio);
    if (soloConDeuda) params.append('soloConDeuda', 'true');
    if (rubro) params.append('rubro', rubro);
    params.append('vista', vista);

    const response = await api.get('/socios/deudas/planilla/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error al exportar la planilla de socios y deudas:', error);
    throw error;
  }
};

export const getSocioById = async (id) => {
  try {
    const response = await api.get(`/socios/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching socio:', error);
    throw error;
  }
};

// Informe "Cumpleaños". fecha es obligatoria (YYYY-MM-DD): el backend
// compara día y mes de SocFchNac contra esa fecha (el año no se compara).
// La respuesta trae un array con exactamente los mismos campos que
// GET /socios/:id por cada socio que cumple años ese día -- incluye datos
// de contacto (SocEMail, SocTel, SocTelCel, SocDom), CatNom, RADNOM,
// ForPagNom, DescuentoPorcentaje y CargosExtra -- así que no hace falta un
// segundo pedido para el detalle de cada uno.
export const getSociosCumpleanos = async (fecha) => {
  const response = await api.get('/socios/cumpleanos', { params: { fecha } });
  return response.data;
};

// Informe "Vencimiento de Ficha Médica". fecha es obligatoria (YYYY-MM-DD):
// el backend devuelve los socios cuya SocFchMed vence ANTES de esa fecha,
// ya ordenados por fecha de vencimiento. Mismo shape que GET /socios/:id
// (incluye datos de contacto, CatNom/RADNOM/ForPagNom/NacDsc,
// DescuentoPorcentaje y CargosExtra) para poder avisarles sin pedidos
// adicionales.
export const getSociosFichaMedicaVencimiento = async (fecha) => {
  const response = await api.get('/socios/ficha-medica-vencimiento', { params: { fecha } });
  return response.data;
};

export const createSocio = async (data) => {
  try {
    const response = await api.post('/socios', data);
    return response.data;
  } catch (error) {
    console.error('Error creating socio:', error);
    throw error;
  }
};

export const updateSocio = async (id, data) => {
  try {
    const response = await api.put(`/socios/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating socio:', error);
    throw error;
  }
};

export const deleteSocio = async (id, socMotivoBaja) => {
  try {
    const response = await api.delete(`/socios/${id}`, {
      data: { SocMotivoBaja: socMotivoBaja },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting socio:', error);
    throw error;
  }
};

export const getSociosHistoricos = async (page = 1, limit = 10, search = '', categoria = '', radio = '') => {
  try {
    const response = await api.get('/socios-historicos', {
      params: { page, limit, search, categoria, radio }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching socios historicos:', error);
    throw error;
  }
};

export const getSocioHistoricoById = async (id) => {
  try {
    const response = await api.get(`/socios-historicos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching socio historico details:', error);
    throw error;
  }
};

// Informe "Candidatos a Baja". Socios con más de "cantidadMeses" meses
// impagos de cuota social (Rubro = 1), con nombre y celular para contactarlos.
// cantidadMeses es obligatorio y va en el body.
export const getBajaSocios = async (cantidadMeses) => {
  const response = await api.post('/socios/baja-socios', { cantidadMeses });
  return response.data;
};

// Exporta a Excel el informe "Candidatos a Baja". Mismo parámetro que
// getBajaSocios, pero por query string para poder descargarlo como blob.
export const exportBajaSocios = async (cantidadMeses) => {
  try {
    const response = await api.get('/socios/baja-socios/export', {
      params: { cantidadMeses },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error al exportar los candidatos a baja:', error);
    throw error;
  }
};

// Informe "Habilitados a Votar". Socios mayores a edadMin años (calculado a
// "fecha"), con más antigüedad que "valor" (en meses o años según "tipo"),
// que hayan pagado la cuota de "aniomes" y cuya categoría no esté en
// catCodExcluidos. Todos los parámetros son obligatorios salvo
// catCodExcluidos (default []).
export const getHabilitadosVotar = async ({ fecha, aniomes, edadMin, tipo, valor, catCodExcluidos = [] }) => {
  const response = await api.post('/socios/habilitados-votar', {
    fecha,
    aniomes,
    edadMin,
    tipo,
    valor,
    catCodExcluidos,
  });
  return response.data;
};

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const exportSocios = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.categoria) params.append('categoria', filters.categoria);
    if (filters.radio) params.append('radio', filters.radio);

    const response = await api.get(`/socios/export`, {
      params: params,
      responseType: 'blob' // Important for downloading files
    });
    return response.data;
  } catch (error) {
    console.error('Error al exportar socios:', error);
    throw error;
  }
};

// Informe "Listado de socios con datos de contacto". Por ahora reutiliza el
// mismo endpoint de exportación de /socios (mismos filtros), a la espera de
// que el backend tenga un método propio con el join completo de datos de
// contacto. Cuando ese endpoint exista, solo hay que cambiar la URL acá
// adentro; la page que lo consume no debería tener que cambiar.
export const exportSociosContacto = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.categoria) params.append('categoria', filters.categoria);
    if (filters.radio) params.append('radio', filters.radio);

    const response = await api.get(`/socios/export`, {
      params: params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error al exportar el informe de socios con datos de contacto:', error);
    throw error;
  }
};

export const exportSociosHistoricos = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.categoria) params.append('categoria', filters.categoria);
    if (filters.radio) params.append('radio', filters.radio);

    const response = await api.get(`/socios-historicos/export`, {
      params: params,
      responseType: 'blob' // Important for downloading files
    });
    return response.data;
  } catch (error) {
    console.error('Error al exportar socios históricos:', error);
    return await response.blob();
  }
};

// orderBy/orderDir son opcionales: 'emision' | 'vencimiento' y 'asc' | 'desc'.
// Si no se mandan, la API usa su orden por defecto (vencimiento
// descendente). Si el valor es inválido, la API responde 400 con el
// detalle del error en el body.
export const getCuentaCorriente = async (ci, startDate, endDate, orderBy, orderDir) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (orderBy) params.append('orderBy', orderBy);
  if (orderDir) params.append('orderDir', orderDir);

  const queryString = params.toString();
  const url = `${API_BASE_URL}/cuenta-corriente/${ci}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    const detalle = await response.json().catch(() => null);
    throw new Error(detalle?.error || detalle?.detail || 'Error al obtener cuenta corriente');
  }
  return await response.json();
};

// Crea un cargo manual en la cuenta corriente de un socio. El body ya
// viene armado desde el modal (CI, Mes, Rubro, Importe, Aniomes, Usuario,
// FechaVto), acá solo se hace el POST.
export const crearCargo = async (data) => {
  try {
    const response = await api.post('/cuenta-corriente', data);
    return response.data;
  } catch (error) {
    console.error('Error al crear el cargo:', error);
    throw error;
  }
};

// Crea el mismo cargo (mismo rubro, mes e importe) para varios socios de
// una sola vez. USADO POR GenerarCargosPage (proceso "Generación de
// Cargos" en Utilidades). PENDIENTE: este endpoint todavía no existe en el
// backend -- se arma acá el contrato más probable, mismo shape que
// crearCargo pero con un array de cédulas en vez de una sola, para poder
// maquetar y probar el front ya mismo. Cuando el endpoint real esté listo,
// debería alcanzar con ajustar la URL y, si hace falta, el nombre de los
// campos del payload; el resto del front no debería necesitar cambios.
//
// El importe siempre sale del rubro elegido (rubro.Importe): no hay
// override manual ni cálculo especial por categoría. La fecha de
// vencimiento no la manda el front -- la calcula la API a partir del mes.
export const crearCargoMasivo = async ({ cis, mes, rubro, importe, aniomes, usuario }) => {
  try {
    const payload = {
      CIs: cis,
      Mes: mes,
      Rubro: Number(rubro),
      Importe: Number(importe),
      Aniomes: aniomes,
      Usuario: usuario,
    };
    const response = await api.post('/cuenta-corriente/masivo', payload);
    return response.data;
  } catch (error) {
    console.error('Error al crear los cargos masivos:', error);
    throw error;
  }
};

// Detalle de una categoría de socio (incluye CatPrc y los importes
// escalonados Importe3..Importe7 según cantidad de integrantes del grupo
// familiar). Usado por CrearCargoModal cuando el rubro elegido es el
// especial de "cuota de categoría" (IdRubro = 1).
export const getCategoriaSocio = async (catCod) => {
  const response = await api.get(`/categoriaSocios/${catCod}`);
  return response.data;
};

// Cargos anulables de un socio: registros de cuenta corriente con NroRecibo
// = 0 (todavía sin recibo emitido). Si no hay ninguno la API responde [].
export const getCargosAnulables = async (ci) => {
  try {
    const response = await api.get(`/cuenta-corriente/anulables/${ci}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los cargos anulables:', error);
    throw error;
  }
};

// Anula (elimina) un cargo de cuenta corriente por su Id.
export const anularCargo = async (id) => {
  try {
    const response = await api.delete(`/cuenta-corriente/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al anular el cargo:', error);
    throw error;
  }
};

// orderBy/orderDir: mismo contrato que getCuentaCorriente.
export const getCuentaCorrienteFamiliar = async (ci, startDate, endDate, orderBy, orderDir) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (orderBy) params.append('orderBy', orderBy);
  if (orderDir) params.append('orderDir', orderDir);

  const queryString = params.toString();
  const url = `${API_BASE_URL}/cuenta-corriente/familiar/${ci}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    const detalle = await response.json().catch(() => null);
    throw new Error(detalle?.error || detalle?.detail || 'Error al obtener cuenta corriente familiar');
  }
  return await response.json();
};

// Equivalente a getCuentaCorriente pero para socios dados de baja: lee de
// CuentaCorrienteBajados en vez de CuentaCorriente. Mismos parámetros
// (startDate, endDate, orderBy, orderDir). Se usa en el detalle de socio
// histórico, donde ya no hay movimientos en la tabla de cuenta corriente
// activa.
export const getCuentaCorrienteBajados = async (ci, startDate, endDate, orderBy, orderDir) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (orderBy) params.append('orderBy', orderBy);
  if (orderDir) params.append('orderDir', orderDir);

  const queryString = params.toString();
  const url = `${API_BASE_URL}/cuenta-corriente/bajados/${ci}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    const detalle = await response.json().catch(() => null);
    throw new Error(detalle?.error || detalle?.detail || 'Error al obtener la cuenta corriente histórica');
  }
  return await response.json();
};

// Equivalente a getCuentaCorrienteFamiliar pero para socios dados de baja:
// el CodGrupo también se resuelve desde CuentaCorrienteBajados, porque un
// socio de baja ya no tiene movimientos en CuentaCorriente. Mismos
// parámetros que getCuentaCorrienteBajados.
export const getCuentaCorrienteBajadosFamiliar = async (ci, startDate, endDate, orderBy, orderDir) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (orderBy) params.append('orderBy', orderBy);
  if (orderDir) params.append('orderDir', orderDir);

  const queryString = params.toString();
  const url = `${API_BASE_URL}/cuenta-corriente/bajados/familiar/${ci}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    const detalle = await response.json().catch(() => null);
    throw new Error(detalle?.error || detalle?.detail || 'Error al obtener la cuenta corriente familiar histórica');
  }
  return await response.json();
};

// Informe "Cobranza por período". Paginado igual que getSocios/getSociosDeudas
// ({ items, total, page, limit, totalPages }): el corte lo hace SQL con
// OFFSET/FETCH, así que un rango de varios meses no trae todo de una para
// cortarlo en el cliente. Filtra los registros de CuentaCorriente cobrados
// (NroRecibo <> 0) cuya FechaPago cae dentro de [fechaDesde, fechaHasta] --
// el backend incluye el día completo de fechaHasta, no corta a las 00:00.
// fechaDesde/fechaHasta son obligatorios; si faltan o son inválidos el
// backend responde 400 con { error }, que se deja propagar tal cual para
// que el caller muestre ese mensaje puntual.
export const getCobranzaPeriodo = async (fechaDesde, fechaHasta, page = 1, limit = 50) => {
  try {
    const response = await api.get('/cuenta-corriente/cobranza', {
      params: { fechaDesde, fechaHasta, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener la cobranza del período:', error);
    throw error;
  }
};

// Excel del informe "Cobranza por período". Mismo filtro que
// getCobranzaPeriodo (NroRecibo <> 0, FechaPago en rango) pero sin
// paginar: trae el período completo y el backend devuelve directamente el
// archivo .xlsx, igual que exportSocios.
export const exportCobranzaPeriodo = async (fechaDesde, fechaHasta) => {
  try {
    const response = await api.get('/cuenta-corriente/cobranza/export', {
      params: { fechaDesde, fechaHasta },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error al exportar la cobranza del período:', error);
    throw error;
  }
};

// Informe "Emisión". No pagina: trae de una todos los cargos de
// CuentaCorriente con FechaCargo dentro del rango pedido, con joins a
// Rubros/CategoriasSocios/Socios (RubDsc, CatNom, SocNom en vez de códigos).
// fechaDesde y fechaHasta son obligatorios; si faltan el backend responde
// 400 con { error }.
export const getEmisionPorPeriodo = async (fechaDesde, fechaHasta) => {
  try {
    const response = await api.get('/cuenta-corriente/emision', {
      params: { fechaDesde, fechaHasta }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener el informe de emisión:', error);
    throw error;
  }
};

// Excel del informe "Emisión". Mismo filtro que getEmisionPorPeriodo.
export const exportEmisionPorPeriodo = async (fechaDesde, fechaHasta) => {
  try {
    const response = await api.get('/cuenta-corriente/emision/export', {
      params: { fechaDesde, fechaHasta },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error al exportar el informe de emisión:', error);
    throw error;
  }
};

// Informe "Listado de Cobranza". No pagina: trae de una todos los movimientos
// de CuentaCorriente ya cobrados (NroRecibo <> 0) con FechaPago dentro del
// rango pedido, con joins a Rubros/CategoriasSocios/Socios (RubDsc, CatNom,
// SocNom en vez de códigos). fechaDesde y fechaHasta son obligatorios; si
// faltan el backend responde 400 con { error }.
export const getPagosPorPeriodo = async (fechaDesde, fechaHasta) => {
  try {
    const response = await api.get('/cuenta-corriente/pagos-fecha', {
      params: { fechaDesde, fechaHasta }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener el informe de pagos:', error);
    throw error;
  }
};

// Excel del informe "Listado de Cobranza". Mismo filtro que getPagosPorPeriodo.
export const exportPagosPorPeriodo = async (fechaDesde, fechaHasta) => {
  try {
    const response = await api.get('/cuenta-corriente/pagos-fecha/export', {
      params: { fechaDesde, fechaHasta },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error al exportar el informe de pagos:', error);
    throw error;
  }
};

// Informe "Movimientos Anulados". No pagina: trae de una todos los cargos
// anulados (tabla MovimientosAnulados) con FechaPago dentro del rango
// pedido, con joins a Rubros/CategoriasSocios/Socios (RubDsc, CatNom, SocNom
// en vez de códigos). fechaDesde y fechaHasta son obligatorios; si faltan el
// backend responde 400 con { error }.
export const getMovimientosAnuladosPorPeriodo = async (fechaDesde, fechaHasta) => {
  try {
    const response = await api.get('/cuenta-corriente/movimientos-anulados', {
      params: { fechaDesde, fechaHasta }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener el informe de movimientos anulados:', error);
    throw error;
  }
};

// Excel del informe "Movimientos Anulados". Mismo filtro que getMovimientosAnuladosPorPeriodo.
export const exportMovimientosAnuladosPorPeriodo = async (fechaDesde, fechaHasta) => {
  try {
    const response = await api.get('/cuenta-corriente/movimientos-anulados/export', {
      params: { fechaDesde, fechaHasta },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error al exportar el informe de movimientos anulados:', error);
    throw error;
  }
};

// Informe "Listado de Altas". No pagina: trae de una todos los socios cuyo
// ingreso (SocFchIng) cae dentro del rango pedido. fechaDesde y fechaHasta
// son obligatorios; si faltan el backend responde 400 con { error }.
export const getListadoAltas = async (fechaDesde, fechaHasta) => {
  try {
    const response = await api.get('/socios/altas', {
      params: { fechaDesde, fechaHasta }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener el informe de listado de altas:', error);
    throw error;
  }
};

// Excel del informe "Listado de Altas". Mismo filtro que getListadoAltas.
export const exportListadoAltas = async (fechaDesde, fechaHasta) => {
  try {
    const response = await api.get('/socios/altas/export', {
      params: { fechaDesde, fechaHasta },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error al exportar el informe de listado de altas:', error);
    throw error;
  }
};

// Informe "Listado de Bajas". No pagina: trae de una todos los socios cuyo
// egreso (SocFecEgr_DATE) cae dentro del rango pedido. fechaDesde y
// fechaHasta son obligatorios; si faltan el backend responde 400 con { error }.
export const getListadoBajas = async (fechaDesde, fechaHasta) => {
  try {
    const response = await api.get('/socios/bajas', {
      params: { fechaDesde, fechaHasta }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener el informe de listado de bajas:', error);
    throw error;
  }
};

// Excel del informe "Listado de Bajas". Mismo filtro que getListadoBajas.
export const exportListadoBajas = async (fechaDesde, fechaHasta) => {
  try {
    const response = await api.get('/socios/bajas/export', {
      params: { fechaDesde, fechaHasta },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error al exportar el informe de listado de bajas:', error);
    throw error;
  }
};

// Informe "Movimientos de Caja". No pagina: trae de una todos los
// comprobantes de CajaCab con Fecha en [fechaDesde, fechaHasta] (rango
// inclusivo, igual que la consulta SQL original), una fila por cada
// combinación de rubro/medio de pago del comprobante. fechaDesde/fechaHasta
// son obligatorios; si faltan el backend responde 400 con { error }.
export const getMovimientosCaja = async (fechaDesde, fechaHasta) => {
  try {
    const response = await api.get('/cajacab/movimientos', {
      params: { fechaDesde, fechaHasta }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener los movimientos de caja:', error);
    throw error;
  }
};

// Excel del informe "Movimientos de Caja". Mismo filtro que
// getMovimientosCaja, pero agrupado por comprobante en el backend (ver
// CajaCabModel.getMovimientosForExport) y devuelto directamente como .xlsx.
export const exportMovimientosCaja = async (fechaDesde, fechaHasta) => {
  try {
    const response = await api.get('/cajacab/movimientos/export', {
      params: { fechaDesde, fechaHasta },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error al exportar los movimientos de caja:', error);
    throw error;
  }
};

export const getCuotasPendientes = async (aniomes) => {
  try {
    const response = await api.get(`/cuotas/pendientes/${aniomes}`);
    return response.data;
  } catch (error) {
    console.error('Error al consultar cuotas pendientes:', error);
    throw error;
  }
};

// Registros de cuenta corriente de un socio (por CI) cuya FechaPago cae
// dentro del mes indicado (mes en formato "YYYY-MM"). Se usa en Rechazos
// para encontrar el pago concreto que hay que revertir.
export const getPagosCuentaCorriente = async (ci, mes) => {
  const response = await api.get(`/cuenta-corriente/pagos/${ci}/${mes}`);
  return response.data;
};

// Revierte un pago de cuenta corriente: el backend vuelve el registro a
// estado "sin pagar" (NroRecibo = 0, FechaPago = NULL, FormaPago = '').
// Devuelve 404 si el id no existe.
export const rechazarPago = async (id) => {
  const response = await api.put(`/cuenta-corriente/rechazar/${id}`);
  return response.data;
};

export const generarCuotas = async (aniomes) => {
  try {
    const response = await api.post('/cuotas/generar', { aniomes });
    return response.data;
  } catch (error) {
    console.error('Error al generar cuotas:', error);
    throw error;
  }
};

export const loginUsuario = async (nombre, contrasena) => {
  const response = await api.post('/usuarios/login', { nombre, contrasena });
  return response.data;
};

export const registrarUsuario = async (nombre, contrasena, tipo, nroCaja) => {
  const response = await api.post('/usuarios/register', { nombre, contrasena, tipo, nroCaja });
  return response.data;
};

export const getCajaMovimientosHoy = async (caja) => {
  const response = await api.get('/caja/movimientos', { params: { caja } });
  return response.data;
};

export const crearEntradaCaja = async ({ caja, usuario, monto, detalle }) => {
  const response = await api.post('/caja/entrada', { caja, usuario, monto, detalle });
  return response.data;
};

export const crearSalidaCaja = async ({ caja, usuario, monto, detalle }) => {
  const response = await api.post('/caja/salida', { caja, usuario, monto, detalle });
  return response.data;
};

export const crearCobranzaEspecial = async ({ caja, usuario, monto, detalle }) => {
  const response = await api.post('/caja/cobranza-especial', { caja, usuario, monto, detalle });
  return response.data;
};

export const buscarCuotasPendientes = async ({ ci, nombre }) => {
  const response = await api.get('/caja/cuotas-pendientes', { params: { ci, nombre } });
  return response.data;
};

export const cobrarCuotasSocio = async ({ caja, usuario, ci, nombreSocio, cuotaIds, formasPago }) => {
  const response = await api.post('/caja/cobro', { caja, usuario, ci, nombreSocio, cuotaIds, formasPago });
  return response.data;
};

export const getMediosPago = async () => {
  const response = await api.get('/mediospago');
  return response.data;
};

export const getSaldoPorMedioPago = async (caja) => {
  const response = await api.get('/caja/saldo-por-medio-pago', { params: { caja } });
  return response.data;
};

export const cerrarCaja = async ({ caja, usuario }) => {
  const response = await api.post('/caja/cierre', { caja, usuario });
  return response.data;
};

export const getCajaHistorico = async ({ caja, fecha, nroCierre } = {}) => {
  const response = await api.get('/caja/historico', { params: { caja, fecha, nroCierre } });
  return response.data;
};

export const generarArchivo = async (financiera, emision) => {
  try {
    const response = await api.post('/generacion-archivos/generar', {
      financiera,
      emision,
    });
    return response.data;
  } catch (error) {
    console.error('Error al generar archivo:', error);
    throw error;
  }
};

export const getParametrosDebitos = async () => {
  const response = await api.get('/parametros-debitos');
  return response.data;
};

export const updateParametroDebito = async (nombre, data) => {
  const response = await api.put(`/parametros-debitos/${encodeURIComponent(nombre)}`, data);
  return response.data;
};

export const deleteParametroDebito = async (nombre) => {
  const response = await api.delete(`/parametros-debitos/${encodeURIComponent(nombre)}`);
  return response.data;
};

export const loginSocio = async (ci, contrasena) => {
  const response = await api.post('/portal-socio/login', { ci, contrasena });
  return response.data;
};

export const getFichaSocio = async (ci) => {
  const response = await api.get(`/portal-socio/ficha/${ci}`);
  return response.data;
};

export const getCuentaCorrienteSocio = async (ci) => {
  const response = await api.get(`/portal-socio/cuenta-corriente/${ci}`);
  return response.data;
};

export const actualizarDatosSocio = async (ci, datos) => {
  const response = await api.put(`/portal-socio/ficha/${ci}`, datos);
  return response.data;
};

// Grupos familiares: no existe una tabla propia, todo vive en Socios.GruFamNro.
// El controller tiene su propia base (/api/gruposfamiliares) y usa siempre la
// cédula (SocDocIde) del titular como identificador, no un id autonumérico.
export const getGruposFamiliares = async () => {
  const response = await api.get('/gruposfamiliares');
  return response.data;
};

// Detalle de un grupo (titular + integrantes). Puede devolver 404 si esa
// cédula no es titular de ningún grupo; se deja que el caller decida cómo
// tratar ese caso (ver comentario en CrearGrupoFamiliarModal).
export const getGrupoFamiliar = async (socDocIde) => {
  const response = await api.get(`/gruposfamiliares/${socDocIde}`);
  return response.data;
};

// Socios con GruFamNro = 0 (sin grupo todavía): son los únicos candidatos
// válidos para armar o sumar a un grupo. search es opcional, filtra por
// cédula o nombre/apellido; el backend topea la respuesta en 200 filas.
export const getSociosSinGrupo = async (search = '') => {
  const response = await api.get('/gruposfamiliares/sin-grupo', { params: { search } });
  return response.data;
};

// titularSocDocIde: cédula del socio que va a ser titular (requerido).
// socNros: SocNro de los integrantes a agregar (no hace falta incluir el
// del titular, el backend lo agrega solo).
export const createGrupoFamiliar = async ({ titularSocDocIde, socNros }) => {
  const response = await api.post('/gruposfamiliares', { titularSocDocIde, socNros });
  return response.data;
};

// Sincroniza los integrantes de un grupo existente: socNros debe ser la
// lista COMPLETA de SocNro que deben quedar en el grupo (sin contar al
// titular, que se mantiene siempre). No es un PATCH incremental.
export const updateGrupoFamiliar = async (socDocIde, socNros) => {
  const response = await api.put(`/gruposfamiliares/${socDocIde}`, { socNros });
  return response.data;
};

// Disuelve el grupo completo (titular + integrantes vuelven a GruFamNro = 0).
export const deleteGrupoFamiliar = async (socDocIde) => {
  const response = await api.delete(`/gruposfamiliares/${socDocIde}`);
  return response.data;
};

// Cambia el titular de un grupo existente. socDocIde (URL) es el titular
// ACTUAL; nuevoTitularSocDocIde tiene que ser alguien que ya figure como
// integrante de ese mismo grupo (el backend responde 400 si no lo es, o si
// ya es el titular actual). Si todo sale bien, mueve GruFamNro de todo el
// grupo (y CodGrupo en CuentaCorriente) a la nueva cédula y devuelve el
// grupo actualizado, ahora identificado por nuevoTitularSocDocIde -- el
// socDocIde viejo deja de existir como titular, así que el caller tiene que
// actualizar la URL/estado a la cédula nueva después de esta respuesta.
export const cambiarTitularGrupoFamiliar = async (socDocIde, nuevoTitularSocDocIde) => {
  const response = await api.put(`/gruposfamiliares/${socDocIde}/titular`, { nuevoTitularSocDocIde });
  return response.data;
};

export const cambiarContrasenaSocio = async (ci, contrasenaActual, contrasenaNueva) => {
  const response = await api.put(`/portal-socio/cambiar-contrasena/${ci}`, { contrasenaActual, contrasenaNueva });
  return response.data;
};

// Fotos de socios
export const subirFotoSocio = async (ci, file) => {
  const formData = new FormData();
  formData.append('foto', file);
  const response = await api.post(`/fotos/${ci}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// CRUD de Descuentos (Ci, Porcentaje). Un solo registro por CI. GET /socios/:id
// y GET /socios-historicos/:id ya traen DescuentoPorcentaje vía LEFT JOIN
// (null si el socio no tiene descuento cargado), así que la pestaña de
// detalle no necesita llamar a getDescuentoByCi para mostrarlo -- solo para
// las operaciones de alta/baja/modificación.
export const getDescuentos = async () => {
  const response = await api.get('/descuentos');
  return response.data;
};

export const getDescuentoByCi = async (ci) => {
  const response = await api.get(`/descuentos/${ci}`);
  return response.data;
};

// 409 si ya existe un registro de descuento para ese CI.
export const createDescuento = async (ci, porcentaje) => {
  const response = await api.post('/descuentos', { Ci: ci, Porcentaje: porcentaje });
  return response.data;
};

export const updateDescuento = async (ci, porcentaje) => {
  const response = await api.put(`/descuentos/${ci}`, { Porcentaje: porcentaje });
  return response.data;
};

export const deleteDescuento = async (ci) => {
  const response = await api.delete(`/descuentos/${ci}`);
  return response.data;
};

// CRUD de Cargos Extra (Ci, Rubro, Importe). Clave compuesta Ci+Rubro: un
// socio puede tener varios cargos extra, pero no dos con el mismo rubro.
// Igual que con Descuentos, GET /socios/:id y GET /socios-historicos/:id ya
// traen el array CargosExtra (Rubro, RubDsc, Importe) para mostrarlo en el
// detalle; estos métodos son para las operaciones de alta/baja/modificación.
export const getCargosExtra = async () => {
  const response = await api.get('/cargos-extra');
  return response.data;
};

export const getCargosExtraByCi = async (ci) => {
  const response = await api.get(`/cargos-extra/${ci}`);
  return response.data;
};

export const getCargoExtraByCiRubro = async (ci, rubro) => {
  const response = await api.get(`/cargos-extra/${ci}/${rubro}`);
  return response.data;
};

// 409 si ya existe un cargo extra con esa combinación Ci+Rubro.
export const createCargoExtra = async (ci, rubro, importe) => {
  const response = await api.post('/cargos-extra', { Ci: ci, Rubro: rubro, Importe: importe });
  return response.data;
};

export const updateCargoExtra = async (ci, rubro, importe) => {
  const response = await api.put(`/cargos-extra/${ci}/${rubro}`, { Importe: importe });
  return response.data;
};

export const deleteCargoExtra = async (ci, rubro) => {
  const response = await api.delete(`/cargos-extra/${ci}/${rubro}`);
  return response.data;
};

export default api;
