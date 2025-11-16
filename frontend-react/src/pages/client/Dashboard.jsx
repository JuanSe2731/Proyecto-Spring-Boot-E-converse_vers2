import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, ClipboardDocumentListIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Navbar from '../../components/Navbar';
import ProductCard from '../../components/ProductCard';
import ProductModal from '../../components/ProductModal';
import { productoService, categoriaService, pedidoService } from '../../services';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';

const ClientDashboard = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { fetchCartItems } = useCartStore();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  
  // Filtros
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Cargar productos y categorías
  useEffect(() => {
    loadInitialData();
  }, []);

  // Cargar carrito si está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartItems();
      loadPedidos();
    }
  }, [isAuthenticated, fetchCartItems]);

  const loadPedidos = async () => {
    try {
      const data = await pedidoService.getMisPedidos();
      // Ordenar por fecha más reciente primero
      const pedidosOrdenados = data.sort((a, b) => 
        new Date(b.fechaPedido) - new Date(a.fechaPedido)
      );
      setPedidos(pedidosOrdenados);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        productoService.getAll(),
        categoriaService.getAll()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      
      // Calcular precio máximo para el filtro
      const maxPrice = Math.max(...productsData.map(p => p.precio || 0));
      setPriceRange({ min: 0, max: maxPrice });
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    // Filtro por categoría
    if (selectedCategory !== 'all' && product.categoria?.nombre !== selectedCategory) {
      return false;
    }

    // Filtro por búsqueda
    if (searchTerm && !product.nombre.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filtro por precio
    if (product.precio < priceRange.min || product.precio > priceRange.max) {
      return false;
    }

    // Filtro por tallas (buscar en descripción)
    if (selectedSizes.length > 0 && product.descripcion) {
      const hasSize = selectedSizes.some(size => {
        const regex = new RegExp(`\\b${size}\\b`, 'i');
        return regex.test(product.descripcion);
      });
      if (!hasSize) return false;
    }

    return true;
  });

  const handleSizeToggle = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    const maxPrice = Math.max(...products.map(p => p.precio || 0));
    setPriceRange({ min: 0, max: maxPrice });
    setSelectedSizes([]);
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Contenedor principal */}
      <div className="container-main py-8">
        {/* Tabs para cambiar entre productos y pedidos */}
        {isAuthenticated && (
          <div className="mb-6 flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setShowOrderHistory(false)}
              className={`pb-3 px-1 font-medium transition-colors ${
                !showOrderHistory
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Productos
            </button>
            <button
              onClick={() => setShowOrderHistory(true)}
              className={`pb-3 px-1 font-medium transition-colors flex items-center space-x-2 ${
                showOrderHistory
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ClipboardDocumentListIcon className="h-5 w-5" />
              <span>Mis Pedidos</span>
              {pedidos.length > 0 && (
                <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                  {pedidos.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Contenido condicional */}
        {showOrderHistory && isAuthenticated ? (
          /* Historial de Pedidos */
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Historial de Pedidos</h2>
            {pedidos.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <ClipboardDocumentListIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No tienes pedidos aún</p>
                <button
                  onClick={() => setShowOrderHistory(false)}
                  className="btn-primary mt-4"
                >
                  Explorar productos
                </button>
              </div>
            ) : (
              pedidos.map((pedido) => {
                const getEstadoColor = (estado) => {
                  switch (estado) {
                    case 'Pendiente':
                      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
                    case 'Completado':
                      return 'bg-green-100 text-green-800 border-green-300';
                    case 'Cancelado':
                      return 'bg-red-100 text-red-800 border-red-300';
                    default:
                      return 'bg-gray-100 text-gray-800 border-gray-300';
                  }
                };

                const getEstadoIcon = (estado) => {
                  switch (estado) {
                    case 'Pendiente':
                      return <ClockIcon className="h-5 w-5" />;
                    case 'Completado':
                      return <CheckCircleIcon className="h-5 w-5" />;
                    case 'Cancelado':
                      return <XCircleIcon className="h-5 w-5" />;
                    default:
                      return null;
                  }
                };

                return (
                  <div key={pedido.idPedido} className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Pedido #{pedido.idPedido?.substring(0, 8)}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(pedido.fechaPedido).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getEstadoColor(pedido.estado)}`}>
                        {getEstadoIcon(pedido.estado)}
                        <span>{pedido.estado}</span>
                      </span>
                    </div>

                    {/* Productos del pedido */}
                    <div className="space-y-2 mb-4">
                      {pedido.productos?.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.nombreProducto}</p>
                            <p className="text-sm text-gray-600">
                              ${item.precioUnitario?.toLocaleString()} x {item.cantidad}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            ${item.subtotal?.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200">
                      <span className="text-lg font-bold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-primary-600">
                        ${pedido.total?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Catálogo de Productos */
          <>
        {/* Barra de búsqueda y categorías */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            {/* Búsqueda */}
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
            </div>

            {/* Botón de filtros (móvil) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary md:hidden flex items-center space-x-2"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Filtros</span>
            </button>
          </div>

          {/* Categorías */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Todos
            </button>
            {categories.map(category => (
              <button
                key={category.idCategoria}
                onClick={() => setSelectedCategory(category.nombre)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.nombre
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Grid con filtros y productos */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filtros laterales */}
          <aside className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
                <button
                  onClick={resetFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Limpiar
                </button>
              </div>

              {/* Filtro de precio */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Precio</h3>
                <div className="mb-2">
                  <span className="text-sm text-gray-600">
                    Hasta: ${priceRange.max.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(...products.map(p => p.precio || 0))}
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Filtro de tallas */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Tallas</h3>
                <p className="text-xs text-gray-500 mb-3">
                  * Busca en la descripción
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {[35, 36, 37, 38, 39, 40, 41, 42].map(size => (
                    <button
                      key={size}
                      onClick={() => handleSizeToggle(size.toString())}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedSizes.includes(size.toString())
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Grid de productos */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando productos...</p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No se encontraron productos</p>
                <button onClick={resetFilters} className="btn-primary mt-4">
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.idProducto}
                    product={product}
                    onDetailsClick={() => openProductModal(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        </>
        )}
      </div>

      {/* Modal de detalles del producto */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default ClientDashboard;
