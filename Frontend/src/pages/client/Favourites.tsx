// Favourites.tsx
import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import React from "react";

interface FavouritesProps {
  menuId: number; // Use menu_id from menu_tbl
  isFavorited: boolean;
  onToggleFavorite: (menuId: number) => void;
}

const Favourites: React.FC<FavouritesProps> = ({
  menuId,
  isFavorited,
  onToggleFavorite,
}) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggleFavorite(menuId); // Call toggle function
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

export default Favourites;
