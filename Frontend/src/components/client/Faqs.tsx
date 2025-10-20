import { CaretRightOutlined } from "@ant-design/icons";
import { Collapse } from "antd";
import { motion } from "framer-motion";
import React from "react";
import { slideInFromRight } from "../../animation/motionConfig";

const { Panel } = Collapse;

const Faqs: React.FC = () => {
  return (
    <div className="w-full bg-gradient-to-r from-[#ffb524] to-[#ffcb67] py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-12">
          {/* Left Column: OUR FAQS */}
          <div className="w-full lg:w-1/2">
            <h1 className="font-core text-5xl font-extrabold text-white drop-shadow-lg">
              OUR FAQS
            </h1>
            <p className="font-core text-lg text-white/90 mt-4 mb-8">
              Have questions about our restaurant, menu, or services? Here are
              the answers to some of the most common questions our guests ask.
            </p>

            <Collapse
              accordion
              bordered={false}
              expandIcon={({ isActive }) => (
                <CaretRightOutlined
                  rotate={isActive ? 90 : 0}
                  style={{ fontSize: "18px", color: "#fa8c16" }}
                />
              )}
              className="bg-white rounded-2xl shadow-xl"
            >
              <Panel
                header={
                  <span className="text-lg font-semibold">
                    What are your opening hours?
                  </span>
                }
                key="1"
              >
                <p className="text-gray-700 text-base">
                  Sawasdee and good day! 🌞 We’re open daily from{" "}
                  <strong>3:00 PM to 1:00 AM</strong>, Monday to Sunday.
                </p>
              </Panel>
              <Panel
                header={
                  <span className="text-lg font-semibold">
                    Do you accept reservations?
                  </span>
                }
                key="2"
              >
                <p className="text-gray-700 text-base">
                  Yes! You can reserve a table online.
                </p>
              </Panel>
              <Panel
                header={
                  <span className="text-lg font-semibold">
                    Can I see a menu?
                  </span>
                }
                key="3"
              >
                <p className="text-gray-700 text-base">
                  Sawasdee! Good day! 🙂 Here’s our menu — just click the link
                  below to view all our delicious options: 👉 [Menu Link Here]
                </p>
              </Panel>
              <Panel
                header={
                  <span className="text-lg font-semibold">Do you deliver?</span>
                }
                key="4"
              >
                <p className="text-gray-700 text-base">
                  Sawasdee! 😊 Yes, we deliver via GrabFood. Just open the app,
                  search “JGAA Food & Drinks”, and place your order.
                </p>
              </Panel>
              <Panel
                header={
                  <span className="text-lg font-semibold">
                    Where are you located?
                  </span>
                }
                key="5"
              >
                <p className="text-gray-700 text-base">
                  We’re located at{" "}
                  <strong>
                    7003 Emilio Jacinto St, Poblacion District, Davao City, 8080
                    Davao del Sur, Philippines
                  </strong>
                  .
                </p>
              </Panel>
            </Collapse>
          </div>

          {/* Right Column: Restaurant Image */}
          <motion.div
            className="w-full lg:w-1/2 flex justify-center"
            variants={slideInFromRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
          >
            <motion.img
              src="/sanmig.jpg" // Replace with your restaurant image
              className="rounded-2xl shadow-2xl w-[420px] h-[420px] object-cover"
              alt="Restaurant"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Faqs;
