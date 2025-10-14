import { lazy } from "react";

// Adjust the path and import your VerifyPage component
export const RegistrationSuccess = [
  {
    path: "/success", // Path for the email verification page
    component: lazy(() => import("../pages/SentEmail/RegistrationSuccess")), // Lazy loading of VerifyPage
  },
];
