import React from 'react';
import { X } from 'lucide-react';

export default function ImageLightbox({ imageUrl, onClose }) {
  if (!imageUrl) return null;

  return (
    // Latar belakang gelap
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      {/* Tombol Close */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300"
      >
        <X size={32} />
      </button>

      {/* Kontainer Gambar */}
      <div className="p-4">
        <img 
          src={imageUrl} 
          alt="Tampilan Penuh" 
          className="max-w-full max-h-[90vh] object-contain"
          // Hentikan event klik pada gambar agar tidak menutup lightbox
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
