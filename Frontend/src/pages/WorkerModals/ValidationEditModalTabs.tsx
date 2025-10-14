import { Modal, Tabs } from "antd";
import EditValidationModal from "./EditValidationModal";
import ValidationModal from "./ValidationModal";

interface ValidationEditTabsModalProps {
  isVisible: boolean;
  onClose: () => void;
  order: any;
  transaction: any;
  onUpdateOrder?: (updatedOrder: any) => void;
}

const { TabPane } = Tabs;

const ValidationEditTabsModal: React.FC<ValidationEditTabsModalProps> = ({
  isVisible,
  onClose,
  order,
  transaction,
  onUpdateOrder,
}) => {
  return (
    <Modal
      title={`ORDER ID-${order?.order_id || ""}`}
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Tabs defaultActiveKey="1">
        <TabPane tab="Validate" key="1">
          <ValidationModal transaction={transaction} />
        </TabPane>
        <TabPane tab="Edit" key="2">
          <EditValidationModal order={order} onUpdateOrder={onUpdateOrder} />
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default ValidationEditTabsModal;
