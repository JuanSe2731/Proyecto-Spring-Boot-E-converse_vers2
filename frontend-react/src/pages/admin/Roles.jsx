import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilSquareIcon, 
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { rolService } from '../../services';
import AdminLayout from '../../components/AdminLayout';
import ConfirmDialog from '../../components/ConfirmDialog';

const AdminRoles = () => {
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  // Descripciones funcionales de cada rol
  const roleDescriptions = {
    'Administrador': 'Acceso completo al sistema. Puede gestionar usuarios, productos, categorías, roles y ver todas las estadísticas.',
    'Cliente': 'Cliente registrado. Puede navegar por el catálogo, agregar productos al carrito, realizar compras y gestionar su perfil personal.',
    'Vendedor': 'Vendedor del sistema. Puede gestionar productos, categorías y ver estadísticas de ventas, pero no tiene acceso a usuarios ni roles.',
  };
  
  const [formData, setFormData] = useState({
    nombre: ''
  });

  useEffect(() => {
    cargarRoles();
  }, []);

  const cargarRoles = async () => {
    setLoading(true);
    try {
      const data = await rolService.getAll();
      // Eliminar duplicados por ID
      const rolesUnicos = data.reduce((acc, rol) => {
        if (!acc.find(r => r.idRol === rol.idRol)) {
          acc.push(rol);
        }
        return acc;
      }, []);
      setRoles(rolesUnicos);
    } catch (error) {
      console.error('Error al cargar roles:', error);
      alert('Error al cargar los roles');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const abrirModalCrear = () => {
    setEditingRole(null);
    setFormData({ nombre: '' });
    setShowModal(true);
  };

  const abrirModalEditar = (rol) => {
    setEditingRole(rol);
    setFormData({
      nombre: rol.nombre
    });
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingRole(null);
    setFormData({ nombre: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }

    setLoading(true);
    try {
      const rolData = {
        nombre: formData.nombre
      };

      if (editingRole) {
        rolData.idRol = editingRole.idRol;
        await rolService.update(rolData);
        alert('Rol actualizado exitosamente');
      } else {
        await rolService.create(rolData);
        alert('Rol creado exitosamente');
      }

      cerrarModal();
      cargarRoles();
    } catch (error) {
      console.error('Error al guardar rol:', error);
      alert(error.response?.data?.message || 'Error al guardar el rol');
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminar = (rol) => {
    setRoleToDelete(rol);
    setShowConfirmDelete(true);
  };

  const eliminarRol = async () => {
    if (!roleToDelete) return;

    setLoading(true);
    try {
      await rolService.delete(roleToDelete.idRol);
      alert('Rol eliminado exitosamente');
      setShowConfirmDelete(false);
      setRoleToDelete(null);
      cargarRoles();
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      alert(error.response?.data?.message || 'Error al eliminar el rol. Puede estar en uso.');
    } finally {
      setLoading(false);
    }
  };

  const rolesFiltrados = roles.filter(rol =>
    rol.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Gestión de Roles">
      {/* Barra de acciones */}
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <button
          onClick={abrirModalCrear}
          className="btn-primary flex items-center justify-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Nuevo Rol</span>
        </button>

        <div className="relative flex-1 md:max-w-md">
          <input
            type="text"
            placeholder="Buscar roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Tabla de roles */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Funcionalidades
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                    Cargando...
                  </td>
                </tr>
              ) : rolesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                    No hay roles registrados
                  </td>
                </tr>
              ) : (
                rolesFiltrados.map((rol) => (
                  <tr key={rol.idRol} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-primary-100">
                          <span className="text-primary-600 font-bold text-sm">{rol.nombre.substring(0, 2).toUpperCase()}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{rol.nombre}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {roleDescriptions[rol.nombre] || rol.descripcion || 'Sin descripción de funcionalidades'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => abrirModalEditar(rol)}
                        className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                        title="Editar"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => confirmarEliminar(rol)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h3 className="text-xl font-bold text-gray-900">
                {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
              </h3>
              <button
                onClick={cerrarModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Rol *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Ej: Administrador, Cliente, Vendedor"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Las funcionalidades se asignan automáticamente según el nombre del rol
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : editingRole ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Diálogo de confirmación de eliminación */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Eliminar Rol"
        message={`¿Estás seguro de eliminar el rol "${roleToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={eliminarRol}
        onCancel={() => {
          setShowConfirmDelete(false);
          setRoleToDelete(null);
        }}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </AdminLayout>
  );
};

export default AdminRoles;
