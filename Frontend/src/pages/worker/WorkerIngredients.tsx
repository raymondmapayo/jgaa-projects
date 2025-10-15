import { PlusOutlined } from "@ant-design/icons";
import { Button, Input, Pagination } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import WorkerIngredientsEditModal from "../WorkerModals/WorkerIngredientsEditModal";
import WorkerIngredientsModal from "../WorkerModals/WorkerIngredientsModal";

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

const WorkerIngredients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [ingredientsMap, setIngredientsMap] = useState<
    Record<number, Ingredient[]>
  >({});
  const [expandedMap, setExpandedMap] = useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingData, setEditingData] = useState<{
    menu_id: number;
    item_name: string;
    ingredients: Ingredient[];
  } | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  // Fetch menu items
  useEffect(() => {
    axios
      .get(`${apiUrl}/menu_items`)
      .then((res) => setMenuItems(res.data))
      .catch((error) => console.error("Error fetching menu items:", error));
  }, []);

  // Fetch ingredients for each menu item using menu_id
  useEffect(() => {
    menuItems.forEach((item) => {
      axios
        .get<Ingredient[]>(`${apiUrl}/ingredients_by_category/${item.menu_id}`)
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
    <section className="relative -mx-6 sm:mx-0">
      {/* Remove max-w-7xl and mx-auto so the bg stretches edge-to-edge */}
      <div className="bg-white dark:bg-[#001f3f] rounded-lg shadow-lg sm:w-full p-6 flex flex-col transition-colors">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 w-full">
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-orange-500 flex-1 text-center sm:text-left">
            Ingredients
          </h1>

          {/* Search + Button */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1 sm:flex-none justify-center sm:justify-end">
            <Search
              placeholder="Search ingredients..."
              allowClear
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-orange-500 hover:!bg-orange-600 w-full sm:w-auto"
              onClick={() => setIsModalVisible(true)}
            >
              Add Ingredients
            </Button>
          </div>
        </header>

        {/* Cards Grid */}
        <div className="flex flex-wrap">
          {paginatedItems.map((item) => {
            const recipeList = ingredientsMap[item.menu_id] || [];
            const isExpanded = expandedMap[item.menu_id] || false;

            return (
              <div
                key={item.menu_id}
                className="
              w-full
              sm:w-1/2
              lg:w-1/3
              mb-6
              px-0 sm:px-3
              flex flex-col
            "
              >
                <div className="bg-[#FFF7EC] border border-gray-200 rounded-lg shadow-lg flex flex-col h-full w-full">
                  {/* Image */}
                  <div className="relative w-24 h-24 mx-auto mt-4">
                    <img
                      src={`${apiUrl}/uploads/images/${item.menu_img}`}
                      alt={item.item_name}
                      className="h-24 w-24 object-cover rounded-full border-4 border-orange-500 shadow-md"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col p-4 flex-1">
                    <h2 className="text-lg font-semibold text-orange-600 text-center mb-1">
                      {item.item_name}
                    </h2>

                    <p className="text-sm text-gray-600 dark:text-gray-300 text-justify mb-3">
                      {item.description}
                    </p>

                    <div className="flex justify-between items-center mt-auto">
                      {recipeList.length > 0 && (
                        <>
                          <span
                            onClick={() => toggleExpand(item.menu_id)}
                            className="text-blue-500 hover:underline cursor-pointer text-sm"
                          >
                            {isExpanded ? "See less" : "See ingredients"}
                          </span>

                          {isExpanded && (
                            <Button
                              size="small"
                              type="default"
                              className="text-orange-500 border-orange-500 hover:!bg-orange-50"
                              onClick={() => {
                                setEditingData({
                                  menu_id: item.menu_id,
                                  item_name: item.item_name,
                                  ingredients: recipeList,
                                });
                                setIsEditModalVisible(true);
                              }}
                            >
                              Edit
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Ingredients List */}
                  {isExpanded && recipeList.length > 0 && (
                    <ul className="text-left text-gray-700 dark:text-gray-300 text-sm mt-2 p-4 border-t border-gray-200">
                      {recipeList.map((ingredient) => (
                        <li key={ingredient.ingredients_id}>
                          • {ingredient.ingredients_name} -{" "}
                          {ingredient.measurement} {ingredient.unit}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8 w-full">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredItems.length}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>

        {/* Add Modal */}
        <WorkerIngredientsModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onIngredientAdded={(newIngredients, categoryName) => {
            const menuItem = menuItems.find(
              (item) => item.item_name === categoryName
            );
            if (!menuItem) return;

            setIngredientsMap((prev) => ({
              ...prev,
              [menuItem.menu_id]: [
                ...(prev[menuItem.menu_id] || []),
                ...newIngredients,
              ],
            }));
          }}
        />

        {/* Edit Modal */}
        {editingData && (
          <WorkerIngredientsEditModal
            visible={isEditModalVisible}
            onClose={() => setIsEditModalVisible(false)}
            ingredientData={editingData}
            onIngredientsUpdated={(updatedIngredients, menu_id) => {
              setIngredientsMap((prev) => ({
                ...prev,
                [menu_id]: updatedIngredients,
              }));
            }}
          />
        )}
      </div>
    </section>
  );
};

export default WorkerIngredients;
