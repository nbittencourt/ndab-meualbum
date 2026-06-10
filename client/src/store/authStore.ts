import { create } from 'zustand';
import type { User } from '@meualbum/shared';
import { authApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  setReady: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  checkAuth: async () => {
    try {
      const { user } = await authApi.me();
      set({ user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  setReady: () => set({ isLoading: false }),

  login: async (email, password) => {
    const { user } = await authApi.login(email, password);
    set({ user });
  },

  logout: async () => {
    await authApi.logout();
    set({ user: null });
  },

  setUser: (user) => set({ user }),
}));
