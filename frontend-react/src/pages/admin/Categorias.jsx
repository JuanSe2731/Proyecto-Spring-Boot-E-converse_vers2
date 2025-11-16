import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilSquareIcon, 
  TrashIcon,
  XMarkIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { categoriaService } from '../../services';
import AdminLayout from '../../components/AdminLayout';
import ConfirmDialog from '../../components/ConfirmDialog';

const AdminCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    setLoading(true);
    try {
      const data = await categoriaService.getAll();
      setCategorias(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      alert('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const abrirModalCrear = () => {
    setEditingCategoria(null);
    setFormData({ nombre: '', descripcion: '' });
    setShowModal(true);
  };

  const abrirModalEditar = (categoria) => {
    setEditingCategoria(categoria);
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || ''
    });
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingCategoria(null);
    setFormData({ nombre: '', descripcion: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }

    setLoading(true);
    try {
      const categoriaData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion
      };

      if (editingCategoria) {
        categoriaData.idCategoria = editingCategoria.idCategoria;
        await categoriaService.update(categoriaData);
        alert('Categoría actualizada exitosamente');
      } else {
        await categoriaService.create(categoriaData);
        alert('Categoría creada exitosamente');
      }

      cerrarModal();
      cargarCategorias();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      alert(error.response?.data?.message || 'Error al guardar la categoría');
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminar = (categoria) => {
    setCategoriaToDelete(categoria);
    setShowConfirmDelete(true);
  };

  const eliminarCategoria = async () => {
    if (!categoriaToDelete) return;

    setLoading(true);
    try {
      await categoriaService.delete(categoriaToDelete.idCategoria);
      alert('Categoría eliminada exitosamente');
      setShowConfirmDelete(false);
      setCategoriaToDelete(null);
      cargarCategorias();
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      alert(error.response?.data?.message || 'Error al eliminar la categoría. Puede tener productos asociados.');
    } finally {
      setLoading(false);
    }
  };

  const categoriasFiltradas = categorias.filter(categoria =>
    categoria.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Gestión de Categorías">
      {/* Barra de acciones */}
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <button
          onClick={abrirModalCrear}
          className="btn-primary flex items-center justify-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Nueva Categoría</span>
        </button>

        <div className="relative flex-1 md:max-w-md">
          <input
            type="text"
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Tabla de categorías */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
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
              ) : categoriasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                    No hay categorías registradas
                  </td>
                </tr>
              ) : (
                categoriasFiltradas.map((categoria) => (
                  <tr key={categoria.idCategoria} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-primary-100 rounded-lg p-2 mr-3">
                          <TagIcon className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">{categoria.nombre}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{categoria.descripcion || 'Sin descripción'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => abrirModalEditar(categoria)}
                        className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                        title="Editar"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => confirmarEliminar(categoria)}
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
                {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
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
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Ej: Deportivos, Casuales, etc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  className="input-field"
                  rows="3"
                  placeholder="Descripción de la categoría (opcional)"
                />
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
                  {loading ? 'Guardando...' : editingCategoria ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Diálogo de confirmación de eliminación */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Eliminar Categoría"
        message={`¿Estás seguro de eliminar la categoría "${categoriaToDelete?.nombre}"? Los productos asociados podrían verse afectados.`}
        onConfirm={eliminarCategoria}
        onCancel={() => {
          setShowConfirmDelete(false);
          setCategoriaToDelete(null);
        }}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </AdminLayout>
  );
};

export default AdminCategorias;
