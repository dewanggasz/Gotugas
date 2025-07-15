import React, { useRef } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);

  if (!isOpen) return null;

  const handleBackdropClick = (event) => {
    // Jika yang diklik adalah backdrop (bukan isi modal)
     if (event.target.closest('[data-ignore-close]')) return;
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick} // Klik area luar modal (backdrop)
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative"
        onClick={(e) => e.stopPropagation()} // ⛔ Jangan biarkan klik di dalam modal ikut ke backdrop
      >
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
        <div>{children}</div>
      </div>
    </div>
  );
}
