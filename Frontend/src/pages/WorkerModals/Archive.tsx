import { UploadOutlined } from "@ant-design/icons";
import { Button, Modal, Table, Tooltip } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

interface ArchiveProps {
  isArchivedModalVisible: boolean;
  onClose: () => void;
}

interface ArchivedCategoryItem {
  categories_id: number;
  categories_name: string;
  categories_img: string;
  description: string;
  status: string;
}

const Archive = ({ isArchivedModalVisible, onClose }: ArchiveProps) => {
  const [archivedCategories, setArchivedCategories] = useState<
    ArchivedCategoryItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    let isMounted = true; // ✅ Prevent state updates on unmounted component

    const fetchArchivedCategories = async () => {
      try {
        const response = await axios.get(`${apiUrl}/get_archived`, {
          headers: { "Cache-Control": "no-cache" },
        });
        if (isMounted) {
          setArchivedCategories(response.data);
        }
      } catch (error) {
        console.error("Error fetching archived categories:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchArchivedCategories(); // Initial load

    // ✅ Poll every 10 seconds (not 10 ms)
    const interval = setInterval(fetchArchivedCategories, 10000);

    // ✅ Cleanup on unmount
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [apiUrl]);

  const handleRestore = async (categories_id: number) => {
    Modal.confirm({
      title: "Are you sure you want to restore this category?",
      content: "This will restore the category back to active status.",
      okText: "Yes, Restore",
      okType: "primary",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await axios.post(`${apiUrl}/restore_category/${categories_id}`);
          setArchivedCategories((prevData) =>
            prevData.filter((item) => item.categories_id !== categories_id)
          );
        } catch (error) {
          console.error("Error restoring category:", error);
        }
      },
    });
  };

  const columns = [
    {
      title: "Category ID",
      dataIndex: "categories_id",
      key: "categories_id",
    },
    {
      title: "Category Name",
      dataIndex: "categories_name",
      key: "categories_name",
      render: (text: any, record: any) => (
        <div className="flex items-center gap-3">
          <img
            src={`${apiUrl}/uploads/images/${record.categories_img}`}
            alt={record.categories_name}
            className="w-10 h-10 rounded"
          />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span className="font-bold text-red-500">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Tooltip title="Restore Category">
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => handleRestore(record.categories_id)}
          >
            Restore
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <Modal
      title="Archived Categories"
      visible={isArchivedModalVisible}
      onCancel={onClose}
      footer={null}
      width="100%" // Make modal full width
      style={{ maxWidth: "1000px" }} // Max width for the modal
    >
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <Table
          dataSource={archivedCategories}
          columns={columns}
          rowKey="categories_id"
          pagination={{ pageSize: 3 }}
          scroll={{ x: true }} // Enable horizontal scrolling if necessary
          style={{ width: "100%" }} // Ensure the table takes full width of its container
        />
      )}
    </Modal>
  );
};

export default Archive;
