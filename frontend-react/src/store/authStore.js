import { create } from 'zustand';
import { authService } from '../services';

const useAuthStore = create((set) => ({
  // Estado
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  // Acciones
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify(data.usuario));
      
      set({
        user: data.usuario,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register(userData);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al registrar usuario';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  loadUserFromStorage: () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        set({
          user,
          token,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  },

  fetchUserInfo: async () => {
    set({ isLoading: true });
    try {
      const userData = await authService.getUserInfo();
      localStorage.setItem('userData', JSON.stringify(userData));
      set({ user: userData, isLoading: false });
      return { success: true, user: userData };
    } catch (error) {
      set({ isLoading: false });
      return { success: false };
    }
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),

  // Utilidades
  isAdmin: () => {
    const state = useAuthStore.getState();
    return state.user?.rol?.nombre === 'Administrador';
  },

  isClient: () => {
    const state = useAuthStore.getState();
    return state.user?.rol?.nombre === 'Cliente';
  },
}));

export default useAuthStore;
