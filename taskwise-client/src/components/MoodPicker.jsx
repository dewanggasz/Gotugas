"use client"

import { Laugh, Zap, Heart, Meh, Frown, Angry } from "lucide-react"

// Definisikan tipe untuk setiap mood agar lebih terstruktur
const moods = [
  {
    name: "joyful",
    displayName: "Sangat Senang",
    icon: Laugh,
    color: "text-yellow-500",
    bg: "bg-yellow-50",
    ring: "ring-yellow-300",
    hover: "hover:bg-yellow-100",
  },
  {
    name: "excited",
    displayName: "Bersemangat",
    icon: Zap, // Menggunakan ikon petir untuk energi
    color: "text-orange-500",
    bg: "bg-orange-50",
    ring: "ring-orange-300",
    hover: "hover:bg-orange-100",
  },
  {
    name: "happy",
    displayName: "Senang",
    icon: Heart, // Menggunakan ikon hati untuk kebahagiaan
    color: "text-pink-500",
    bg: "bg-pink-50",
    ring: "ring-pink-300",
    hover: "hover:bg-pink-100",
  },
  {
    name: "neutral",
    displayName: "Biasa",
    icon: Meh,
    color: "text-gray-500",
    bg: "bg-gray-50",
    ring: "ring-gray-300",
    hover: "hover:bg-gray-100",
  },
  {
    name: "sad",
    displayName: "Sedih",
    icon: Frown,
    color: "text-blue-400",
    bg: "bg-blue-50",
    ring: "ring-blue-300",
    hover: "hover:bg-blue-100",
  },
  {
    name: "angry",
    displayName: "Marah",
    icon: Angry,
    color: "text-red-500",
    bg: "bg-red-50",
    ring: "ring-red-300",
    hover: "hover:bg-red-100",
  },
]

/**
 * Komponen MoodPicker untuk menampilkan dan memilih mood.
 * @param {object} props
 * @param {string | null} props.selectedMood - Mood yang sedang terpilih.
 * @param {(mood: string) => void} props.onSelectMood - Fungsi yang dipanggil saat mood dipilih.
 */
export default function MoodPicker({ selectedMood, onSelectMood }) {
  return (
    <div className="flex items-center justify-center gap-1.5 md:gap-2 flex-wrap">
      {moods.map(({ name, displayName, icon: Icon, color, bg, ring, hover }) => (
        <button
          key={name}
          onClick={(e) => {
            // Mencegah event bawaan dan propagasi event ke elemen parent
            e.preventDefault()
            e.stopPropagation()
            onSelectMood(name)
          }}
          className={`p-1.5 md:p-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
            selectedMood === name
              ? `${bg} ring-2 ${ring} shadow-md` // Style saat terpilih
              : `${hover} border border-gray-200 shadow-sm` // Style default
          }`}
          type="button"
          title={displayName} // Tooltip untuk aksesibilitas
        >
          {/* Ikon untuk mood, pointer-events-none agar tidak mengganggu event click pada button */}
          <Icon className={`w-4 h-4 md:w-5 md:h-5 ${color} pointer-events-none`} />
        </button>
      ))}
    </div>
  )
}
