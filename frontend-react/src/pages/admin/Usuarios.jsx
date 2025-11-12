import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilSquareIcon, 
  TrashIcon,
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { usuarioService, rolService } from '../../services';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const AdminUsuarios = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    idRol: '',
    direccion: '',
    estado: true
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [usuariosData, rolesData] = await Promise.all([
        usuarioService.getAll(),
        rolService.getAll()
      ]);
      
      // Eliminar duplicados de roles por ID
      const rolesUnicos = rolesData.reduce((acc, rol) => {
        if (!acc.find(r => r.idRol === rol.idRol)) {
          acc.push(rol);
        }
        return acc;
      }, []);
      
      console.log('📊 Roles cargados:', rolesUnicos);
      
      setUsuarios(usuariosData);
      setRoles(rolesUnicos);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const abrirModalCrear = () => {
    setEditingUser(null);
    setFormData({
      nombre: '',
      correo: '',
      contrasena: '',
      idRol: '',
      direccion: '',
      estado: true
    });
    setShowModal(true);
  };

  const abrirModalEditar = (usuario) => {
    setEditingUser(usuario);
    setFormData({
      nombre: usuario.nombre,
      correo: usuario.correo,
      contrasena: '', // No mostramos la contraseña
      idRol: usuario.rol?.idRol || '',
      direccion: usuario.direccion || '',
      estado: usuario.estado
    });
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      nombre: '',
      correo: '',
      contrasena: '',
      idRol: '',
      direccion: '',
      estado: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }
    if (!formData.correo.trim()) {
      alert('El correo es requerido');
      return;
    }
    if (!editingUser && !formData.contrasena.trim()) {
      alert('La contraseña es requerida para nuevos usuarios');
      return;
    }
    if (formData.contrasena && formData.contrasena.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (!formData.idRol) {
      alert('Debe seleccionar un rol');
      return;
    }

    setLoading(true);
    try {
      // Preparar datos según sea crear o editar
      const usuarioData = {
        nombre: formData.nombre,
        correo: formData.correo,
        direccion: formData.direccion,
        estado: formData.estado,
        rol: { idRol: formData.idRol }
      };

      // Agregar ID si estamos editando
      if (editingUser) {
        usuarioData.idUsuario = editingUser.idUsuario;
      }

      // Agregar contraseña solo si se proporcionó
      if (formData.contrasena) {
        usuarioData.contrasena = formData.contrasena;
      }

      if (editingUser) {
        // Actualizar
        await usuarioService.update(usuarioData);
        alert('Usuario actualizado exitosamente');
      } else {
        // Crear
        await usuarioService.create(usuarioData);
        alert('Usuario creado exitosamente');
      }

      cerrarModal();
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      alert(error.response?.data?.message || 'Error al guardar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const eliminarUsuario = async (id, nombre) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario "${nombre}"?`)) {
      return;
    }

    setLoading(true);
    try {
      await usuarioService.delete(id);
      alert('Usuario eliminado exitosamente');
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert('Error al eliminar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.correo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navegación */}
      <nav className="bg-white shadow-md">
        <div className="container-main py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/admin')}
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Volver</span>
            </button>
            <button
              onClick={logout}
              className="btn-danger flex items-center space-x-2"
            >
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <div className="container-main py-8">
        {/* Barra de acciones */}
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <button
            onClick={abrirModalCrear}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Nuevo Usuario</span>
          </button>

          <div className="relative flex-1 md:max-w-md">
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
          </div>
        </div>

        {/* Tabla de usuarios */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Correo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      Cargando...
                    </td>
                  </tr>
                ) : usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No hay usuarios registrados
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.idUsuario} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{usuario.nombre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{usuario.correo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                          {usuario.rol?.nombre || 'Sin rol'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          usuario.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {usuario.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => abrirModalEditar(usuario)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Editar"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => eliminarUsuario(usuario.idUsuario, usuario.nombre)}
                          className="text-red-600 hover:text-red-900"
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
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
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  disabled={editingUser !== null}
                />
                {editingUser && (
                  <p className="text-xs text-gray-500 mt-1">El correo no se puede modificar</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña {editingUser && '(opcional)'}
                </label>
                <input
                  type="password"
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleInputChange}
                  className="input-field"
                  required={!editingUser}
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editingUser 
                    ? 'Dejar vacío para mantener la contraseña actual'
                    : 'Mínimo 6 caracteres'
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol
                </label>
                <select
                  name="idRol"
                  value={formData.idRol}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Seleccionar rol...</option>
                  {roles.map((rol) => (
                    <option key={rol.idRol} value={rol.idRol}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección (opcional)
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="estado"
                  name="estado"
                  checked={formData.estado}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="estado" className="ml-2 block text-sm text-gray-700">
                  Usuario activo
                </label>
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
                  {loading ? 'Guardando...' : editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;
