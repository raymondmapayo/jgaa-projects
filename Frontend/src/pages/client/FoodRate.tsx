import { Button, Modal, Rate } from "antd";

// Define the types for the product data
interface Product {
  menu_img: string;
  item_name: string;
}

interface FoodRateProps {
  visible: boolean;
  selectedProduct: Product | null;
  ratingValue: number;
  onRateChange: (value: number) => void;
  onCancel: () => void;
  onSubmit: () => void;
  rated: boolean; // New prop to check if the product is already rated
}
const apiUrl = import.meta.env.VITE_API_URL;
const FoodRate: React.FC<FoodRateProps> = ({
  visible,
  selectedProduct,
  ratingValue,
  onRateChange,
  onCancel,
  onSubmit,
  rated, // Add this prop to the component
}) => {
  return (
    <Modal
      title="Rate this Product:"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel} className="text-gray-500">
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={onSubmit}
          className="bg-green-500 text-white"
          disabled={rated} // Disable the button if the product is already rated
        >
          Submit
        </Button>,
      ]}
    >
      {/* Modal Content */}
      {selectedProduct && (
        <div className="flex items-center space-x-4">
          {/* Left Section: Image */}
          <div className="flex-shrink-0">
            <img
              src={`${apiUrl}/uploads/images/${selectedProduct.menu_img}`}
              alt={selectedProduct.item_name}
              className="w-20 h-20 rounded-full shadow-md"
            />
          </div>

          {/* Right Section: Product Title and Rating */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {selectedProduct.item_name}
            </h3>
            {rated ? (
              <p className="text-gray-700">
                You have already rated this product!
              </p> // Display the message if rated
            ) : (
              <>
                <Rate
                  value={ratingValue}
                  onChange={onRateChange}
                  className="mb-4"
                />
                <p className="text-gray-700">Rating: {ratingValue} stars</p>
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default FoodRate;
