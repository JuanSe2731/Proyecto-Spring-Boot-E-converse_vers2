import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const VendedorRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar si el usuario es vendedor
  const isVendedor = user?.rol?.nombre === 'Vendedor';

  if (!isVendedor) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default VendedorRoute;
