import { Button, Modal } from "antd";
import React from "react";

interface ConfirmationModalProps {
  visible: boolean;
  onCancel: () => void;
  onContinue: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onCancel,
  onContinue,
}) => {
  return (
    <Modal
      title="Confirm Checkout"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="continue" type="primary" onClick={onContinue}>
          Continue
        </Button>,
      ]}
    >
      <h3 className="mt-4 font-bold">
        Are you sure you want to continue to buy?
      </h3>
    </Modal>
  );
};

export default ConfirmationModal;
