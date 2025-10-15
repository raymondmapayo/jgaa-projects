/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CheckCircleOutlined,
  FilterOutlined,
  FolderOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Input,
  Menu,
  notification,
  Table,
  Tooltip,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import styled from "styled-components";
import OrderDetailsModal from "../WorkerModals/OrderDetailsModal";
import ValidationEditTabsModal from "../WorkerModals/ValidationEditModalTabs";

// ====================== Styled Components ======================
const StyledContainer = styled.div`
  width: 100%;
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08);
  transition: background-color 0.3s ease;
  margin: 0 auto;

  .dark & {
    background-color: #001f3f;
    color: white;
  }

  /* ===== Mobile full-stretch ===== */
  @media (max-width: 1024px) {
    border-radius: 0;
    box-shadow: none;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
    padding: 16px;
  }
`;

const StyledTable = styled(Table)`
  width: 100%;
  .ant-table {
    width: 100%;
  }

  .ant-table-thead > tr > th {
    background: #f9fafb;
    font-weight: bold;
    color: #374151;
  }

  tr:hover td {
    background-color: #f9fafb !important;
  }

  /* Make table responsive on smaller screens */
  @media (max-width: 1024px) {
    font-size: 13px;
    .ant-table-content {
      overflow-x: auto;
    }
  }
`;

const ActionButton = styled(Button)`
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  &:hover {
    transform: scale(1.05);
  }
`;

const WorkerManageOrder = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // ✅ States for combined Validation & Edit tab modal
  const [isValidationEditVisible, setIsValidationEditVisible] = useState(false);
  const [selectedOrderForValidation, setSelectedOrderForValidation] =
    useState<any>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  // Handler to fetch transaction and open combined Validate & Edit modal
  const handleValidateEdit = (record: any) => {
    axios
      .get(`${apiUrl}/fetch_transaction/${record.user_id}`)
      .then((res) => {
        const transactions = res.data.transactions;

        if (!transactions || transactions.length === 0) {
          notification.warning({
            message: "Transaction Not Found",
            description: `No transaction found for this order.`,
          });
          setSelectedOrderForValidation(record);
          setSelectedTransaction(null);
          setIsValidationEditVisible(true);
          return;
        }

        // Get most recent transaction
        const transaction = transactions[0];

        setSelectedOrderForValidation(record);
        setSelectedTransaction(transaction);
        setIsValidationEditVisible(true);

        // Optional: double check if status matches
        if (
          transaction.status.toLowerCase() !==
          record.payment_status.toLowerCase()
        ) {
          notification.info({
            message: "Status Mismatch",
            description: `Order payment status (${record.payment_status}) does not exactly match the latest transaction status (${transaction.status}).`,
          });
        }
      })
      .catch((err) => {
        console.error("Error fetching transaction:", err);
        notification.error({
          message: "Error Fetching Transaction",
          description:
            "An error occurred while fetching the transaction. Please try again.",
        });
      });
  };

  useEffect(() => {
    axios
      .get(`${apiUrl}/fetch_orders`)
      .then((response) => {
        setOrders(response.data.orders);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
      });
  }, []);

  const handleViewDetails = (record: any) => {
    setSelectedOrder(record);
    axios
      .get(`${apiUrl}/fetch_order_items/${record.order_id}`)
      .then((response) => {
        setOrderItems(response.data.orderItems);
        setIsModalVisible(true);
      })
      .catch((error) => {
        console.error("Error fetching order items:", error);
      });
  };

  const formatDateWithTime = (dateString: string) => {
    const date = new Date(dateString);
    const datePart = date.toISOString().split("T")[0];
    const timePart = date
      .toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();
    return `${datePart} ${timePart}`;
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
    setOrderItems([]);
  };

  const calculateTotal = () =>
    orderItems.reduce((total, item) => total + item.final_total, 0);

  const columns = [
    {
      title: "Order ID",
      dataIndex: "order_id",
      key: "order_id",
      render: (order_id: string) => `${order_id}`,
    },
    {
      title: "Customer",
      dataIndex: "fname",
      key: "fname",
      render: (_text: string, record: any) => (
        <div className="flex items-center gap-3 min-w-[180px]">
          <img
            src={
              record.profile_pic && record.profile_pic !== ""
                ? `${apiUrl}/uploads/images/${record.profile_pic}`
                : "/avatar.jpg"
            }
            alt={`${record.fname} ${record.lname}`}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <span className="font-medium text-sm sm:text-base">{`${record.fname} ${record.lname}`}</span>
        </div>
      ),
    },
    {
      title: "Order Date",
      dataIndex: "order_date",
      key: "order_date",
      render: (order_date: string) => formatDateWithTime(order_date),
    },
    {
      title: "Payment Status",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (status: string) => {
        const formattedStatus =
          status.charAt(0).toUpperCase() + status.slice(1);
        const colors: Record<string, string> = {
          Pending: "text-yellow-500",
          Paid: "text-green-500",
        };
        return (
          <span
            className={`${
              colors[formattedStatus] || "text-gray-500"
            } font-bold`}
          >
            {formattedStatus}
          </span>
        );
      },
    },
    {
      title: "Updated By",
      dataIndex: "created_by",
      key: "created_by",
      render: (_: any, record: any) => {
        const hasName = record.worker_fname && record.worker_lname;

        return (
          <div className="flex items-center gap-3 min-w-[180px]">
            <img
              src={
                record.worker_profile_pic && record.worker_profile_pic !== ""
                  ? `${apiUrl}/uploads/images/${record.worker_profile_pic}`
                  : "/avatar.jpg"
              }
              alt={
                hasName
                  ? `${record.worker_fname} ${record.worker_lname}`
                  : "No user"
              }
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <span className="font-medium text-sm sm:text-base">
              {hasName
                ? `${record.worker_fname} ${record.worker_lname}`
                : "Not yet updated"}
            </span>
          </div>
        );
      },
    },

    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          <Tooltip title="View Order Details">
            <ActionButton
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>

          {/* ✅ Single button for Validate & Edit */}
          <Tooltip title="Validate & Edit">
            <ActionButton
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleValidateEdit(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <StyledContainer>
      {/* Header */}
      <div className="mb-6">
        {/* Header top row: title + description */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold">Order List</h2>
            <p className="text-gray-500 text-sm">
              Manage and track customer orders
            </p>
          </div>
        </div>

        {/* Search + Actions row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search */}
          <Input
            placeholder="Search orders"
            prefix={<SearchOutlined />}
            className="w-full sm:w-1/4 bg-gray-100 dark:bg-[#1f2937] dark:text-white custom-placeholder"
          />

          {/* Right-side buttons */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* Archived */}
            <Button
              className="bg-red-500 text-white hover:bg-red-600 focus:ring-4 focus:ring-red-300 rounded-md w-full sm:w-[140px] text-center"
              icon={<FolderOutlined />}
            >
              Archived
            </Button>

            {/* Sort */}
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="1">Sort by Date</Menu.Item>
                  <Menu.Item key="2">Sort by Status</Menu.Item>
                </Menu>
              }
              trigger={["click"]}
            >
              <Button
                icon={<FilterOutlined />}
                className="w-full sm:w-[140px] px-4 py-1.5 text-center"
              >
                Sort
              </Button>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto lg:overflow-x-hidden">
        <StyledTable
          dataSource={orders}
          columns={columns}
          pagination={{ pageSize: 5, showSizeChanger: false }}
          scroll={{ x: true }}
        />
      </div>

      {/* ✅ Combined Validation & Edit Modal */}
      <ValidationEditTabsModal
        isVisible={isValidationEditVisible}
        onClose={() => setIsValidationEditVisible(false)}
        order={selectedOrderForValidation}
        transaction={selectedTransaction}
        onUpdateOrder={(updatedOrder) => {
          setOrders((prevOrders) =>
            prevOrders.map((o) =>
              o.order_id === updatedOrder.order_id ? updatedOrder : o
            )
          );
        }}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        isVisible={isModalVisible}
        order={selectedOrder}
        orderItems={orderItems}
        onClose={handleCloseModal}
        formatDateWithTime={formatDateWithTime}
        calculateTotal={calculateTotal}
      />
    </StyledContainer>
  );
};

export default WorkerManageOrder;
