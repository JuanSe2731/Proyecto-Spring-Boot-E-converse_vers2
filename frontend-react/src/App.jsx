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

// Componentes de protección de rutas
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  const { loadUserFromStorage } = useAuthStore();

  useEffect(() => {
    // Cargar usuario desde localStorage al iniciar la app
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas del cliente (protegidas) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
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

        {/* Ruta por defecto */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* 404 - Ruta no encontrada */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
