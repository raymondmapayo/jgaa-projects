import { motion } from "framer-motion";
import React from "react";
import { slideInFromRight } from "../../animation/motionConfig";

const Banner: React.FC = () => {
  return (
    <div className="w-full bg-[#ffb524] py-12">
      <div className="w-full px-6">
        <div className="w-full flex flex-col lg:flex-row justify-around items-center gap-10">
          {/* Left Column */}
          <div className="text-center lg:text-left max-w-[600px]">
            <div>
              <h1 className="font-core text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
                Beers
              </h1>
              <p className="font-core text-2xl sm:text-4xl md:text-5xl font-light text-gray-800 mt-4">
                in Our Store
              </p>
              <p className="font-core text-sm sm:text-base md:text-lg text-gray-800 mt-4">
                The taste is goods.
              </p>
              <a
                href="#"
                className="font-core mt-6 inline-block bg-transparent border-2 border-white text-gray-800 py-2 px-6 sm:py-3 sm:px-8 rounded-full font-bold hover:bg-white hover:text-yellow-500 transition"
              >
                BUY
              </a>
            </div>
          </div>

          {/* Right Column */}
          <motion.div
            className="relative max-w-[400px] sm:max-w-[500px] md:max-w-[600px]"
            variants={slideInFromRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
          >
            <img
              src={"/sanmig.jpg"}
              className="rounded-lg shadow-lg w-full h-auto"
              alt="Banner"
            />
            <div className="absolute top-[-1.5rem] left-[-1.5rem] bg-white text-center flex items-center justify-center rounded-full shadow-lg w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36">
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                125₱
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
