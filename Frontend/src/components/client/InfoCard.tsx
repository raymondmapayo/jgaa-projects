import React from "react";

interface InfoCardProps {
  icon: React.ReactNode; // The icon (can be an SVG, React Icon, etc.)
  title: string; // The title text
  description: string; // The description text
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, description }) => {
  return (
    <div className="w-60 h-40 flex flex-col items-center justify-center bg-gray-100 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
};

export default InfoCard;
