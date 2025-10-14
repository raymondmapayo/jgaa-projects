import { PlusOutlined } from "@ant-design/icons";
import { Button, Input, Pagination } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import IngredientsModal from "./AdminModals/IngredientsModal";

const { Search } = Input;

interface MenuItem {
  menu_id: number;
  item_name: string;
  menu_img: string;
  description: string;
  categories_name: string;
}

interface Ingredient {
  ingredients_id: number;
  ingredients_name: string;
  measurement: string;
  unit: string;
}

const ManageIngredients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [ingredientsMap, setIngredientsMap] = useState<
    Record<number, Ingredient[]>
  >({});
  const [expandedMap, setExpandedMap] = useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Fetch menu items
  useEffect(() => {
    axios
      .get("http://localhost:8081/menu_items")
      .then((res) => setMenuItems(res.data))
      .catch((error) => console.error("Error fetching menu items:", error));
  }, []);

  // Fetch ingredients for each menu item using menu_id
  useEffect(() => {
    menuItems.forEach((item) => {
      axios
        .get<Ingredient[]>(
          `http://localhost:8081/ingredients_by_category/${item.menu_id}`
        )
        .then((res) => {
          setIngredientsMap((prev) => ({
            ...prev,
            [item.menu_id]: res.data,
          }));
        })
        .catch(() => {
          setIngredientsMap((prev) => ({
            ...prev,
            [item.menu_id]: [],
          }));
        });
    });
  }, [menuItems]);

  const filteredItems = menuItems.filter((item) =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + pageSize);

  const toggleExpand = (menuId: number) => {
    setExpandedMap((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  return (
    <section className="container mx-auto px-4 pt-6 pb-12">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-orange-500">Ingredients</h1>
        <div className="flex gap-4">
          <Search
            placeholder="Search ingre..."
            allowClear
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 250 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-orange-500 hover:!bg-orange-600"
            onClick={() => setIsModalVisible(true)}
          >
            Add Ingredients
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap justify-between gap-6">
        {paginatedItems.map((item) => {
          const recipeList = ingredientsMap[item.menu_id] || [];
          const isExpanded = expandedMap[item.menu_id] || false;

          return (
            <div
              key={item.menu_id}
              className="bg-[#FFF7EC] border border-gray-200 rounded-lg shadow-lg flex flex-col flex-1 min-w-[28%] max-w-[32%] min-h-[320px]"
            >
              {/* Image */}
              <div className="relative w-24 h-24 mx-auto mt-2">
                <img
                  src={`http://localhost:8081/uploads/images/${item.menu_img}`}
                  alt={item.item_name}
                  className="h-24 w-24 object-cover rounded-full border-4 border-orange-500 shadow-lg"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col p-3 flex-1">
                <h2 className="text-base font-semibold text-orange-600 text-center mb-1">
                  {item.item_name}
                </h2>

                <div className="mt-1 text-sm text-gray-600 text-justify">
                  {item.description}
                </div>

                {/* See More / Edit row */}
                <div className="flex justify-between items-center mt-auto pt-2">
                  {recipeList.length > 0 ? (
                    <>
                      <span
                        onClick={() => toggleExpand(item.menu_id)}
                        className="text-blue-500 hover:underline cursor-pointer text-sm"
                      >
                        {isExpanded ? "See less" : "See ingredients"}
                      </span>
                      {/* Show Edit button only when expanded */}
                      {isExpanded && (
                        <Button
                          size="small"
                          type="default"
                          className="text-orange-500 border-orange-500 hover:!bg-orange-50"
                        >
                          Edit
                        </Button>
                      )}
                    </>
                  ) : null}
                </div>
              </div>

              {/* Ingredients list appears BELOW See more / Edit row */}
              {isExpanded && recipeList.length > 0 && (
                <ul className="text-left text-gray-700 text-sm mt-2 p-3 border-t border-gray-200">
                  {recipeList.map((ingredient) => (
                    <li key={ingredient.ingredients_id}>
                      • {ingredient.ingredients_name} - {ingredient.measurement}{" "}
                      {ingredient.unit}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-8">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredItems.length}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>

      <IngredientsModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </section>
  );
};

export default ManageIngredients;
