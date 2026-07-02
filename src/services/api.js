import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://apis.devmacrosoft.com/CLUBES_API/api';

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

export const deleteSocio = async (id) => {
  try {
    const response = await api.delete(`/socios/${id}`);
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

export const getCuotasPendientes = async (aniomes) => {
  try {
    const response = await api.get(`/cuotas/pendientes/${aniomes}`);
    return response.data;
  } catch (error) {
    console.error('Error al consultar cuotas pendientes:', error);
    throw error;
  }
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
export default api;
