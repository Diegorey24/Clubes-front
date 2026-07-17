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

export const getCuentaCorriente = async (ci, startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryString = params.toString();
  const url = `${API_BASE_URL}/cuenta-corriente/${ci}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Error al obtener cuenta corriente');
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

export const getCuentaCorrienteFamiliar = async (ci, startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryString = params.toString();
  const url = `${API_BASE_URL}/cuenta-corriente/familiar/${ci}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Error al obtener cuenta corriente familiar');
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

export default api;
