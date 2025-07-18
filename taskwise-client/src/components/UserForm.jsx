import React, { useState, useEffect } from "react"
import { User, Mail, Shield, Briefcase, KeyRound, X } from "lucide-react"

// Komponen Input Field yang bisa digunakan kembali
const FormInput = ({ icon: Icon, name, type, value, onChange, placeholder, error, required = false }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">
      {placeholder}
    </label>
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`block w-full rounded-lg border-slate-300 py-2.5 pl-10 pr-3 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all ${
          error ? "border-red-500 ring-red-500" : ""
        }`}
        placeholder={`Masukkan ${placeholder.toLowerCase()}`}
      />
    </div>
    {error && <p className="mt-1 text-xs text-red-600">{error[0]}</p>}
  </div>
)

// Komponen Select Dropdown
const FormSelect = ({ icon: Icon, name, value, onChange, children, error, label }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">
      {label}
    </label>
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <select
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        className={`block w-full appearance-none rounded-lg border-slate-300 bg-white py-2.5 pl-10 pr-8 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all ${
          error ? "border-red-500 ring-red-500" : ""
        }`}
      >
        {children}
      </select>
    </div>
    {error && <p className="mt-1 text-xs text-red-600">{error[0]}</p>}
  </div>
)

const UserForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "employee",
    jabatan: "",
    password: "",
    password_confirmation: "",
  })
  const [errors, setErrors] = useState({})

  const isEditing = !!initialData

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData?.name || "",
        email: initialData?.email || "",
        role: initialData?.role || "employee",
        jabatan: initialData?.jabatan || "",
        password: "",
        password_confirmation: "",
      })
      setErrors({}) // Selalu reset error saat modal dibuka
    }
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // --- PERBAIKAN 1: Validasi Password di Frontend ---
    // Reset error password sebelum validasi baru
    setErrors(prev => ({...prev, password_confirmation: undefined}));

    if (formData.password && formData.password !== formData.password_confirmation) {
        setErrors({
            ...errors,
            password_confirmation: ["Konfirmasi password tidak cocok."]
        });
        return; // Hentikan pengiriman jika password tidak cocok
    }

    try {
      await onSubmit(formData)
      // --- PERBAIKAN 2: Tutup Form Setelah Berhasil ---
      onClose(); 
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors)
      } else {
        console.error("An unexpected error occurred:", error)
        alert("Terjadi kesalahan yang tidak terduga.")
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{isEditing ? "Edit Pengguna" : "Tambah Pengguna Baru"}</h2>
              <p className="text-sm text-slate-500">Isi detail pengguna di bawah ini.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Isi Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-6 max-h-[70vh] overflow-y-auto">
            <FormInput
              icon={User}
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nama Lengkap"
              error={errors.name}
              required
            />
            <FormInput
              icon={Mail}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Alamat Email"
              error={errors.email}
              required
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormSelect
                icon={Shield}
                name="role"
                value={formData.role}
                onChange={handleChange}
                error={errors.role}
                label="Peran"
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </FormSelect>
              <FormInput
                icon={Briefcase}
                name="jabatan"
                type="text"
                value={formData.jabatan}
                onChange={handleChange}
                placeholder="Jabatan"
                error={errors.jabatan}
              />
            </div>
            <div className="border-t border-slate-200 pt-5">
              <h3 className="text-base font-semibold text-slate-700 mb-1">Keamanan Akun</h3>
              <p className="text-sm text-slate-500 mb-4">
                {isEditing ? "Kosongkan jika tidak ingin mengubah password." : "Buat password yang kuat untuk pengguna baru."}
              </p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormInput
                  icon={KeyRound}
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  error={errors.password}
                  required={!isEditing}
                />
                <FormInput
                  icon={KeyRound}
                  name="password_confirmation"
                  type="password"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="Konfirmasi Password"
                  error={errors.password_confirmation}
                  required={!isEditing || !!formData.password}
                />
              </div>
            </div>
          </div>

          {/* Footer Modal (Tombol Aksi) */}
          <div className="flex items-center justify-end gap-3 rounded-b-xl border-t border-slate-200 bg-slate-50 p-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-300 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition-all"
            >
              {isEditing ? "Simpan Perubahan" : "Buat Pengguna"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserForm
