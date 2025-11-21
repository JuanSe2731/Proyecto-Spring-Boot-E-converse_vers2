import api from './api';

// ===========================
// 🔐 AUTENTICACIÓN
// ===========================

export const authService = {
  // Login (el backend usa 'username' pero nosotros usamos email como username)
  login: async (email, password) => {
    const response = await api.post('/auth/login', { 
      username: email,  // El backend espera 'username' pero usamos el email
      password 
    });
    return response.data;
  },

  // Registro
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Obtener información del usuario autenticado
  getUserInfo: async () => {
    const response = await api.get('/auth/user-info');
    return response.data;
  },

  // Logout (limpiar datos locales)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  },
};

// ===========================
// 👤 USUARIOS
// ===========================

export const usuarioService = {
  getAll: async () => {
    const response = await api.get('/usuario/list');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/usuario/list/${id}`);
    return response.data;
  },

  create: async (usuario) => {
    const response = await api.post('/usuario/new', usuario);
    return response.data;
  },

  update: async (usuario) => {
    const response = await api.put('/usuario/update', usuario);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/usuario/delete/${id}`);
    return response.data;
  },
};

// ===========================
// 🏷️ ROLES
// ===========================

export const rolService = {
  getAll: async () => {
    const response = await api.get('/roles/list');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/roles/list/${id}`);
    return response.data;
  },

  create: async (rol) => {
    const response = await api.post('/roles/new', rol);
    return response.data;
  },

  update: async (rol) => {
    const response = await api.put('/roles/update', rol);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/roles/delete/${id}`);
    return response.data;
  },
};

// ===========================
// 📦 CATEGORÍAS
// ===========================

export const categoriaService = {
  getAll: async () => {
    const response = await api.get('/categorias/list');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/categorias/list/${id}`);
    return response.data;
  },

  create: async (categoria) => {
    const response = await api.post('/categorias/new', categoria);
    return response.data;
  },

  update: async (categoria) => {
    const response = await api.put('/categorias/update', categoria);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/categorias/delete/${id}`);
    return response.data;
  },
};

// ===========================
// 🛍️ PRODUCTOS
// ===========================

export const productoService = {
  getAll: async () => {
    const response = await api.get('/productos/list');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/productos/list/${id}`);
    return response.data;
  },

  create: async (producto) => {
    const response = await api.post('/productos/new', producto);
    return response.data;
  },

  update: async (producto) => {
    const response = await api.put('/productos/update', producto);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/productos/delete/${id}`);
    return response.data;
  },
};

// ===========================
// 🛒 CARRITO
// ===========================

export const carritoService = {
  getMisItems: async () => {
    const response = await api.get('/carrito/mis-items');
    return response.data;
  },

  agregar: async (productoId, cantidad = 1) => {
    const response = await api.post('/carrito/agregar', { productoId, cantidad });
    return response.data;
  },

  actualizar: async (productoId, cantidad) => {
    const response = await api.put(`/carrito/actualizar/${productoId}`, { cantidad });
    return response.data;
  },

  eliminar: async (productoId) => {
    const response = await api.delete(`/carrito/eliminar/${productoId}`);
    return response.data;
  },

  vaciar: async () => {
    const response = await api.delete('/carrito/vaciar');
    return response.data;
  },

  getTotal: async () => {
    const response = await api.get('/carrito/total');
    return response.data;
  },
};

// ===========================
// 📋 PEDIDOS
// ===========================

export const pedidoService = {
  getAll: async () => {
    const response = await api.get('/pedido/list');
    return response.data;
  },

  getMisPedidos: async () => {
    const response = await api.get('/pedido/mis-pedidos');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/pedido/list/${id}`);
    return response.data;
  },

  create: async (pedido) => {
    const response = await api.post('/pedido/new', pedido);
    return response.data;
  },

  update: async (pedido) => {
    const response = await api.put('/pedido/update', pedido);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/pedido/delete/${id}`);
    return response.data;
  },

  getEstadisticas: async (periodo = 'semana') => {
    const response = await api.get(`/pedido/estadisticas?periodo=${periodo}`);
    return response.data;
  },
};
