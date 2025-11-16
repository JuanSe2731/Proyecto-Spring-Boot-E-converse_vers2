import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightOnRectangleIcon, HomeIcon } from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';

const AdminLayout = ({ children, title, showBackButton = true }) => {
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
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="container-main py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/')}
              className="btn-secondary flex items-center space-x-2"
              title="Ir a la página de inicio"
            >
              <HomeIcon className="h-5 w-5" />
              <span className="hidden md:inline">Inicio</span>
            </button>
            {showBackButton && (
              <button
                onClick={() => navigate('/admin')}
                className="btn-secondary flex items-center space-x-2"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span className="hidden md:inline">Volver</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="btn-danger flex items-center space-x-2"
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

export default AdminLayout;
