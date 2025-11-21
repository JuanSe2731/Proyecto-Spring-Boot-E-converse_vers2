import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';

// Páginas públicas
import Login from './pages/Login';
import Register from './pages/Register';

// Páginas del cliente
import ClientDashboard from './pages/client/Dashboard';
import Cart from './pages/client/Cart';

// Páginas del admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsuarios from './pages/admin/Usuarios';
import AdminRoles from './pages/admin/Roles';
import AdminCategorias from './pages/admin/Categorias';
import AdminProductos from './pages/admin/Productos';
import AdminPedidos from './pages/admin/Pedidos';

// Páginas del vendedor
import VendedorDashboard from './pages/vendedor/Dashboard';
import VendedorProductos from './pages/vendedor/Productos';

// Componentes de protección de rutas
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import VendedorRoute from './components/VendedorRoute';
import CartSidebar from './components/CartSidebar';
import Notification from './components/Notification';

function App() {
  const { loadUserFromStorage } = useAuthStore();

  useEffect(() => {
    // Cargar usuario desde localStorage al iniciar la app
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  return (
    <BrowserRouter>
      <Notification />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas del cliente (dashboard público) */}
        <Route path="/dashboard" element={<ClientDashboard />} />
        
        {/* Carrito requiere autenticación */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        {/* Rutas del administrador (protegidas y solo admin) */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <AdminRoute>
              <AdminUsuarios />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <AdminRoute>
              <AdminRoles />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/categorias"
          element={
            <AdminRoute>
              <AdminCategorias />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/productos"
          element={
            <AdminRoute>
              <AdminProductos />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/pedidos"
          element={
            <AdminRoute>
              <AdminPedidos />
            </AdminRoute>
          }
        />

        {/* Rutas del vendedor (protegidas y solo vendedor) */}
        <Route
          path="/vendedor"
          element={
            <VendedorRoute>
              <VendedorDashboard />
            </VendedorRoute>
          }
        />
        <Route
          path="/vendedor/productos"
          element={
            <VendedorRoute>
              <VendedorProductos />
            </VendedorRoute>
          }
        />

        {/* Ruta por defecto - redirige al dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404 - Ruta no encontrada */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* Carrito lateral global */}
      <CartSidebar />
    </BrowserRouter>
  );
}

export default App;
