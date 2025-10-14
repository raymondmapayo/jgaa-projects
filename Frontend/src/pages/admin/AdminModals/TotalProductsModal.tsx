import { Modal } from "antd";

interface TotalProductsModalProps {
  visible: boolean;
  onClose: () => void;
  totalProducts: number | null;
  change: string;
}

const TotalProductsModal = ({
  visible,
  onClose,
  totalProducts,
  change,
}: TotalProductsModalProps) => {
  return (
    <Modal
      title="Total Products Details"
      visible={visible}
      onCancel={onClose}
      footer={[
        <button
          key="close"
          onClick={onClose}
          className="bg-blue-600 text-white rounded px-4 py-2"
        >
          Close
        </button>,
      ]}
    >
      <p>
        Total Products:{" "}
        {totalProducts !== null ? totalProducts.toLocaleString() : "..."}
      </p>
      <p>Percentage Change: {change}</p>
    </Modal>
  );
};

export default TotalProductsModal;
