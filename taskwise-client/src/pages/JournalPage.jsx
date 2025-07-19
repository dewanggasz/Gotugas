"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getJournalMonthData,
  getJournalDayDetails,
  updateJournalMood,
  addJournalNote,
  updateJournalNote,
  deleteJournalNote,
} from "../services/api"
import JournalNoteForm from "../components/JournalNoteForm"
import {
  Book,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Smile,
  Meh,
  Frown,
  Laugh,
  Angry,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react"

// Komponen untuk Mood Picker
const MoodPicker = ({ selectedMood, onSelectMood }) => {
  const moods = [
    {
      name: "joyful",
      icon: Laugh,
      color: "text-yellow-500",
      bg: "bg-yellow-50",
      ring: "ring-yellow-300",
      hover: "hover:bg-yellow-100",
    },
    {
      name: "happy",
      icon: Smile,
      color: "text-green-500",
      bg: "bg-green-50",
      ring: "ring-green-300",
      hover: "hover:bg-green-100",
    },
    {
      name: "neutral",
      icon: Meh,
      color: "text-blue-500",
      bg: "bg-blue-50",
      ring: "ring-blue-300",
      hover: "hover:bg-blue-100",
    },
    {
      name: "sad",
      icon: Frown,
      color: "text-gray-500",
      bg: "bg-gray-50",
      ring: "ring-gray-300",
      hover: "hover:bg-gray-100",
    },
    {
      name: "angry",
      icon: Angry,
      color: "text-red-500",
      bg: "bg-red-50",
      ring: "ring-red-300",
      hover: "hover:bg-red-100",
    },
  ]

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {moods.map(({ name, icon: Icon, color, bg, ring, hover }) => (
        <button
          key={name}
          onClick={() => onSelectMood(name)}
          className={`p-2.5 rounded-xl transition-all duration-200 ${
            selectedMood === name ? `${bg} ring-2 ${ring} shadow-md` : `${hover} border border-gray-200 shadow-sm`
          }`}
        >
          <Icon className={`w-5 h-5 ${color}`} />
        </button>
      ))}
    </div>
  )
}

export default function JournalPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [monthData, setMonthData] = useState([])
  const [dayDetails, setDayDetails] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)

  const fetchAllData = useCallback(async (dateToFetch, dayToSelect) => {
    setIsLoading(true)
    try {
      const year = dateToFetch.getFullYear()
      const month = dateToFetch.getMonth() + 1
      const monthResponse = await getJournalMonthData(year, month)
      setMonthData(monthResponse.data)

      const dayResponse = await getJournalDayDetails(dayToSelect)
      setDayDetails(dayResponse.data)
    } catch (error) {
      console.error("Gagal memuat data jurnal:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllData(currentDate, selectedDate)
  }, [currentDate, selectedDate, fetchAllData])

  const changeMonth = (amount) => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + amount, 1))
  }

  const generateCalendarGrid = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
    const grid = []
    for (let i = 0; i < startDay; i++) {
      grid.push({ key: `pad-${i}`, type: "padding" })
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const journalData = monthData.find((j) => j.entry_date === dateStr)
      grid.push({ key: dateStr, type: "day", day, date: dateStr, notes_count: journalData?.notes_count || 0 })
    }
    return grid
  }
  const calendarGrid = generateCalendarGrid()

  const handleMoodUpdate = async (mood) => {
    const newMood = dayDetails.mood === mood ? null : mood
    try {
      const response = await updateJournalMood({ entry_date: selectedDate, mood: newMood })
      setDayDetails((prev) => ({ ...prev, mood: response.data.mood }))
    } catch (error) {
      console.error("Gagal memperbarui mood:", error)
    }
  }

  const handleNoteSubmit = async (noteData) => {
    try {
      if (editingNote) {
        await updateJournalNote(editingNote.id, noteData)
      } else {
        await addJournalNote({ entry_date: selectedDate, content: noteData.content })
      }
      fetchAllData(currentDate, selectedDate)
    } catch (error) {
      console.error("Gagal menyimpan catatan:", error)
      throw error
    }
  }

  const handleNoteDelete = async (noteId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus catatan ini?")) {
      try {
        await deleteJournalNote(noteId)
        fetchAllData(currentDate, selectedDate)
      } catch (error) {
        console.error("Gagal menghapus catatan:", error)
      }
    }
  }

  return (
    <div className="min-h-screen xl:h-[100dvh] bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6 xl:overflow-hidden">
      <div className="max-w-7xl mx-auto h-full">
        <div className="flex flex-col xl:flex-row gap-6 h-auto xl:h-full">
          {/* Kolom Kiri: Detail Harian */}
          <div className="xl:w-2/5 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col order-2 xl:order-1 xl:h-full">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Book className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {new Date(selectedDate.replace(/-/g, "/")).toLocaleDateString("id-ID", { weekday: "long" })}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedDate.replace(/-/g, "/")).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {isLoading && !dayDetails ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                  <p className="text-gray-600">Memuat data...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-6 space-y-6">
                  {/* Mood Section */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Bagaimana perasaanmu hari ini?
                    </label>
                    <MoodPicker selectedMood={dayDetails?.mood} onSelectMood={handleMoodUpdate} />
                  </div>

                  {/* Add Note Button */}
                  <button
                    onClick={() => {
                      setEditingNote(null)
                      setIsNoteModalOpen(true)
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Tambah Catatan Baru
                  </button>
                </div>

                {/* Notes Section */}
                <div className="flex-1 p-6 pt-0 overflow-hidden xl:min-h-0">
                  <div className="h-full xl:overflow-y-auto space-y-3 pr-2">
                    {dayDetails?.notes?.length > 0 ? (
                      dayDetails.notes.map((note) => (
                        <div
                          key={note.id}
                          className="group bg-white border border-gray-200 p-4 rounded-xl hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex justify-between items-start gap-3">
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap flex-1">
                              {note.content}
                            </p>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={() => {
                                  setEditingNote(note)
                                  setIsNoteModalOpen(true)
                                }}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleNoteDelete(note.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Book className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">Belum ada catatan</p>
                        <p className="text-gray-400 text-sm mt-1">Mulai menulis untuk tanggal ini</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Kolom Kanan: Kalender */}
          <div className="xl:w-3/5 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col order-1 xl:order-2 xl:h-full">
            {/* Calendar Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>

                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-800">
                    {currentDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                  </h2>
                </div>

                <button
                  onClick={() => changeMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 p-6 overflow-hidden xl:min-h-0">
              <div className="h-full flex flex-col">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1 flex-1">
                  {calendarGrid.map((item) => (
                    <div key={item.key} className="aspect-square">
                      {item.type === "day" && (
                        <button
                          onClick={() => setSelectedDate(item.date)}
                          className={`w-full h-full flex flex-col items-center justify-center rounded-lg transition-all duration-200 text-sm relative ${
                            selectedDate === item.date
                              ? "bg-blue-600 text-white shadow-lg"
                              : "hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          <span
                            className={`font-semibold ${
                              new Date().toISOString().split("T")[0] === item.date
                                ? "relative after:absolute after:w-1.5 after:h-1.5 after:bg-red-500 after:rounded-full after:-top-1 after:-right-1"
                                : ""
                            }`}
                          >
                            {item.day}
                          </span>

                          {/* Hanya tampilkan jumlah catatan di desktop */}
                          {item.notes_count > 0 && (
                            <span
                              className={`hidden md:inline text-xs mt-1 px-1.5 py-0.5 rounded-full ${
                                selectedDate === item.date ? "bg-white/20 text-white" : "bg-blue-100 text-blue-600"
                              }`}
                            >
                              {item.notes_count}
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <JournalNoteForm
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSubmit={handleNoteSubmit}
        initialNote={editingNote}
      />
    </div>
  )
}
