import { useState, useEffect } from 'react';
import { fetchItems, createItem, updateItem, deleteItem } from '../services/api';
import { Button, PageHeader, Badge, TableActions, ConfirmDialog } from '../components/ui';
import styles from './UsuariosPage.module.css';

const TIPOS = ['Administrador', 'Operador'];

const PlusIcon = (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const UsuariosPage = ({ showToast }) => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editando, setEditando] = useState(null);
    const [creando, setCreando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [formData, setFormData] = useState({ nombre: '', contrasena: '', tipo: 'Operador', nroCaja: '1' });
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => { cargar(); }, []);

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

    const handleCancelar = () => { setEditando(null); setCreando(false); };

    const handleGuardar = async () => {
        if (!formData.nombre || !formData.tipo) { showToast('Nombre y tipo son requeridos', 'error'); return; }
        if (creando && !formData.contrasena) { showToast('La contraseña es requerida para un usuario nuevo', 'error'); return; }
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

    const requestDelete = (u) => setDeleteTarget(u);

    const closeConfirm = () => {
        if (deleting) return;
        setDeleteTarget(null);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await deleteItem('usuarios', deleteTarget.id);
            showToast('Usuario eliminado correctamente', 'success');
            setDeleteTarget(null);
            cargar();
        } catch (err) {
            showToast('Error al eliminar el usuario', 'error');
        } finally {
            setDeleting(false);
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
            <PageHeader
                title="Gestión de Usuarios"
                actions={
                    <Button variant="primary" icon={PlusIcon} onClick={handleNuevo}>
                        Nuevo Usuario
                    </Button>
                }
            />

            {creando && (
                <div className={styles.formCard}>
                    <h3 className={styles.formTitle}>Nuevo usuario</h3>
                    <div className={styles.formGrid}>
                        <div className={styles.field}>
                            <label>Nombre de usuario</label>
                            <input placeholder="Ingresá el nombre" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                        </div>
                        <div className={styles.field}>
                            <label>Contraseña</label>
                            <input placeholder="Ingresá la contraseña" type="password" value={formData.contrasena} onChange={e => setFormData({ ...formData, contrasena: e.target.value })} />
                        </div>
                        <div className={styles.field}>
                            <label>Rol</label>
                            <select value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value })}>
                                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label>Nro. de Caja</label>
                            <input placeholder="1" value={formData.nroCaja} onChange={e => setFormData({ ...formData, nroCaja: e.target.value })} />
                        </div>
                    </div>
                    <div className={styles.formActions}>
                        <Button variant="primary" size="sm" onClick={handleGuardar} loading={guardando}>Guardar</Button>
                        <Button variant="secondary" size="sm" onClick={handleCancelar} disabled={guardando}>Cancelar</Button>
                    </div>
                </div>
            )}

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Rol</th>
                            <th>Nro. Caja</th>
                            <th className={styles.actionsHeader}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map(u => (
                            <tr key={u.id}>
                                <td>
                                    {editando === u.id
                                        ? <input className={styles.inlineInput} value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                                        : u.nombre}
                                </td>
                                <td>
                                    {editando === u.id
                                        ? <select className={styles.inlineInput} value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value })}>
                                            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        : <Badge variant={u.tipo === 'Administrador' ? 'primary' : 'neutral'}>{u.tipo}</Badge>
                                    }
                                </td>
                                <td>
                                    {editando === u.id
                                        ? <input className={`${styles.inlineInput} ${styles.inlineInputSmall}`} value={formData.nroCaja} onChange={e => setFormData({ ...formData, nroCaja: e.target.value })} />
                                        : u.nroCaja}
                                </td>
                                <td className={styles.actionsCell}>
                                    {editando === u.id ? (
                                        <div className={styles.editActions}>
                                            <Button variant="primary" size="sm" onClick={handleGuardar} loading={guardando}>Guardar</Button>
                                            <Button variant="secondary" size="sm" onClick={handleCancelar} disabled={guardando}>Cancelar</Button>
                                        </div>
                                    ) : (
                                        <TableActions
                                            onEdit={() => handleEditar(u)}
                                            onDelete={() => requestDelete(u)}
                                        />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="¿Eliminar usuario?"
                description="Esta acción no se puede deshacer."
                confirmLabel="Sí, eliminar"
                cancelLabel="Cancelar"
                variant="danger"
                loading={deleting}
                onConfirm={confirmDelete}
                onCancel={closeConfirm}
            >
                {deleteTarget && (
                    <div className={styles.confirmSummary}>
                        <div className={styles.confirmName}>{deleteTarget.nombre}</div>
                    </div>
                )}
            </ConfirmDialog>
        </div>
    );
};

export default UsuariosPage;
