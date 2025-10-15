// src/components/ProfileWorker/index.tsx
import { Tabs } from "antd";
import ProfileSettings from "./ProfileSettings";
import SecuritySettings from "./SecuritySettings";

const { TabPane } = Tabs;

const ProfileWorker = () => {
  const user_id = sessionStorage.getItem("user_id");

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-white">
        My Profile Settings
      </h1>

      <Tabs defaultActiveKey="1" className="w-full">
        <TabPane tab="Profile" key="1">
          <ProfileSettings user_id={user_id} />
        </TabPane>

        <TabPane tab="Security" key="2">
          <SecuritySettings user_id={user_id} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProfileWorker;
