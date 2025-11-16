import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import Navbar from '../../components/Navbar';
import ProductCard from '../../components/ProductCard';
import ProductModal from '../../components/ProductModal';
import { productoService, categoriaService } from '../../services';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';

const ClientDashboard = () => {
  const { isAuthenticated } = useAuthStore();
  const { fetchCartItems } = useCartStore();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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
    }
  }, [isAuthenticated, fetchCartItems]);

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
