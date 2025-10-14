import { Layout } from "antd";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import WorkerHeader from "../components/worker/WorkerHeader";
import WorkerSidebar from "../components/worker/WorkerSidebar";

import { StyledContent, StyledHeader, StyledLayout } from "../styled/worker";

const WorkerLayout = () => {
  const [collapsed, setCollapsed] = useState(false); // Default to open

  // Load saved state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    } else {
      setCollapsed(false); // default open
    }
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  // Automatically collapse on mobile (<768px) only on first load
  useEffect(() => {
    if (window.innerWidth < 768) {
      setCollapsed(true);
    }
  }, []);

  const handleMenuToggle = () => {
    setCollapsed((prev) => !prev);
  };
  return (
    <StyledLayout>
      <WorkerSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      {/* Dark overlay for mobile */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setCollapsed(true)}
        ></div>
      )}
      <Layout>
        <StyledHeader>
          <WorkerHeader onMenuToggle={handleMenuToggle} />
        </StyledHeader>
        <StyledContent>
          <Outlet />
        </StyledContent>
      </Layout>
    </StyledLayout>
  );
};

export default WorkerLayout;
