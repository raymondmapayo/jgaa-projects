import { notification } from "antd";
import { type StateCreator } from "zustand/vanilla";

interface WorkerState {
  loading?: boolean;
  info?: any | null;
  isAuthenticated?: boolean;
}

export interface WorkerSlice {
  worker: WorkerState | null;
  saveworkerInfo: (payload: any) => void;
  logoutworker: () => void;
}

const initialState: WorkerState = {
  loading: false,
  info: null,
  isAuthenticated: false,
};

const createWorkerSlice: StateCreator<WorkerSlice> = (set) => ({
  worker: initialState,

  saveworkerInfo: async (payload: any) => {
    try {
      if (!payload || !payload.fname) {
        throw new Error("Invalid login data. Please try again.");
      }

      set((state) => ({
        ...state,
        worker: {
          ...state.worker,
          info: payload,
          isAuthenticated: true,
        },
      }));

      notification.success({
        message: "Login Successful",
        description: `Welcome back, ${payload.fname}!`,
      });
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "An error occurred while logging in.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      notification.error({
        message: "Login Failed",
        description: errorMessage,
      });
    }
  },
  logoutworker: async () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      localStorage.removeItem("fname");
      localStorage.removeItem("email");
      set(() => ({
        worker: initialState,
      }));

      notification.success({
        message: "Logout Successful",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      console.error("Logout error:", error);

      let errorMessage = "An error occurred while logging out.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      notification.error({
        message: "Logout Failed",
        description: errorMessage,
      });
    }
  },
});

export default createWorkerSlice;
