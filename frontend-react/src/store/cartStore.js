import { create } from 'zustand';
import { carritoService, pedidoService } from '../services';

const useCartStore = create((set, get) => ({
  // Estado
  items: [],
  isLoading: false,
  error: null,
  isOpen: false,

  // Getters computados
  itemCount: () => {
    return get().items.reduce((total, item) => total + item.cantidad, 0);
  },

  subtotal: () => {
    return get().items.reduce(
      (total, item) => total + item.producto.precio * item.cantidad,
      0
    );
  },

  tax: () => {
    const subtotalValue = get().items.reduce(
      (total, item) => total + item.producto.precio * item.cantidad,
      0
    );
    return Math.round(subtotalValue * 0.19);
  },

  total: () => {
    const subtotalValue = get().items.reduce(
      (total, item) => total + item.producto.precio * item.cantidad,
      0
    );
    const taxValue = Math.round(subtotalValue * 0.19);
    return subtotalValue + taxValue;
  },

  // Acciones
  fetchCartItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await carritoService.getMisItems();
      set({ items, isLoading: false });
    } catch (error) {
      console.error('Error fetching cart items:', error);
      set({ error: 'Error al cargar el carrito', isLoading: false });
    }
  },

  addItem: async (productoId, cantidad = 1) => {
    set({ isLoading: true, error: null });
    try {
      await carritoService.agregar(productoId, cantidad);
      await get().fetchCartItems();
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al agregar producto';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateItemQuantity: async (productoId, cantidad) => {
    if (cantidad < 1) return;
    
    set({ isLoading: true, error: null });
    try {
      await carritoService.actualizar(productoId, cantidad);
      await get().fetchCartItems();
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar cantidad';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  removeItem: async (productoId) => {
    set({ isLoading: true, error: null });
    try {
      await carritoService.eliminar(productoId);
      await get().fetchCartItems();
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar producto';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  clearCart: async () => {
    try {
      await carritoService.vaciar();
      set({ items: [], error: null });
    } catch (error) {
      console.error('Error al vaciar carrito:', error);
      // Aunque falle el backend, limpiar el estado local
      set({ items: [], error: null });
    }
  },

  // Crear pedido desde el carrito
  checkout: async (user) => {
    set({ isLoading: true, error: null });
    try {
      const currentItems = get().items;
      
      if (currentItems.length === 0) {
        throw new Error('El carrito está vacío');
      }

      // Preparar los items del pedido según el modelo ItemPedido
      const productos = currentItems.map(item => ({
        idProducto: item.producto.idProducto,
        nombreProducto: item.producto.nombre,
        precioUnitario: item.producto.precio,
        cantidad: item.cantidad,
        subtotal: item.producto.precio * item.cantidad
      }));

      // Calcular el total (solo la suma de los productos, sin impuesto adicional)
      const totalValue = currentItems.reduce(
        (total, item) => total + (item.producto.precio * item.cantidad),
        0
      );

      // Crear el pedido según el modelo Pedido
      const pedidoData = {
        usuario: {
          idUsuario: user.idUsuario,
          nombre: user.nombre,
          email: user.email || user.correo
        },
        productos: productos,
        total: totalValue,
        estado: 'Pendiente'
      };

      console.log('Enviando pedido:', pedidoData);

      // Crear el pedido en el backend
      const pedidoCreado = await pedidoService.create(pedidoData);
      
      console.log('Pedido creado exitosamente:', pedidoCreado);
      
      // Vaciar el carrito en el backend y frontend
      await get().clearCart();
      
      set({ isLoading: false });
      
      return { success: true, pedido: pedidoCreado };
    } catch (error) {
      console.error('Error al crear pedido:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al procesar el pedido';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  toggleCart: () => {
    set((state) => ({ isOpen: !state.isOpen }));
  },

  openCart: () => {
    set({ isOpen: true });
  },

  closeCart: () => {
    set({ isOpen: false });
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useCartStore;
