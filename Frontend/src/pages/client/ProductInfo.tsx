import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { addToCart } from "../../zustand/store/store.provider";

interface MenuItem {
  id: number;
  item_name: string;
  menu_img: string;
  description: string;
  price: number;
  categories_name: string;
  size?: string;
  final_total?: number;
}

// Add a prop interface
interface ProductInfoProps {
  item?: MenuItem; // optional, because if not passed, we fetch using params
}

const ProductInfo: React.FC<ProductInfoProps> = ({ item: propItem }) => {
  const { type, name } = useParams<{ type: string; name: string }>();
  const [item, setItem] = useState<MenuItem | null>(propItem || null); // use prop if passed
  const [size, setSize] = useState("N/A");
  const apiUrl = import.meta.env.VITE_API_URL;

  // Only fetch if no item was passed via prop
  useEffect(() => {
    if (!propItem && type && name) {
      fetch(`${apiUrl}/menu?type=${type}&name=${name}`)
        .then((res) => res.json())
        .then((data: MenuItem) => setItem(data));
    }
  }, [propItem, type, name]);

  if (!item) return <p>Loading...</p>;

  return (
    <section className="container mx-auto px-4 py-12 bg-[#fff7ec] my-12 rounded-lg shadow-lg">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/2">
          <img
            src={`${apiUrl}/uploads/images/${item.menu_img}`}
            alt={item.item_name}
            className="w-full"
          />
        </div>

        <div className="w-full lg:w-1/2">
          <h1 className="text-2xl font-bold text-green-800">
            {item.item_name}
          </h1>
          <p className="text-gray-600 mt-4">{item.description}</p>
          <p className="text-xl font-bold text-green-800 mt-6">
            ₱ {item.price}
          </p>

          {/* Size Options */}
          <div className="mt-6">
            <h3 className="font-core text-lg font-semibold text-gray-800 mb-2">
              Size
            </h3>
            <div className="flex items-center gap-4">
              <button
                className={`px-4 py-2 rounded border ${
                  size === "Regular"
                    ? "bg-green-100 border-green-600"
                    : "border-gray-300"
                }`}
                onClick={() => setSize("Regular")}
              >
                Regular (1-2 pax)
              </button>
              <button
                className={`px-4 py-2 rounded border ${
                  size === "Party Tray"
                    ? "bg-green-100 border-green-600"
                    : "border-gray-300"
                }`}
                onClick={() => setSize("Party Tray")}
              >
                Party Tray (5-7 pax)
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={() =>
              addToCart({
                ...item,
                size: size || "Normal size",
                final_total: item.price * (size === "Party Tray" ? 2 : 1),
                categories_name: item.categories_name || "Bestsellers",
              })
            }
            className="font-core mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition w-full sm:w-auto"
          >
            Add to cart
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductInfo;
