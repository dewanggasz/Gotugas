"use client"

import { useState } from "react"
import { login } from "../services/api"
import { Loader2, Mail, Lock, Eye, EyeOff, Sparkles, Shield, ArrowRight } from "lucide-react"

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      const response = await login({ email, password })
      onLoginSuccess(response.data.token)
    } catch (err) {
      setError("Login gagal. Periksa kembali kredensial Anda.")
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-full blur-2xl animate-pulse delay-500" />

      {/* Floating particles */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-300" />
      <div className="absolute top-40 right-32 w-1 h-1 bg-cyan-400 rounded-full animate-ping delay-700" />
      <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse delay-1000" />
      <div className="absolute bottom-20 right-20 w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-500" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-md">
          {/* Main Card - Reduced height */}
          <div className="relative backdrop-blur-xl bg-white/80 border border-white/20 rounded-3xl shadow-2xl p-6 md:p-8 overflow-hidden">
            {/* Card background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-blue-50/30 rounded-3xl" />

            {/* Subtle glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur opacity-30" />

            <div className="relative z-10">
              {/* Header - Reduced spacing */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-3">
                  <div className="relative">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse" />
                  </div>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                  GotuGas
                </h1>
                <p className="text-slate-600 text-sm flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  Selamat datang
                </p>
              </div>

              {/* Form - Reduced spacing */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Message */}
                {error && (
                  <div className="relative backdrop-blur-sm bg-red-50/80 border border-red-200/50 text-red-700 p-3 rounded-2xl text-sm animate-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      {error}
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 backdrop-blur-sm bg-white/70 border-2 border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-sm placeholder-slate-400 hover:bg-white/80 hover:border-white/30"
                      placeholder="nama@contoh.com"
                      required
                      disabled={isLoading}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 pointer-events-none" />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700 flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4 text-blue-500" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 backdrop-blur-sm bg-white/70 border-2 border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-sm placeholder-slate-400 hover:bg-white/80 hover:border-white/30"
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 pointer-events-none" />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button type="submit" className="relative w-full group overflow-hidden" disabled={isLoading}>
                    <div className="relative bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-2xl font-semibold text-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed group-hover:scale-[1.02] flex items-center justify-center gap-2">
                      {/* Button background animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Memuat...</span>
                          </>
                        ) : (
                          <>
                            <span>Masuk</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                          </>
                        )}
                      </div>

                      {/* Shimmer effect */}
                      <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer" />
                    </div>
                  </button>
                </div>

                {/* Additional Info */}
                <div className="text-center pt-3">
                  <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                    <Shield className="w-3 h-3" />
                    Dilindungi dengan enkripsi end-to-end
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 1.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
