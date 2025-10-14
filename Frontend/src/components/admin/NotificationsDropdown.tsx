import { Avatar, List } from "antd";
import dayjs from "dayjs";
import styled from "styled-components";
import { Notification } from "../../hooks/useNotifications";

const DropdownContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  width: 350px;
`;

interface NotificationsDropdownProps {
  notifications: Notification[];
}

const NotificationsDropdown = ({
  notifications,
}: NotificationsDropdownProps) => {
  return (
    <DropdownContainer>
      <List
        itemLayout="horizontal"
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item style={{ backgroundColor: "#f0f0f0" }}>
            <List.Item.Meta
              avatar={
                <Avatar
                  src={item.created_by?.profile_pic || "/avatar.jpg"}
                  alt={item.created_by?.fname || "User"}
                />
              }
              title={
                <span style={{ fontWeight: 500 }}>
                  {item.title}{" "}
                  {item.created_by?.fname && item.created_by?.lname
                    ? `by ${item.created_by.fname} ${item.created_by.lname}`
                    : ""}
                </span>
              }
              description={
                <div>
                  {item.description &&
                    item.description.split("\n").map((line, idx) => (
                      <p key={idx} style={{ margin: "4px 0" }}>
                        {line}
                      </p>
                    ))}

                  <span style={{ fontSize: "12px", color: "#999" }}>
                    {dayjs(item.created_at)
                      .tz("Asia/Manila")
                      .format("MM/DD/YYYY, h:mm a")}
                  </span>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </DropdownContainer>
  );
};

export default NotificationsDropdown;
