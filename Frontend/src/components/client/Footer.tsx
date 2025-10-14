import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";

const Footer: React.FC = () => {
  const socialLinks = [
    { icon: FaTwitter, link: "#" },
    { icon: FaFacebookF, link: "#" },
    { icon: FaInstagram, link: "#" },
    { icon: FaLinkedinIn, link: "#" },
  ];

  return (
    <footer className="relative w-full bg-[#1f2a2d] text-gray-300 py-16 overflow-hidden">
      <div className="container mx-auto px-4 flex flex-col">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-yellow-500/50 pb-8 mb-8 gap-8">
          {/* Logo */}
          <div className="flex-1 text-center md:text-left">
            <a
              href="#"
              className="font-core text-3xl text-yellow-500 font-bold hover:text-yellow-400 transition"
            >
              Foodies
            </a>
            <p className="font-core text-gray-400 mt-2 italic">
              Make it Taste!
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex flex-1 justify-center md:justify-end space-x-4">
            {socialLinks.map((item, i) => (
              <a
                key={i}
                href={item.link}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-600 bg-gray-800 hover:bg-yellow-500 hover:text-gray-900 transition transform hover:scale-110"
              >
                <item.icon className="text-yellow-500" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Why People Like Us */}
          <div>
            <h4 className="font-core text-lg text-yellow-500 mb-3 font-semibold">
              Why People Like Us!
            </h4>
            <p className="font-core text-gray-300 mb-4">
              Bringing the best flavors to your table. Fresh ingredients,
              authentic recipes, and a passion for food.
            </p>
            <a
              href="#"
              className="font-core inline-block px-5 py-2 border bg-yellow-500 border-yellow-500 rounded-full text-white font-semibold hover:bg-yellow-400 hover:text-gray-900 transition"
            >
              Read More
            </a>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-core text-lg text-yellow-500 mb-3 font-semibold">
              Contact Info
            </h4>
            <ul className="font-core space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                📞 <span>+1 (062) 109-9222</span>
              </li>
              <li className="flex items-center gap-2">
                ✉️ <span>Info@YourGmail24.com</span>
              </li>
              <li className="flex items-start gap-2">
                📍{" "}
                <address className="not-italic">
                  153 Williamson Plaza, Maggieberg, MT 09514
                </address>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="font-core text-lg text-yellow-500 mb-3 font-semibold">
              Opening Hours
            </h4>
            <ul className="font-core space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                🕒 Monday-Friday: 08:00-22:00
              </li>
              <li className="flex items-center gap-2">
                🕒 Tuesday: 16:00 - Midnight
              </li>
              <li className="flex items-center gap-2">
                🕒 Saturday: 10:00-16:00
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Running Delivery Boy Animation */}
      <div
        className="absolute bottom-0 left-[-160px] w-[160px] animate-running-cycle"
        style={{
          content: "url('/delivery-boy.svg')",
        }}
      ></div>
    </footer>
  );
};

export default Footer;
