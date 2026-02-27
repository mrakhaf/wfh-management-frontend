import React from 'react';

const CardMenu = ({ title, description, onClick, icon }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 cursor-pointer border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
        <div className="text-4xl text-gray-400">{icon}</div>
      </div>
    </div>
  );
};

export default CardMenu;