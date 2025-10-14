import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import React from "react";

interface CustomHeartProps {
  itemId: number;
  isFavorited: boolean;
  onToggleFavorite: (id: number) => void;
}

const CustomHeart: React.FC<CustomHeartProps> = ({
  itemId,
  isFavorited,
  onToggleFavorite,
}) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggleFavorite(itemId);
      }}
      className="absolute top-2 right-2 p-2 rounded-full"
    >
      {isFavorited ? (
        <HeartFilled style={{ fontSize: "24px", color: "#f97316" }} />
      ) : (
        <HeartOutlined style={{ fontSize: "24px", color: "#d1d5db" }} />
      )}
    </button>
  );
};

export default CustomHeart;
