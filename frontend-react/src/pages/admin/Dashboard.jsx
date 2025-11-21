import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { 
  UsersIcon, 
  TagIcon, 
  ShoppingBagIcon, 
  CubeIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { usuarioService, productoService, categoriaService, pedidoService } from '../../services';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalProductos: 0,
    productosPorCategoria: [],
    totalPedidos: 0,
    pedidosPendientes: 0,
    pedidosCompletados: 0,
    pedidosCancelados: 0
  });
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('semana');
  const [estadisticas, setEstadisticas] = useState(null);
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);

  const COLORS = ['#FBBF24', '#10B981', '#EF4444'];

  useEffect(() => {
    loadStats();
    loadEstadisticas();
  }, []);

  useEffect(() => {
    loadEstadisticas();
  }, [periodo]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [usuarios, productos, categorias, pedidos] = await Promise.all([
        usuarioService.getAll(),
        productoService.getAll(),
        categoriaService.getAll(),
        pedidoService.getAll()
      ]);

      // Calcular productos por categoría
      const productosPorCategoria = categorias.map(cat => ({
        nombre: cat.nombre,
        cantidad: productos.filter(p => p.categoria?.idCategoria === cat.idCategoria).length
      }));

      // Calcular estadísticas de pedidos
      const pedidosPendientes = pedidos.filter(p => p.estado === 'Pendiente').length;
      const pedidosCompletados = pedidos.filter(p => p.estado === 'Completado').length;
      const pedidosCancelados = pedidos.filter(p => p.estado === 'Cancelado').length;

      setStats({
        totalUsuarios: usuarios.length,
        totalProductos: productos.length,
        productosPorCategoria,
        totalPedidos: pedidos.length,
        pedidosPendientes,
        pedidosCompletados,
        pedidosCancelados
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEstadisticas = async () => {
    setLoadingEstadisticas(true);
    try {
      const data = await pedidoService.getEstadisticas(periodo);
      setEstadisticas(data);
    } catch (error) {
      console.error('Error cargando estadísticas de pedidos:', error);
    } finally {
      setLoadingEstadisticas(false);
    }
  };

  const menuItems = [
    {
      title: 'Usuarios',
      description: 'Gestionar usuarios del sistema',
      icon: UsersIcon,
      path: '/admin/usuarios',
      color: 'bg-blue-500',
      available: true
    },
    {
      title: 'Roles',
      description: 'Administrar roles y permisos',
      icon: TagIcon,
      path: '/admin/roles',
      color: 'bg-green-500',
      available: true
    },
    {
      title: 'Categorías',
      description: 'Gestionar categorías de productos',
      icon: CubeIcon,
      path: '/admin/categorias',
      color: 'bg-yellow-500',
      available: true
    },
    {
      title: 'Productos',
      description: 'Administrar catálogo de productos',
      icon: ShoppingBagIcon,
      path: '/admin/productos',
      color: 'bg-purple-500',
      available: true
    },
    {
      title: 'Pedidos',
      description: 'Gestionar pedidos de clientes',
      icon: ClipboardDocumentListIcon,
      path: '/admin/pedidos',
      color: 'bg-pink-500',
      available: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-700">
      {/* Header */}
      <nav className="bg-white/10 backdrop-blur-md shadow-lg">
        <div className="container-main py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
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
            🎯 Panel de Control
          </h2>
          <p className="text-white/90 text-lg">
            Gestiona todos los aspectos de tu tienda desde aquí
          </p>
        </div>

        {/* Grid de módulos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => item.available ? navigate(item.path) : alert('Módulo en construcción')}
                className={`bg-white rounded-xl shadow-xl p-6 hover:shadow-2xl transform hover:scale-105 transition-all duration-200 text-left ${
                  !item.available ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                disabled={!item.available}
              >
                <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {item.title}
                  {!item.available && (
                    <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      Próximamente
                    </span>
                  )}
                </h3>
                <p className="text-gray-600 text-sm">
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white">
            <p className="text-white/80 text-sm mb-2">Total Usuarios</p>
            <p className="text-3xl font-bold">
              {loading ? '...' : stats.totalUsuarios}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white">
            <p className="text-white/80 text-sm mb-2">Total Productos</p>
            <p className="text-3xl font-bold">
              {loading ? '...' : stats.totalProductos}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white">
            <p className="text-white/80 text-sm mb-2">Total Pedidos</p>
            <p className="text-3xl font-bold">
              {loading ? '...' : stats.totalPedidos}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white">
            <p className="text-white/80 text-sm mb-2">Pedidos Pendientes</p>
            <p className="text-3xl font-bold text-yellow-300">
              {loading ? '...' : stats.pedidosPendientes}
            </p>
          </div>
        </div>

        {/* Estadísticas de Pedidos por Estado */}
        {!loading && stats.totalPedidos > 0 && (
          <div className="mt-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <ClipboardDocumentListIcon className="h-6 w-6 mr-2 text-primary-600" />
                Estado de Pedidos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border-2 border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-yellow-200 rounded-lg p-3">
                      <ClockIcon className="h-6 w-6 text-yellow-700" />
                    </div>
                    <span className="font-medium text-gray-900">Pendientes</span>
                  </div>
                  <span className="text-3xl font-bold text-yellow-600">
                    {stats.pedidosPendientes}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-200 rounded-lg p-3">
                      <CheckCircleIcon className="h-6 w-6 text-green-700" />
                    </div>
                    <span className="font-medium text-gray-900">Completados</span>
                  </div>
                  <span className="text-3xl font-bold text-green-600">
                    {stats.pedidosCompletados}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border-2 border-red-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-200 rounded-lg p-3">
                      <XCircleIcon className="h-6 w-6 text-red-700" />
                    </div>
                    <span className="font-medium text-gray-900">Cancelados</span>
                  </div>
                  <span className="text-3xl font-bold text-red-600">
                    {stats.pedidosCancelados}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Productos por categoría */}
        {!loading && stats.productosPorCategoria.length > 0 && (
          <div className="mt-6">
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
          </div>
        )}

        {/* Gráficas de Pedidos */}
        <div className="mt-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <ChartBarIcon className="h-6 w-6 mr-2 text-primary-600" />
                Estadísticas de Pedidos
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPeriodo('semana')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    periodo === 'semana'
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Semana
                </button>
                <button
                  onClick={() => setPeriodo('mes')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    periodo === 'mes'
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Mes
                </button>
                <button
                  onClick={() => setPeriodo('año')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    periodo === 'año'
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Año
                </button>
              </div>
            </div>

            {loadingEstadisticas ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Cargando estadísticas...</p>
              </div>
            ) : estadisticas && estadisticas.pedidosPorDia && estadisticas.pedidosPorDia.length > 0 ? (
              <>
                {/* Resumen del período */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200">
                    <p className="text-sm text-blue-700 font-medium">Total Pedidos</p>
                    <p className="text-3xl font-bold text-blue-600">{estadisticas.totalPedidos}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-200">
                    <p className="text-sm text-green-700 font-medium">Ventas Totales</p>
                    <p className="text-3xl font-bold text-green-600">${estadisticas.totalVentas?.toLocaleString()}</p>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border-2 border-yellow-200">
                    <p className="text-sm text-yellow-700 font-medium">Pendientes</p>
                    <p className="text-3xl font-bold text-yellow-600">{estadisticas.pendientes}</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border-2 border-purple-200">
                    <p className="text-sm text-purple-700 font-medium">Completados</p>
                    <p className="text-3xl font-bold text-purple-600">{estadisticas.completados}</p>
                  </div>
                </div>

                {/* Gráfica de líneas - Pedidos por día */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Pedidos por Día</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={estadisticas.pedidosPorDia}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="cantidad" stroke="#8B5CF6" strokeWidth={2} name="Pedidos" />
                      <Line type="monotone" dataKey="total" stroke="#10B981" strokeWidth={2} name="Ventas ($)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfica de barras - Estado de pedidos por día */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Estado de Pedidos por Día</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={estadisticas.pedidosPorDia}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="pendientes" fill="#FBBF24" name="Pendientes" />
                      <Bar dataKey="completados" fill="#10B981" name="Completados" />
                      <Bar dataKey="cancelados" fill="#EF4444" name="Cancelados" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfica de pastel - Distribución de estados */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Distribución de Estados</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pendientes', value: estadisticas.pendientes },
                          { name: 'Completados', value: estadisticas.completados },
                          { name: 'Cancelados', value: estadisticas.cancelados }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">No hay datos disponibles para el período seleccionado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
