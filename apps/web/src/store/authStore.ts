import { create } from "zustand";
import type { EnterpriseUser } from "@qaplatform/shared";
import { apiRequest } from "../services/apiClient";

type AuthState = {
  user: EnterpriseUser | null;
  status: "idle" | "checking" | "authenticated" | "anonymous";
  login: (identifier: string, password: string) => Promise<void>;
  register: (fullName: string, identifier: { email?: string; phone?: string }, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",
  login: async (identifier, password) => {
    const { user } = await apiRequest<{ user: EnterpriseUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });
    set({ user, status: "authenticated" });
  },
  register: async (fullName, identifier, password) => {
    const { user } = await apiRequest<{ user: EnterpriseUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ fullName, ...identifier, password }),
    });
    set({ user, status: "authenticated" });
  },
  logout: async () => {
    await apiRequest("/auth/logout", { method: "POST" });
    set({ user: null, status: "anonymous" });
  },
  checkSession: async () => {
    set({ status: "checking" });
    try {
      const { user } = await apiRequest<{ user: EnterpriseUser }>("/auth/me");
      set({ user, status: "authenticated" });
    } catch {
      set({ user: null, status: "anonymous" });
    }
  },
}));
