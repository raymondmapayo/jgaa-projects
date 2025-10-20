import { useEffect, useState } from "react";
import "../../GlobalFonts.css"; // Import custom CSS for animations
const MainPage = () => {
  const dishes = [
    "/promo-1.png",
    "/promo-2.png",
    "/promo-3.png",
    "/promo-4.png",
  ];

  const [mainDish, setMainDish] = useState(dishes[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate through dishes every 4 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % dishes.length;
        setMainDish(dishes[newIndex]);
        return newIndex;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleHover = (index: number) => {
    setIsPaused(true);
    setCurrentIndex(index);
    setMainDish(dishes[index]);
  };

  const handleLeave = () => {
    setIsPaused(false);
  };

  const handleClick = (index: number) => {
    setIsPaused(true);
    setCurrentIndex(index);
    setMainDish(dishes[index]);
    setTimeout(() => setIsPaused(false), 5000);
  };

  // Side dishes (excluding first because that's the default main dish)
  const sideDishes = [
    { id: 1, image: "/promo-2.png", alt: "Dish 1" },
    { id: 2, image: "/promo-3.png", alt: "Dish 2" },
    { id: 3, image: "/promo-4.png", alt: "Dish 3" },
  ];

  return (
    <div
      className="flex flex-col lg:flex-row items-center justify-around bg-no-repeat bg-bottom bg-cover w-full min-h-screen mb-12 px-4 overflow-hidden"
      style={{
        backgroundImage: "url('/vector3.png')",
      }}
    >
      {/* Left Section */}
      <div className="text-center lg:text-left px-4 lg:px-16 py-16">
        <div className="max-w-xl">
          <h1 className="text-4xl sm:text-5xl font-core leading-tight text-gray-800">
            Welcome to <span className="text-[#ffb524]">JGAA</span> RESTAURANT
          </h1>
          <p className="mt-6 text-base sm:text-lg font-core  text-gray-600">
            Bringing the flavors of Thailand to your plate! Authentic flavors,
            vibrant spices, and unforgettable dishes!
          </p>
          <a href="https://food.grab.com/ph/en/restaurant/jgaa-food-drinks-jacinto-delivery/2-C2V1GEWDLAXAVT?sourceID=20251019_015140_6815b643c1e947aabcb42acff0228076_MEXMPS&nameSlug=online-delivery&id=2-C2V1GEWDLAXAVT">
            <button className="mt-8 bg-[#ffb524] font-core  hover:bg-[#fda000] text-white font-semibold py-3 px-6 rounded-full transition duration-300 shadow-lg">
              Order Now
            </button>
          </a>
        </div>
      </div>
      {/* Right Section */}
      <div className="relative mt-10 lg:mt-0 flex flex-col items-center">
        {/* Main Dish */}
        <div className="relative w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] lg:w-[450px] lg:h-[450px] mx-auto animate-spin-slow transition-all duration-500">
          <img
            src={mainDish}
            alt="Main Dish"
            className="w-full h-full object-cover rounded-full shadow-lg"
          />
        </div>

        {/* Side Dishes */}
        <div
          className="absolute flex flex-col items-center gap-4 sm:gap-6 
                     top-1/2 right-0 sm:-right-[5%] transform -translate-y-1/2
                     max-lg:static max-lg:flex-row max-lg:gap-3 max-lg:mt-6 max-lg:justify-center"
        >
          {sideDishes.map((dish, idx) => {
            // Map index correctly (since sideDishes excludes first dish)
            const dishIndex = idx + 1;

            return (
              <div
                key={dish.id}
                className={`w-20 h-20 sm:w-28 sm:h-28 cursor-pointer rounded-full p-2 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 
                  ${
                    currentIndex === dishIndex
                      ? "bg-orange-400 ring-4 ring-orange-300"
                      : "bg-[#ffb524]"
                  }`}
                onMouseEnter={() => handleHover(dishIndex)}
                onMouseLeave={handleLeave}
                onClick={() => handleClick(dishIndex)}
              >
                <img
                  src={dish.image}
                  alt={dish.alt}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
