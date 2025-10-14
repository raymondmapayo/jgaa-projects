import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  createAdminSlice,
  createClientSlice,
  createWorkerSlice,
} from "../slices";
import { AdminSlice } from "../slices/admin";
import { ClientSlice } from "../slices/client";
import { WorkerSlice } from "../slices/worker";

type TAppSlices = ClientSlice & AdminSlice & WorkerSlice;
const useStore = create<TAppSlices>()(
  devtools(
    persist(
      (...args) => ({
        ...createClientSlice(...args),
        ...createAdminSlice(...args),
        ...createWorkerSlice(...args),
      }),
      {
        name: "JGAA",
      }
    )
  )
);

export default useStore;
