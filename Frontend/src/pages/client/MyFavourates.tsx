import { Modal, notification } from "antd";
import React, { useEffect, useState } from "react";
import { FaShoppingBag } from "react-icons/fa";
import { addToCart } from "../../zustand/store/store.provider";
import Favourites from "./Favourites";
import ProductInfo from "./ProductInfo";

// Add `id` for ProductInfo compatibility
interface FavouriteItem {
  id: number; // mapped from menu_id
  user_favourites_id: number;
  menu_id: number;
  item_name: string;
  menu_img: string;
  description: string;
  price: number;
  availability: string;
  categories_name: string;
}

const MyFavourites: React.FC = () => {
  const [favourites, setFavourites] = useState<FavouriteItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FavouriteItem | null>(null);

  const user_id = sessionStorage.getItem("user_id");
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    fetch(`${apiUrl}/get_user_favourites_full/${user_id}`)
      .then((res) => res.json())
      .then((data: FavouriteItem[]) => {
        const mappedData = data.map((item) => ({
          ...item,
          id: item.menu_id,
        }));
        setFavourites(mappedData);
      })
      .catch((err) => console.error("Error fetching favourites:", err));
  }, [user_id]);

  // Toggle favourite from MyFavourites page
  const toggleFavorite = (menu_id: number) => {
    if (!user_id) {
      notification.warning({
        message: "Please Login First",
        description: "You need to login to modify favourites.",
        placement: "topRight",
      });
      return;
    }

    fetch(`${apiUrl}/toggle_user_favorites/${menu_id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Remove from local favourites if removed
          setFavourites((prev) =>
            data.action === "removed"
              ? prev.filter((item) => item.menu_id !== menu_id)
              : prev
          );

          notification.success({
            message:
              data.action === "added"
                ? "Added to Favourites"
                : "Removed from Favourites",
            description: `${
              favourites.find((i) => i.menu_id === menu_id)?.item_name
            } has been ${data.action} your favourites.`,
            placement: "topRight",
          });
        }
      })
      .catch((err) => console.error(err));
  };

  const handleViewMenuClick = (item: FavouriteItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  return (
    <section className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="font-core text-4xl font-bold text-orange-500">
          {" "}
          Favourites
        </h1>
      </header>

      {favourites.length === 0 ? (
        <div className="font-core text-center text-xl text-gray-500">
          You have no favourite items yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {favourites.map((item) => (
            <div
              key={item.user_favourites_id}
              className="bg-[#fff7ec] cursor-pointer border border-gray-200 rounded-lg shadow-lg overflow-hidden relative p-6 text-center flex flex-col"
            >
              {/* Top row: Category left, Heart right */}
              <div className="flex justify-between items-center">
                <p className="font-core text-sm text-gray-500 text-left">
                  {item.categories_name}
                </p>

                {/* Heart Icon */}
                <Favourites
                  menuId={item.menu_id}
                  isFavorited={true}
                  onToggleFavorite={toggleFavorite}
                />
              </div>

              {/* Image */}
              <div className="relative w-32 h-32 mx-auto mt-4">
                <img
                  src={`${apiUrl}/uploads/images/${item.menu_img}`}
                  alt={item.item_name}
                  className="h-32 w-32 object-cover rounded-full border-4 border-orange-500 shadow-lg"
                />
              </div>

              {/* Content */}
              <div className="mt-4 flex-grow flex flex-col justify-between">
                <div>
                  <h2 className="font-core text-xl font-semibold text-orange-600">
                    {item.item_name}
                  </h2>
                  <p className=" text-sm text-gray-600 mt-2 line-clamp-3 text-justify">
                    {item.description}
                  </p>
                  <p className=" text-lg  text-gray-800 mt-4 text-left">
                    ₱{item.price}
                  </p>
                </div>

                {/* Buttons */}
                <div className="mt-4 flex items-center gap-4">
                  <button
                    onClick={() => handleViewMenuClick(item)}
                    className="font-core flex-1 flex items-center justify-center px-4 py-2 text-sm font-semibold text-orange-500 border border-orange-500 rounded-full hover:bg-orange-500 hover:text-white transition-colors duration-300 whitespace-nowrap"
                  >
                    View Menu
                  </button>

                  <button
                    onClick={() => addToCart(item)}
                    className="font-core flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-orange-500 border border-orange-500 rounded-full hover:bg-orange-500 hover:text-white transition-colors duration-300 whitespace-nowrap"
                  >
                    <FaShoppingBag />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        bodyStyle={{ padding: "20px" }}
        width={800}
      >
        {selectedItem && <ProductInfo item={selectedItem} />}
      </Modal>
    </section>
  );
};

export default MyFavourites;
