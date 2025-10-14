/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Modal } from "antd";
import React from "react";
import styled from "styled-components";

// Styled component
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
  .creator-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid #e5e7eb;
  }
  .creator-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #4b5563;
  }
  .creator-name {
    font-weight: 600;
    font-size: 16px;
  }
`;

interface ViewInventoryModalProps {
  visible: boolean;
  selectedItem?: any | null;
  onClose: () => void;
}
const apiUrl = import.meta.env.VITE_API_URL;
const ViewInventoryModal: React.FC<ViewInventoryModalProps> = ({
  visible,
  selectedItem,
  onClose,
}) => {
  return (
    <Modal
      title={`Inventory Details: ${selectedItem?.product_name || ""}`}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={600}
    >
      {selectedItem && (
        <StyledModalContent>
          <div className="details-row">
            <span className="details-label">Product Name:</span>
            <span>{selectedItem.product_name}</span>
          </div>
          <div className="details-row">
            <span className="details-label">Category:</span>
            <span>{selectedItem.category}</span>
          </div>

          <div className="details-row">
            <span className="details-label">Stock In:</span>
            <span>{selectedItem.stock_in}</span>
          </div>
          <div className="details-row">
            <span className="details-label">Stock Out:</span>
            <span>{selectedItem.stock_out}</span>
          </div>
          <div className="details-row">
            <span className="details-label">Unit:</span>
            <span>{selectedItem.unit}</span>
          </div>
          <div className="details-row">
            <span className="details-label">Price:</span>
            <span>{selectedItem.price}</span>
          </div>
          <div className="details-row">
            <span className="details-label">Status:</span>
            <span>{selectedItem.status}</span>
          </div>

          {/* Creator Info */}
          <div className="creator-info">
            <img
              src={`${apiUrl}/uploads/images/${selectedItem.profile_pic}`}
              alt={`${selectedItem.fname} ${selectedItem.lname}`}
              className="creator-avatar"
            />
            <span className="creator-name">{`${selectedItem.fname} ${selectedItem.lname}`}</span>
          </div>
        </StyledModalContent>
      )}
    </Modal>
  );
};

export default ViewInventoryModal;
