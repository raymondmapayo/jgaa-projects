import WorkerAnnouncementView from "./WorkerAnnouncement"; // Adjust the path as necessary
import WorkerChat from "./WorkerChat"; // Adjust the path as necessary

const WorkerDashboard = () => {
  return (
    <div className="flex pb-4">
      {/* Worker Chat (Left) */}
      <div className="w-1/2 bg-white border-r shadow-r-md p-4">
        <WorkerChat />
      </div>

      {/* Worker Announcements (Right) */}
      <div className="w-1/2 bg-white shadow-r-md p-4">
        <WorkerAnnouncementView />
      </div>
    </div>
  );
};

export default WorkerDashboard;
