import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCartIcon, 
  UserIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount, openCart } = useCartStore();

  const handleLogout = () => {
    logout();
    navigate('/dashboard');
  };

  const isAdmin = user?.rol?.nombre === 'Administrador';
  const cartItemCount = itemCount();

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container-main">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-primary-600 to-secondary-600 p-2 rounded-lg">
                <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.64 10.29c-.19-.57-.41-1.14-.66-1.68-.11-.23-.23-.46-.35-.68-.81-1.48-2.05-2.78-3.64-3.81-1.61-1.04-3.56-1.66-5.73-1.82-.35-.03-.71-.05-1.08-.05-1.96 0-3.82.41-5.46 1.14C2.89 4.32 1.59 5.8.87 7.58c-.17.42-.32.85-.43 1.29-.06.23-.11.47-.15.71-.05.32-.08.65-.1.98-.01.16-.01.33-.01.49 0 .28.01.55.04.82.05.51.14 1.01.26 1.49.29 1.16.79 2.24 1.46 3.2.67.96 1.51 1.8 2.48 2.48.97.68 2.05 1.18 3.2 1.46.48.12.98.21 1.49.26.27.03.54.04.82.04.16 0 .33 0 .49-.01.33-.02.66-.05.98-.1.24-.04.48-.09.71-.15.44-.11.87-.26 1.29-.43 1.78-.72 3.26-2.02 4.19-3.85.73-1.64 1.14-3.5 1.14-5.46 0-.37-.02-.73-.05-1.08-.04-.42-.1-.84-.19-1.25z"/>
                  <path d="M16 12.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-8 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" fill="white" opacity="0.3"/>
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                E-converse
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Tu tienda de calzado</p>
            </div>
          </Link>

          {/* Acciones de usuario */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Botón de admin (solo para administradores) */}
                {isAdmin && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                    title="Panel de Administración"
                  >
                    <Cog6ToothIcon className="h-6 w-6" />
                    <span className="hidden md:inline">Admin</span>
                  </button>
                )}

                {/* Carrito */}
                <button
                  onClick={openCart}
                  className="relative flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                  <span className="hidden md:inline">Carrito</span>
                </button>

                {/* Usuario */}
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">{user?.nombre || 'Usuario'}</p>
                    <p className="text-xs text-gray-500">{user?.email || user?.correo}</p>
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
                  title="Cerrar Sesión"
                >
                  <ArrowRightOnRectangleIcon className="h-6 w-6" />
                  <span className="hidden md:inline">Salir</span>
                </button>
              </>
            ) : (
              <>
                {/* Botón de login para usuarios no autenticados */}
                <button
                  onClick={() => navigate('/login')}
                  className="btn-primary flex items-center space-x-2"
                >
                  <UserIcon className="h-5 w-5" />
                  <span>Iniciar Sesión</span>
                </button>
                
                <button
                  onClick={() => navigate('/register')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <span>Registrarse</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
