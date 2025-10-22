// ReservationTermsConditionModal.tsx
import React, { useState } from "react";
import { Modal, Checkbox, Button, message } from "antd";

interface ReservationTermsConditionModalProps {
  visible: boolean;
  onClose: () => void;
}

const ReservationTermsConditionModal: React.FC<
  ReservationTermsConditionModalProps
> = ({ visible, onClose }) => {
  const [checked, setChecked] = useState(false);

  const handleSubmit = () => {
    if (!checked) {
      message.warning("Please agree to the terms to proceed.");
      return;
    }

    sessionStorage.setItem("reservation_terms_accepted", "true");
    onClose();
    message.success("Thank you for accepting the terms!");
  };

  return (
    <Modal
      title="Reservation Terms & Conditions"
      visible={visible}
      footer={null}
      closable={false}
      centered
    >
      <div className="space-y-4">
        <Checkbox
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        >
          I agree to the terms and conditions. I understand that if I don’t
          arrive within 30 minutes of my reserved time, my booking will be
          automatically canceled.
        </Checkbox>

        <div className="mt-4 text-right">
          <Button type="primary" onClick={handleSubmit} disabled={!checked}>
            Submit
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReservationTermsConditionModal;
