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
  const [checkedItems, setCheckedItems] = useState({
    terms: false,
    legitBooking: false,
    showUp: false,
  });

  const allChecked = Object.values(checkedItems).every(Boolean);

  const handleSubmit = () => {
    if (!allChecked) {
      message.warning("Please agree to all terms to proceed.");
      return;
    }

    // Save acceptance so modal won't pop up again in this session
    sessionStorage.setItem("reservation_terms_accepted", "true");

    // Hide modal
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
          checked={checkedItems.terms}
          onChange={(e) =>
            setCheckedItems({ ...checkedItems, terms: e.target.checked })
          }
        >
          I agree to the terms and conditions
        </Checkbox>

        <Checkbox
          checked={checkedItems.legitBooking}
          onChange={(e) =>
            setCheckedItems({ ...checkedItems, legitBooking: e.target.checked })
          }
        >
          I confirm that I am making a genuine reservation and not a fake
          booking
        </Checkbox>

        <Checkbox
          checked={checkedItems.showUp}
          onChange={(e) =>
            setCheckedItems({ ...checkedItems, showUp: e.target.checked })
          }
        >
          I understand that if I do not show up within 30 minutes of my reserved
          time, my booking will expire
        </Checkbox>

        <div className="mt-4 text-right">
          <Button type="primary" onClick={handleSubmit} disabled={!allChecked}>
            Submit
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReservationTermsConditionModal;
