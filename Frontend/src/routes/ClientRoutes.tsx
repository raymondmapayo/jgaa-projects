import { lazy } from "react";

export const ClientRoutes = [
  {
    path: "/reset-password/:token",
    component: lazy(() => import("../routes/ResetPassword")),
  },
  {
    path: "/verify-email/:token",
    component: lazy(() => import("../routes/ConfirmationPage")),
  },
  {
    path: "/",
    component: lazy(() => import("../pages/client/LandingPage")),
  },
  {
    path: "/close",
    component: lazy(() => import("../pages/client/ReservationClose")),
  },
  {
    path: "/dist",
    component: lazy(() => import("../pages/worker/ReservationDisableEnable")),
  },

  {
    path: "/Menus",
    component: lazy(() => import("../pages/client/Menus")),
  },
  {
    path: "/Menus/:type",
    component: lazy(() => import("../pages/client/Shop")),
  },
  {
    path: "/Bestseller/",
    component: lazy(() => import("../pages/client/BestSeller")),
  },
  {
    path: "/Reservation",
    component: lazy(() => import("../pages/client/Reservation")),
  },
  {
    path: "/Contact-Us",
    component: lazy(() => import("../pages/client/Contact")),
  },
  {
    path: "/Menus/:type/:name",
    component: lazy(() => import("../pages/client/ProductInfo")),
  },
  // ✅ Always include these routes (no conditional spread anymore)
  {
    path: "/My-Cart",
    component: lazy(() => import("../pages/client/Cart")),
  },
  {
    path: "/MyPurchase",
    component: lazy(() => import("../pages/client/MyPurchase")),
  },
  {
    path: "/MyFavourates",
    component: lazy(() => import("../pages/client/MyFavourates")),
  },
  {
    path: "*",
    component: lazy(() => import("../pages/client/LandingPage")),
  },
];
