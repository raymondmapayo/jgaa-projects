// src/components/admin/CustomerFilterModal.tsx
import { Button, DatePicker, Modal, message } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import { AiOutlineArrowRight } from "react-icons/ai";
import { FiCalendar, FiFilter } from "react-icons/fi";

interface CustomerFilterModalProps {
  onApply: (start: Dayjs | null, end: Dayjs | null) => void;
  onReset?: () => void;
}

function CustomerFilterModal({ onApply, onReset }: CustomerFilterModalProps) {
  const today = dayjs();
  const firstDayOfMonth = today.startOf("month");
  const [startDate, setStartDate] = useState<Dayjs | null>(firstDayOfMonth);
  const [endDate, setEndDate] = useState<Dayjs | null>(today);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dates, setDates] = useState<[Dayjs | null, Dayjs | null]>([
    firstDayOfMonth,
    today,
  ]);

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  const handleApply = () => {
    if (startDate && endDate && startDate.isAfter(endDate)) {
      message.error("Start date cannot be after end date!");
      return;
    }
    onApply(startDate, endDate);
    setDates([startDate, endDate]); // ✅ keep button label updated
    setIsModalOpen(false);
  };

  const handleReset = () => {
    const resetStart = firstDayOfMonth;
    const resetEnd = today;
    setStartDate(resetStart);
    setEndDate(resetEnd);
    setDates([resetStart, resetEnd]);
    if (onReset) onReset();
    setIsModalOpen(false); // ✅ close modal after reset
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        type="default"
        onClick={showModal}
        className="flex items-center gap-2"
      >
        <FiFilter className="text-orange-500" />
        <span className="font-medium">Filter - </span>
        {dates[0]?.format("MMM DD, YYYY")} → {dates[1]?.format("MMM DD, YYYY")}
      </Button>

      <Modal open={isModalOpen} footer={null} onCancel={handleCancel} centered>
        <div className="flex items-center gap-2 mb-4 text-lg font-semibold">
          <FiCalendar className="text-orange-500" />
          <span>Filter by Date</span>
        </div>

        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="border px-3 py-1 rounded-md">
            {dates[0] ? dates[0].format("MMM DD") : "Start"}
          </div>
          <AiOutlineArrowRight className="text-xl text-gray-500" />
          <div className="border px-3 py-1 rounded-md">
            {dates[1] ? dates[1].format("MMM DD") : "End"}
          </div>
        </div>

        {/* ✅ Two independent calendars */}
        <div className="flex justify-between gap-4">
          <div className="flex-1">
            <label className="block mb-1 text-gray-600 text-sm">
              Start Date
            </label>
            <DatePicker
              value={startDate}
              onChange={(val: Dayjs | null) => {
                setStartDate(val);
                setDates([val, endDate]); // ✅ update both
              }}
              format="MMM DD, YYYY"
              style={{ width: "100%" }}
            />
          </div>

          <div className="flex-1">
            <label className="block mb-1 text-gray-600 text-sm">End Date</label>
            <DatePicker
              value={endDate}
              onChange={(val: Dayjs | null) => {
                setEndDate(val);
                setDates([startDate, val]); // ✅ update both
              }}
              format="MMM DD, YYYY"
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type="primary" onClick={handleApply}>
            Apply
          </Button>
          <Button onClick={handleReset}>Reset</Button>
        </div>
      </Modal>
    </div>
  );
}

export default CustomerFilterModal;
