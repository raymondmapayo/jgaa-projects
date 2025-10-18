// src/components/worker/WorkerDashboardFilter.tsx
import { FilterOutlined } from "@ant-design/icons";
import { Button, DatePicker, Modal } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";

const { RangePicker } = DatePicker;

interface WorkerDashboardFilterProps {
  onApply: (start: Dayjs | null, end: Dayjs | null) => void;
}

const WorkerDashboardFilter: React.FC<WorkerDashboardFilterProps> = ({
  onApply,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dates, setDates] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().startOf("month"),
    dayjs(),
  ]);

  const handleApply = () => {
    onApply(dates[0], dates[1]);
    setIsModalOpen(false);
  };

  const handleReset = () => {
    const defaultRange: [Dayjs | null, Dayjs | null] = [
      dayjs().startOf("month"),
      dayjs(),
    ];
    setDates(defaultRange);
    onApply(defaultRange[0], defaultRange[1]);
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        icon={<FilterOutlined />}
        onClick={() => setIsModalOpen(true)}
        className="bg-[#fa8c16] text-white rounded-md"
      >
        Filter
      </Button>

      <Modal
        title="Filter by Date Range"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="reset" onClick={handleReset}>
            Reset
          </Button>,
          <Button key="apply" type="primary" onClick={handleApply}>
            Apply
          </Button>,
        ]}
      >
        <RangePicker
          value={dates}
          onChange={(values) =>
            setDates(values as [Dayjs | null, Dayjs | null])
          }
          allowClear={false}
          className="w-full"
        />
      </Modal>
    </>
  );
};

export default WorkerDashboardFilter;
