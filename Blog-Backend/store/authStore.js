import axios from "axios";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      checkAuth: async () => {
        try {
          set({ loading: true, error: null });
          const res = await axios.get("http://localhost:4000/common-api/check-auth", {
            withCredentials: true,
          });

          set({
            currentUser: res.data?.payload ?? null,
            isAuthenticated: true,
            loading: false,
          });
        } catch (err) {
          if (err.response?.status === 401) {
            set({
              currentUser: null,
              isAuthenticated: false,
              loading: false,
              error: null,
            });
            return;
          }

          set({
            loading: false,
            error: err.response?.data?.message || "Auth check failed",
          });
        }
      },
    }),
    {
      name: "blogapp-auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = Boolean(state.currentUser);
        }
      },
    }
  )
);

export default useAuthStore;
