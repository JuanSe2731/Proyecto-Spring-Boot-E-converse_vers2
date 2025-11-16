import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilSquareIcon, 
  TrashIcon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { productoService, categoriaService } from '../../services';
import AdminLayout from '../../components/AdminLayout';
import ConfirmDialog from '../../components/ConfirmDialog';

const AdminProductos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    imagenUrl: '',
    idCategoria: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [productosData, categoriasData] = await Promise.all([
        productoService.getAll(),
        categoriaService.getAll()
      ]);
      setProductos(productosData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const abrirModalCrear = () => {
    setEditingProducto(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      imagenUrl: '',
      idCategoria: ''
    });
    setShowModal(true);
  };

  const abrirModalEditar = (producto) => {
    setEditingProducto(producto);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      stock: producto.stock || 0,
      imagenUrl: producto.imagenUrl || '',
      idCategoria: producto.categoria?.idCategoria || ''
    });
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingProducto(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      imagenUrl: '',
      idCategoria: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }
    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      alert('El precio debe ser mayor a 0');
      return;
    }
    if (!formData.idCategoria) {
      alert('Debe seleccionar una categoría');
      return;
    }

    setLoading(true);
    try {
      // Buscar la categoría completa seleccionada
      const categoriaSeleccionada = categorias.find(
        cat => cat.idCategoria === parseInt(formData.idCategoria)
      );

      const productoData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock) || 0,
        imagenUrl: formData.imagenUrl,
        categoria: categoriaSeleccionada || { idCategoria: parseInt(formData.idCategoria) }
      };

      if (editingProducto) {
        productoData.idProducto = editingProducto.idProducto;
        await productoService.update(productoData);
        alert('Producto actualizado exitosamente');
      } else {
        await productoService.create(productoData);
        alert('Producto creado exitosamente');
      }

      cerrarModal();
      // Recargar todos los productos para obtener los datos completos del backend
      await cargarDatos();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert(error.response?.data?.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminar = (producto) => {
    setProductoToDelete(producto);
    setShowConfirmDelete(true);
  };

  const eliminarProducto = async () => {
    if (!productoToDelete) return;

    setLoading(true);
    try {
      await productoService.delete(productoToDelete.idProducto);
      alert('Producto eliminado exitosamente');
      setShowConfirmDelete(false);
      setProductoToDelete(null);
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert(error.response?.data?.message || 'Error al eliminar el producto.');
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = productos.filter(producto => {
    const matchSearch = producto.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       producto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategoria = filterCategoria === 'all' || 
                          producto.categoria?.idCategoria?.toString() === filterCategoria.toString();
    return matchSearch && matchCategoria;
  });

  const getImageUrl = (imagen) => {
    if (!imagen) return 'https://via.placeholder.com/150x150/4CAF50/ffffff?text=Sin+Imagen';
    if (imagen.startsWith('http://') || imagen.startsWith('https://')) return imagen;
    if (imagen.startsWith('/')) return imagen;
    return `/static/${imagen}`;
  };

  return (
    <AdminLayout title="Gestión de Productos">
      {/* Barra de acciones */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <button
            onClick={abrirModalCrear}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Nuevo Producto</span>
          </button>

          <select
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value)}
            className="input-field md:w-64"
          >
            <option value="all">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat.idCategoria} value={cat.idCategoria}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Mostrando {productosFiltrados.length} de {productos.length} productos
          </span>
        </div>
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-600">No hay productos registrados</p>
          </div>
        ) : (
          productosFiltrados.map((producto) => (
            <div
              key={producto.idProducto}
              className="card overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Imagen */}
              <div className="relative h-48 bg-gray-100">
                <img
                  src={getImageUrl(producto.imagenUrl)}
                  alt={producto.nombre}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150x150/4CAF50/ffffff?text=Sin+Imagen';
                  }}
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    producto.stock > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {producto.stock > 0 ? `Stock: ${producto.stock}` : 'Sin stock'}
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-4">
                <div className="mb-2">
                  <span className="inline-block bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs font-medium">
                    {producto.categoria?.nombre || 'Sin categoría'}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
                  {producto.nombre}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {producto.descripcion || 'Sin descripción'}
                </p>

                <div className="mb-4">
                  <p className="text-2xl font-bold text-primary-600">
                    ${producto.precio?.toLocaleString()}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => abrirModalEditar(producto)}
                    className="btn-secondary flex-1 flex items-center justify-center space-x-1"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => confirmarEliminar(producto)}
                    className="btn-danger flex-1 flex items-center justify-center space-x-1"
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h3 className="text-xl font-bold text-gray-900">
                {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button
                onClick={cerrarModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Ej: Nike Air Max 270"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    className="input-field"
                    rows="3"
                    placeholder="Descripción detallada del producto..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio *
                  </label>
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    name="idCategoria"
                    value={formData.idCategoria}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">Seleccionar categoría...</option>
                    {categorias.map((cat) => (
                      <option key={cat.idCategoria} value={cat.idCategoria}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de la Imagen
                  </label>
                  <input
                    type="text"
                    name="imagenUrl"
                    value={formData.imagenUrl}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  {formData.imagenUrl && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                      <img
                        src={getImageUrl(formData.imagenUrl)}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-lg border-2 border-gray-200"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150x150/4CAF50/ffffff?text=Error';
                        }}
                      />
                    </div>
                  )}
                </div>
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
                  {loading ? 'Guardando...' : editingProducto ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Diálogo de confirmación de eliminación */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Eliminar Producto"
        message={`¿Estás seguro de eliminar el producto "${productoToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={eliminarProducto}
        onCancel={() => {
          setShowConfirmDelete(false);
          setProductoToDelete(null);
        }}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </AdminLayout>
  );
};

export default AdminProductos;
