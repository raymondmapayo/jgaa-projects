/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, Image, Tag } from "antd";
import dayjs from "dayjs";
import styled from "styled-components";

const StyledPanelContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  .transaction-card {
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    padding: 20px;
    background: #fff;
    position: relative;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .amount {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
  }

  .datetime {
    font-size: 13px;
    color: #6b7280;
    text-align: right;
  }

  .details {
    margin-top: 12px;
    font-size: 14px;
    color: #374151;
  }

  .details div {
    margin-bottom: 6px;
  }

  .status-tag {
    position: absolute;
    top: 16px;
    left: 20px;
    font-size: 13px;
    padding: 2px 10px;
    border-radius: 8px;
  }

  .proof-image {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #f0f0f0;
  }
`;

interface ValidationModalProps {
  transaction: any;
}

const ValidationModal: React.FC<ValidationModalProps> = ({ transaction }) => {
  // ✅ Format date & time using dayjs
  const formattedDate = transaction?.payment_date
    ? dayjs(transaction.payment_date).format("DD/MM/YYYY")
    : "";
  const formattedTime = transaction?.payment_time
    ? dayjs(transaction.payment_time, "HH:mm:ss").format("h:mm A")
    : "";

  return (
    <Card title="Validate GCash Payment" className="w-full">
      {transaction ? (
        <StyledPanelContent>
          <Card bordered={false} className="transaction-card">
            {/* Status badge */}
            <Tag
              className="status-tag"
              color={
                transaction.status === "Completed"
                  ? "green"
                  : transaction.status === "Pending"
                  ? "orange"
                  : "red"
              }
            >
              {transaction.status}
            </Tag>

            {/* Header with amount + datetime */}
            <div className="header">
              <div className="amount">₱{transaction.amount}</div>
              <div className="datetime">
                {formattedDate}
                <br />
                {formattedTime}
              </div>
            </div>

            {/* Details section */}
            <div className="details">
              <div>Referral Code: {transaction.reference_code}</div>
              <div>GCash No: {transaction.gcash_number}</div>
            </div>
          </Card>

          {/* Proof of payment image */}
          {transaction.proof_image && (
            <Card
              bordered={false}
              className="proof-image"
              title="Proof of Payment"
            >
              <Image
                src={`http://localhost:8081/uploads/images/${transaction.proof_image}`}
                alt="Proof of payment"
                style={{ borderRadius: 8 }}
                preview={{ mask: "Click to Preview" }}
              />
            </Card>
          )}
        </StyledPanelContent>
      ) : (
        <p>No transaction details found.</p>
      )}
    </Card>
  );
};

export default ValidationModal;
