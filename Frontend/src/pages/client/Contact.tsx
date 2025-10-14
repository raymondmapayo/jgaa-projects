import React from "react";

const Contact: React.FC = () => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-gray-100 py-10 px-4">
      {/* Google Map Section */}
      <div className="w-full container mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.4838439046202!2d125.61324767588256!3d7.069763192932927!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32f96d9b9c83bc2b%3A0x5d99db0276a0cbfb!2sJGAA%20Food%20%26%20Drinks!5e0!3m2!1sen!2sph!4v1737468333405!5m2!1sen!2sph"
          width="100%"
          height="400"
          loading="lazy"
          className="border-none"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      {/* Contact Information */}
      <div className="w-full container mx-auto mt-10">
        <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
          <div className="flex items-start">
            <span className="text-orange-500 text-2xl mr-4">📍</span>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Address</h3>
              <p className="text-gray-600">
                7003 Emilio Jacinto St, Poblacion District, Davao City, 8080
                Davao del Sur, Philippines
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-orange-500 text-2xl mr-4">✉️</span>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Mail Us</h3>
              <p className="text-gray-600">jgaa@gmail.com</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-orange-500 text-2xl mr-4">📞</span>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Telephone</h3>
              <p className="text-gray-600">123456789</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
