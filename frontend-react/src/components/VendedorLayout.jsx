import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightOnRectangleIcon, HomeIcon } from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';

const VendedorLayout = ({ children, title, showBackButton = true }) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navegación */}
      <nav className="bg-gradient-to-r from-primary-600 to-secondary-600 shadow-lg sticky top-0 z-40">
        <div className="container-main py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
              title="Ir a la página de inicio"
            >
              <HomeIcon className="h-5 w-5" />
              <span className="hidden md:inline">Inicio</span>
            </button>
            {showBackButton && (
              <button
                onClick={() => navigate('/vendedor')}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span className="hidden md:inline">Volver</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span className="hidden md:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <div className="container-main py-8">
        {children}
      </div>
    </div>
  );
};

export default VendedorLayout;
