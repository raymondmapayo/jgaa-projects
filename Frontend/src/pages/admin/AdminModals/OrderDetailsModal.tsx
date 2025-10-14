/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal } from "antd";
import styled from "styled-components";

const StyledModalContent = styled.div`
  .details-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
  }
  .details-label {
    font-weight: 600;
    color: #4b5563;
  }
  ul li {
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 8px;
  }
`;

interface OrderDetailsModalProps {
  isVisible: boolean;
  order: any;
  orderItems: any[];
  onClose: () => void;
  formatDateWithTime: (dateString: string) => string;
  calculateTotal: () => number;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isVisible,
  order,
  orderItems,
  onClose,
  formatDateWithTime,
  calculateTotal,
}) => {
  return (
    <Modal
      title={`Order Details: ORD${order?.order_id || ""}`}
      open={isVisible}
      onCancel={onClose}
      footer={null}
    >
      {order && (
        <StyledModalContent>
          <div className="details-row">
            <span className="details-label">Customer:</span>
            <span>{`${order.fname} ${order.lname}`}</span>
          </div>
          <div className="details-row">
            <span className="details-label">Order Date:</span>
            <span>{formatDateWithTime(order.order_date)}</span>
          </div>
          <div className="details-row">
            <span className="details-label">Payment Status:</span>
            <span>{order.payment_status}</span>
          </div>
          <div className="details-row">
            <span className="details-label">Order Status:</span>
            <span>{order.order_status}</span>
          </div>
          <div className="details-row font-bold text-lg text-green-600">
            <span>Total:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>

          <h3 className="mt-4 font-bold">Products:</h3>
          <ul className="space-y-3">
            {orderItems.map((product: any, index: number) => (
              <li key={index} className="flex gap-3 items-center">
                <img
                  src={`http://localhost:8081/uploads/images/${product.menu_img}`}
                  alt={product.item_name}
                  className="w-12 h-12 rounded object-cover"
                />
                <div>
                  <p className="font-semibold">{product.item_name}</p>
                  <p className="text-sm text-gray-600">
                    Quantity: {product.order_quantity}
                  </p>
                  <p className="text-sm text-gray-600">
                    Price: ${product.price}
                  </p>
                  <p className="text-sm text-gray-600">Sizes: {product.size}</p>
                </div>
              </li>
            ))}
          </ul>
        </StyledModalContent>
      )}
    </Modal>
  );
};

export default OrderDetailsModal;
