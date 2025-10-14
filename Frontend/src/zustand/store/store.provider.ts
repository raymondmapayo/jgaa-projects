/* eslint-disable @typescript-eslint/no-explicit-any */
import useStore from "./store";
const selector = (key: string) => (state: any) => state[key];
const storeProvider = useStore.getState();
export const {
  saveworkerInfo,
  saveClientInfo,
  logoutworker,
  logoutClient,
  addToCart,
  incrementCartItem,
  decrementCartItem,
  deleteCartItem,
  saveadminInfo,
  logoutadmin,
  reserveTable,
} = storeProvider;

export { selector, storeProvider, useStore };
