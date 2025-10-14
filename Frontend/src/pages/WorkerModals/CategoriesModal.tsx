import { Modal, Tag } from "antd";

interface Category {
  categories_id: number;
  categories_name: string;
  categories_img: string;
  status: string;
}

interface CategoriesModalProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  totalCategories: number | null;
  change: string;
}
const apiUrl = import.meta.env.VITE_API_URL;
const CategoriesModal = ({
  open,
  onClose,
  categories,
  totalCategories,
  change,
}: CategoriesModalProps) => {
  return (
    <Modal
      title="Categories Details"
      open={open}
      onCancel={onClose}
      footer={[
        <button
          key="close"
          onClick={onClose}
          className="bg-blue-600 text-white rounded px-4 py-2"
        >
          Close
        </button>,
      ]}
      width={700}
    >
      {/* Summary at top */}
      <div className="mb-4">
        <p>
          <strong>Total Categories:</strong>{" "}
          {totalCategories !== null ? totalCategories : "..."}
        </p>
        <p>
          <strong>Percentage Change:</strong> {change}
        </p>
      </div>

      {/* Categories list */}
      {categories.length === 0 ? (
        <p>No categories available.</p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-auto">
          {categories.map((cat) => (
            <div
              key={cat.categories_id}
              className="flex items-center space-x-4 p-2 border rounded"
            >
              <img
                src={`${apiUrl}/uploads/images/${cat.categories_img}`} // adjust path as needed
                alt={cat.categories_name}
                className="w-20 h-20 object-cover rounded"
              />
              <div>
                <h3 className="font-semibold text-lg">{cat.categories_name}</h3>
                <p>
                  Status:{" "}
                  <Tag
                    color={
                      cat.status.toLowerCase() === "active" ? "green" : "red"
                    }
                  >
                    {cat.status.charAt(0).toUpperCase() + cat.status.slice(1)}
                  </Tag>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default CategoriesModal;
