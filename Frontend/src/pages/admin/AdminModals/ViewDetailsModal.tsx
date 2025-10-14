// components/ViewDetailsModal.tsx
import { Button, Modal } from "antd";
import React from "react";

interface ViewDetailsModalProps {
  isVisible: boolean;
  selectedItem: any;
  onClose: () => void;
}

const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({
  isVisible,
  selectedItem,
  onClose,
}) => {
  return (
    <Modal
      title="Food Details"
      visible={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      {selectedItem && (
        <div>
          <p>
            <strong>Food Name:</strong> {selectedItem.foodName}
          </p>
          <p>
            <strong>Category:</strong> {selectedItem.categories_name}
          </p>
          <p>
            <strong>Price:</strong> {selectedItem.price}
          </p>
          <p>
            <strong>Description:</strong> {selectedItem.description}
          </p>
          <p>
            <strong>Quantity:</strong> {selectedItem.quantity}
          </p>
          <p>
            <strong>Status:</strong> {selectedItem.status}
          </p>
        </div>
      )}
    </Modal>
  );
};

export default ViewDetailsModal;
