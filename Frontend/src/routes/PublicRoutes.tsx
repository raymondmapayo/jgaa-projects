import { Route, Routes } from "react-router-dom";
import Login from "../routes/Login";
import Register from "../routes/Register";

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default PublicRoutes;
