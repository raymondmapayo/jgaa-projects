import { Outlet } from "react-router-dom";
import { ClientHeader } from "../components/client/Header";
import Message from "../components/client/Message";
import useStore from "../zustand/store/store";
import { selector } from "../zustand/store/store.provider";
// ClientLayout.tsx

const ClientLayout = () => {
  const client = useStore(selector("client"));

  return (
    <div
      className=" pt-10       
        sm:pt-19   
        md:pt-20   "
    >
      <ClientHeader />
      <main className="w-full">
        <Outlet />
      </main>
      {client?.isAuthenticated && <Message />}
    </div>
  );
};

export default ClientLayout;
