import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { 
  ShoppingBagIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  CubeIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { productoService, categoriaService } from '../../services';

const VendedorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState({
    totalProductos: 0,
    productosPorCategoria: [],
    productosActivos: 0,
    productosInactivos: 0,
    productosStockBajo: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [productos, categorias] = await Promise.all([
        productoService.getAll(),
        categoriaService.getAll()
      ]);

      // Calcular productos por categoría
      const productosPorCategoria = categorias.map(cat => ({
        nombre: cat.nombre,
        cantidad: productos.filter(p => p.categoria?.idCategoria === cat.idCategoria).length
      }));

      // Calcular productos con stock bajo (menos de 15 unidades)
      const productosStockBajo = productos.filter(p => p.stock < 15).length;

      setStats({
        totalProductos: productos.length,
        productosPorCategoria,
        productosActivos: productos.length, // Todos los productos están activos
        productosInactivos: 0,
        productosStockBajo
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-700">
      {/* Header */}
      <nav className="bg-white/10 backdrop-blur-md shadow-lg">
        <div className="container-main py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Panel de Vendedor</h1>
            <p className="text-white/80 text-sm">Bienvenido, {user?.nombre}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
              title="Ir a la página de inicio"
            >
              <HomeIcon className="h-5 w-5" />
              <span>Inicio</span>
            </button>
            <button
              onClick={logout}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <div className="container-main py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            🛒 Gestión de Productos
          </h2>
          <p className="text-white/90 text-lg">
            Administra el catálogo de productos disponibles
          </p>
        </div>

        {/* Módulo de Productos */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/vendedor/productos')}
            className="w-full md:w-auto bg-white rounded-xl shadow-xl p-8 hover:shadow-2xl transform hover:scale-105 transition-all duration-200 text-left"
          >
            <div className="bg-purple-500 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
              <ShoppingBagIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Productos
            </h3>
            <p className="text-gray-600">
              Administrar catálogo de productos: crear, editar, eliminar y actualizar inventario
            </p>
          </button>
        </div>

        {/* Estadísticas de Inventario */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white">
            <p className="text-white/80 text-sm mb-2">Total Productos</p>
            <p className="text-3xl font-bold">
              {loading ? '...' : stats.totalProductos}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white">
            <p className="text-white/80 text-sm mb-2">Productos Activos</p>
            <p className="text-3xl font-bold text-green-300">
              {loading ? '...' : stats.productosActivos}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white">
            <p className="text-white/80 text-sm mb-2">Stock Bajo (&lt; 15)</p>
            <p className="text-3xl font-bold text-orange-300">
              {loading ? '...' : stats.productosStockBajo}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white">
            <p className="text-white/80 text-sm mb-2">Categorías</p>
            <p className="text-3xl font-bold text-blue-300">
              {loading ? '...' : stats.productosPorCategoria.length}
            </p>
          </div>
        </div>

        {/* Productos por categoría */}
        {!loading && stats.productosPorCategoria.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CubeIcon className="h-6 w-6 mr-2 text-primary-600" />
              Productos por Categoría
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.productosPorCategoria.map((cat, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 rounded-lg p-2">
                      <TagIcon className="h-5 w-5 text-primary-600" />
                    </div>
                    <span className="font-medium text-gray-900">{cat.nombre}</span>
                  </div>
                  <span className="text-2xl font-bold text-primary-600">
                    {cat.cantidad}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendedorDashboard;
