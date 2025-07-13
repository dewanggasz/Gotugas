import React from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    // Latar belakang gelap
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      {/* Kontainer Modal */}
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative">
        {/* Header Modal */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl"
          >
            &times;
          </button>
        </div>
        {/* Konten Modal */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}
