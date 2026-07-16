import { useState, useEffect } from 'react';

import { fetchItems, createItem, updateItem, deleteItem } from '../services/api';
import styles from './UsuariosPage.module.css';

const TIPOS = ['Administrador', 'Operador'];

const UsuariosPage = ({ showToast }) => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editando, setEditando] = useState(null);
    const [creando, setCreando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [formData, setFormData] = useState({ nombre: '', contrasena: '', tipo: 'Operador', nroCaja: '1' });

    useEffect(() => {
        cargar();
    }, []);

    const cargar = async () => {
        setLoading(true);
        try {
            const data = await fetchItems('usuarios');
            setUsuarios(Array.isArray(data) ? data : []);
        } catch (err) {
            showToast('Error al cargar usuarios', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEditar = (u) => {
        setCreando(false);
        setEditando(u.id);
        setFormData({ nombre: u.nombre, contrasena: '', tipo: u.tipo, nroCaja: u.nroCaja });
    };

    const handleNuevo = () => {
        setEditando(null);
        setCreando(true);
        setFormData({ nombre: '', contrasena: '', tipo: 'Operador', nroCaja: '1' });
    };

    const handleCancelar = () => {
        setEditando(null);
        setCreando(false);
    };

    const handleGuardar = async () => {
        if (!formData.nombre || !formData.tipo) {
            showToast('Nombre y tipo son requeridos', 'error');
            return;
        }
        if (creando && !formData.contrasena) {
            showToast('La contraseña es requerida para un usuario nuevo', 'error');
            return;
        }
        setGuardando(true);
        try {
            if (creando) {
                await createItem('usuarios', formData);
                showToast('Usuario creado correctamente', 'success');
            } else {
                await updateItem('usuarios', editando, formData);
                showToast('Usuario actualizado correctamente', 'success');
            }
            setEditando(null);
            setCreando(false);
            cargar();
        } catch (err) {
            showToast(err.response?.data?.error || 'Error al guardar el usuario', 'error');
        } finally {
            setGuardando(false);
        }
    };

    const handleEliminar = async (id, nombre) => {
        if (!window.confirm(`¿Segura que querés eliminar al usuario "${nombre}"?`)) return;
        try {
            await deleteItem('usuarios', id);
            showToast('Usuario eliminado correctamente', 'success');
            cargar();
        } catch (err) {
            showToast('Error al eliminar el usuario', 'error');
        }
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando usuarios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2 className={styles.title}>Gestión de Usuarios</h2>
                <button className="btn-primary" onClick={handleNuevo}>
                    + Nuevo Usuario
                </button>
            </div>

            {creando && (
                <div style={{
                    background: 'white',
                    border: '1px solid var(--gray-200)',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '24px',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: '600', color: 'var(--gray-800)' }}>
                        Nuevo usuario
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--gray-700)' }}>Nombre de usuario</label>
                            <input
                                placeholder="Ingresá el nombre"
                                value={formData.nombre}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                style={{ padding: '8px 12px', border: '1px solid var(--gray-300)', borderRadius: '8px', fontSize: '0.9rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--gray-700)' }}>Contraseña</label>
                            <input
                                placeholder="Ingresá la contraseña"
                                type="password"
                                value={formData.contrasena}
                                onChange={e => setFormData({ ...formData, contrasena: e.target.value })}
                                style={{ padding: '8px 12px', border: '1px solid var(--gray-300)', borderRadius: '8px', fontSize: '0.9rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--gray-700)' }}>Rol</label>
                            <select
                                value={formData.tipo}
                                onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                                style={{ padding: '8px 12px', border: '1px solid var(--gray-300)', borderRadius: '8px', fontSize: '0.9rem' }}
                            >
                                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--gray-700)' }}>Nro. de Caja</label>
                            <input
                                placeholder="1"
                                value={formData.nroCaja}
                                onChange={e => setFormData({ ...formData, nroCaja: e.target.value })}
                                style={{ padding: '8px 12px', border: '1px solid var(--gray-300)', borderRadius: '8px', fontSize: '0.9rem' }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className={`btn-primary ${styles.btnSm}`} onClick={handleGuardar} disabled={guardando}>
                            {guardando ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button className={`btn-secondary ${styles.btnSm}`} onClick={handleCancelar}>Cancelar</button>
                    </div>
                </div>
            )}

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Rol</th>
                        <th>Nro. Caja</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map(u => (
                        <tr key={u.id}>
                            <td>
                                {editando === u.id
                                    ? <input
                                        value={formData.nombre}
                                        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                        style={{ padding: '6px 10px', border: '1px solid var(--gray-300)', borderRadius: '6px' }}
                                    />
                                    : u.nombre}
                            </td>
                            <td>
                                {editando === u.id
                                    ? <select
                                        value={formData.tipo}
                                        onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                                        style={{ padding: '6px 10px', border: '1px solid var(--gray-300)', borderRadius: '6px' }}
                                    >
                                        {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    : <span style={{
                                        display: 'inline-block',
                                        padding: '3px 10px',
                                        borderRadius: '999px',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        background: u.tipo === 'Administrador' ? 'var(--primary-100)' : 'var(--gray-100)',
                                        color: u.tipo === 'Administrador' ? 'var(--primary-700)' : 'var(--gray-600)',
                                    }}>
                                        {u.tipo}
                                    </span>
                                }
                            </td>
                            <td>
                                {editando === u.id
                                    ? <input
                                        value={formData.nroCaja}
                                        onChange={e => setFormData({ ...formData, nroCaja: e.target.value })}
                                        style={{ padding: '6px 10px', border: '1px solid var(--gray-300)', borderRadius: '6px', width: '80px' }}
                                    />
                                    : u.nroCaja}
                            </td>
                            <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {editando === u.id ? (
                                        <>
                                            <button className={`btn-primary ${styles.btnSm}`} onClick={handleGuardar} disabled={guardando}>
                                                {guardando ? 'Guardando...' : 'Guardar'}
                                            </button>
                                            <button className={`btn-secondary ${styles.btnSm}`} onClick={handleCancelar}>Cancelar</button>
                                        </>
                                    ) : (
                                        <>
                                            <button className={`btn-primary ${styles.btnSm}`} onClick={() => handleEditar(u)}>Editar</button>
                                            <button className={`btn-secondary ${styles.btnSm}`} onClick={() => handleEliminar(u.id, u.nombre)}>Eliminar</button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UsuariosPage;