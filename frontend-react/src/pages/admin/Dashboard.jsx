import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { 
  UsersIcon, 
  TagIcon, 
  ShoppingBagIcon, 
  CubeIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

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
      available: false
    },
    {
      title: 'Categorías',
      description: 'Gestionar categorías de productos',
      icon: CubeIcon,
      path: '/admin/categorias',
      color: 'bg-yellow-500',
      available: false
    },
    {
      title: 'Productos',
      description: 'Administrar catálogo de productos',
      icon: ShoppingBagIcon,
      path: '/admin/productos',
      color: 'bg-purple-500',
      available: false
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
          <button
            onClick={logout}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Cerrar Sesión</span>
          </button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white">
            <p className="text-white/80 text-sm mb-2">Total Usuarios</p>
            <p className="text-3xl font-bold">-</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white">
            <p className="text-white/80 text-sm mb-2">Total Productos</p>
            <p className="text-3xl font-bold">-</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white">
            <p className="text-white/80 text-sm mb-2">Pedidos Pendientes</p>
            <p className="text-3xl font-bold">-</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
