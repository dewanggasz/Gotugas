"use client"

import React, { useState, useEffect, useCallback } from "react"
import { getJournalEntries, getJournalEntryByDate, saveJournalEntry } from "../services/api"
import { Book, Calendar, Loader2, CheckCircle, Smile, Meh, Frown, Laugh, Angry } from "lucide-react"

// Hook custom untuk debounce (menunda eksekusi fungsi)
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  return debouncedValue
}

// Komponen untuk Mood Picker
const MoodPicker = ({ selectedMood, onSelectMood }) => {
  const moods = [
    { name: 'joyful', icon: Laugh, color: 'text-yellow-500' },
    { name: 'happy', icon: Smile, color: 'text-green-500' },
    { name: 'neutral', icon: Meh, color: 'text-blue-500' },
    { name: 'sad', icon: Frown, color: 'text-gray-500' },
    { name: 'angry', icon: Angry, color: 'text-red-500' },
  ]

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
      <p className="text-sm font-medium text-slate-600">Bagaimana perasaanmu hari ini?</p>
      <div className="flex items-center gap-2">
        {moods.map(({ name, icon: Icon, color }) => (
          <button
            key={name}
            onClick={() => onSelectMood(name)}
            className={`p-2 rounded-full transition-all duration-200 ${selectedMood === name ? 'bg-blue-100 ring-2 ring-blue-400' : 'hover:bg-slate-200'}`}
          >
            <Icon className={`w-6 h-6 ${color}`} />
          </button>
        ))}
      </div>
    </div>
  )
}

export default function JournalPage({ currentUser }) {
  const [entries, setEntries] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [currentEntry, setCurrentEntry] = useState({ content: '', mood: null })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  
  const [savedContent, setSavedContent] = useState('');

  const debouncedContent = useDebounce(currentEntry.content, 1500)

  const formatDate = (dateString, options = {}) => {
    const date = new Date(dateString)
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString("id-ID", {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', ...options
    })
  }

  const fetchEntryList = useCallback(async () => {
    try {
      const response = await getJournalEntries()
      setEntries(response.data)
    } catch (error) {
      console.error("Gagal memuat daftar entri jurnal:", error)
    }
  }, [])

  const fetchEntryForDate = useCallback(async (date) => {
    setIsLoading(true)
    try {
      const response = await getJournalEntryByDate(date)
      setCurrentEntry(response.data)
      setSavedContent(response.data.content || '');
    } catch (error) {
      console.error(`Gagal memuat entri untuk tanggal ${date}:`, error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEntryList()
  }, [fetchEntryList])

  useEffect(() => {
    fetchEntryForDate(selectedDate)
  }, [selectedDate, fetchEntryForDate])

  const handleSave = useCallback(async (dataToSave) => {
    setIsSaving(true)
    setIsSaved(false)
    try {
      const response = await saveJournalEntry(dataToSave)
      const serverEntry = response.data;

      // --- PERBAIKAN DI SINI ---
      // Perbarui state dengan cara yang aman untuk menghindari race condition.
      // Kita hanya mengambil metadata (seperti ID dan timestamp) dari server,
      // dan membiarkan 'content' yang ada di state (yang mungkin lebih baru) tidak tersentuh.
      setCurrentEntry(prev => ({
        ...prev, // Gunakan semua nilai yang ada di state saat ini (termasuk konten terbaru)
        id: serverEntry.id, // Perbarui ID (penting untuk entri baru)
        mood: serverEntry.mood, // Perbarui mood dari server
        updated_at: serverEntry.updated_at, // Perbarui timestamp
      }));

      setSavedContent(serverEntry.content || ''); // Tandai konten yang baru saja disimpan
      await fetchEntryList()
    } catch (error) {
      console.error("Gagal menyimpan entri:", error)
    } finally {
      setIsSaving(false)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    }
  }, [fetchEntryList])

  useEffect(() => {
    if (!isLoading && debouncedContent !== null && debouncedContent !== savedContent) {
      handleSave({
        entry_date: selectedDate,
        content: debouncedContent,
        mood: currentEntry.mood,
      })
    }
  }, [debouncedContent, selectedDate, currentEntry.mood, isLoading, savedContent, handleSave])

  const handleMoodSelect = (mood) => {
    const newMood = currentEntry.mood === mood ? null : mood
    const updatedEntry = { ...currentEntry, mood: newMood };
    setCurrentEntry(updatedEntry);
    handleSave({
      entry_date: selectedDate,
      content: updatedEntry.content,
      mood: newMood,
    })
  }

  const handleBlur = () => {
    if (currentEntry.content !== savedContent) {
        handleSave({
            entry_date: selectedDate,
            content: currentEntry.content,
            mood: currentEntry.mood,
        });
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Book className="w-8 h-8 text-blue-600" />
          Jurnal Harian, {currentUser.name.split(' ')[0]}
        </h1>
        <p className="text-slate-600 mt-1">Ruang pribadimu untuk refleksi dan mencatat ide.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-fit">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-500" />
            Entri Jurnal
          </h2>
          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center justify-between ${selectedDate === new Date().toISOString().split('T')[0] ? 'bg-blue-100 text-blue-800 font-semibold' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              <span>Hari Ini</span>
              {entries.find(e => e.entry_date === new Date().toISOString().split('T')[0] && e.content) && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
            </button>
            
            {entries.filter(e => e.entry_date !== new Date().toISOString().split('T')[0]).map(entry => (
              <button
                key={entry.id}
                onClick={() => setSelectedDate(entry.entry_date)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center justify-between ${selectedDate === entry.entry_date ? 'bg-blue-100 text-blue-800 font-semibold' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <span>{formatDate(entry.entry_date, { weekday: undefined })}</span>
                {entry.content && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{formatDate(selectedDate)}</h3>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500 transition-opacity duration-300">
                {isSaving && <><Loader2 className="w-4 h-4 animate-spin" /><span>Menyimpan...</span></>}
                {isSaved && <><CheckCircle className="w-4 h-4 text-green-500" /><span>Tersimpan</span></>}
              </div>
            </div>

            {isLoading ? (
              <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
            ) : (
              <>
                <MoodPicker selectedMood={currentEntry.mood} onSelectMood={handleMoodSelect} />
                <textarea
                  value={currentEntry.content || ''}
                  onChange={(e) => setCurrentEntry(prev => ({ ...prev, content: e.target.value }))}
                  onBlur={handleBlur}
                  placeholder="Mulai tulis catatanmu di sini..."
                  className="w-full h-96 mt-4 p-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-base leading-relaxed text-slate-800 resize-none"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
