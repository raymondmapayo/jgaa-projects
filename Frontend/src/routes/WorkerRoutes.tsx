import { lazy } from "react";

export const WorkerRoutes = [
  {
    path: "/Worker/Dashboard",
    component: lazy(() => import("../pages/worker/WorkerDashboard")),
  },
  {
    path: "/Worker/Manage/Menu",
    component: lazy(() => import("../pages/worker/WorkerManageMenu")),
  },
  {
    path: "/Worker/Manage/Order",
    component: lazy(() => import("../pages/worker/WorkerManageOrder")),
  },
  {
    path: "/Worker/Manage/Reservation",
    component: lazy(() => import("../pages/worker/WorkerReservation")),
  },
  {
    path: "/Worker/Manage/Inventory",
    component: lazy(() => import("../pages/worker/WorkerManageInventory")),
  },
  {
    path: "/Worker/AnalyticsReports",
    component: lazy(() => import("../pages/worker/WorkerAnalyticsInsights")),
  },
  {
    path: "/Worker/Manage/Chats",
    component: lazy(() => import("../pages/worker/WorkerChat")),
  },

  {
    path: "/Worker/Manage/Categories",
    component: lazy(() => import("../pages/worker/WorkerManageCategories")),
  },
  {
    path: "/Worker/Manage/MyProfile",
    component: lazy(() => import("../components/worker/ProfileWorker")),
  },
  {
    path: "/Worker/Manage/Supply",
    component: lazy(() => import("../pages/worker/WorkerSupply")),
  },
  {
    path: "/Worker/Manage/Ingredients",
    component: lazy(() => import("../pages/worker/WorkerIngredients")),
  },
  {
    path: "/Worker/Manage/SupplyCategories",
    component: lazy(
      () => import("../pages/worker/WorkerManageSupplyCategories")
    ),
  },
];
