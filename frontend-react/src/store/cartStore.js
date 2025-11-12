import { create } from 'zustand';
import { carritoService } from '../services';

const useCartStore = create((set, get) => ({
  // Estado
  items: [],
  isLoading: false,
  error: null,
  isOpen: false,

  // Computed
  get itemCount() {
    return get().items.reduce((total, item) => total + item.cantidad, 0);
  },

  get subtotal() {
    return get().items.reduce(
      (total, item) => total + item.producto.precio * item.cantidad,
      0
    );
  },

  get tax() {
    return get().subtotal * 0.19; // IVA 19%
  },

  get total() {
    return get().subtotal + get().tax;
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

  updateItemQuantity: async (itemId, cantidad) => {
    if (cantidad < 1) return;
    
    set({ isLoading: true, error: null });
    try {
      await carritoService.actualizar(itemId, cantidad);
      await get().fetchCartItems();
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar cantidad';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  removeItem: async (itemId) => {
    set({ isLoading: true, error: null });
    try {
      await carritoService.eliminar(itemId);
      await get().fetchCartItems();
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar producto';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  clearCart: () => {
    set({ items: [], error: null });
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
