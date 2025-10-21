import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Power, Mail, Lock, User, AlertCircle } from 'lucide-react'

function AuthModal({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: isLogin ? undefined : name
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Clear any old data
        localStorage.removeItem('jarvis_user')
        localStorage.removeItem('jarvis_token')
        
        // Save new user data
        localStorage.setItem('jarvis_token', data.token)
        
        onAuth({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          token: data.token
        })
      } else {
        // Better error messages
        if (data.error && data.error.includes('already exists')) {
          setError('This email is already registered. Please login instead.')
        } else if (data.error && data.error.includes('Invalid credentials')) {
          setError('Invalid email or password. Please try again.')
        } else {
          setError(data.error || 'Authentication failed')
        }
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError('Connection error. Please check if the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleGuestAccess = () => {
    // Allow guest access without authentication
    onAuth({
      id: 'guest_' + Date.now(),
      email: 'guest@jarvis.ai',
      name: 'Guest User',
      token: null
    })
  }

  return (
    <div className="relative w-screen h-screen bg-jarvis-darker overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 217, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 217, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Scan Line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-jarvis-blue to-transparent opacity-30 animate-scan" />
      </div>

      {/* Auth Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-effect rounded-lg p-8 border border-jarvis-blue/20">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-jarvis-blue/20 flex items-center justify-center jarvis-glow mb-4">
              <Power className="w-8 h-8 text-jarvis-blue" />
            </div>
            <h1 className="text-3xl font-bold text-glow mb-2">JARVIS</h1>
            <p className="text-sm text-jarvis-blue/70 text-center">
              Just A Rather Very Intelligent System
            </p>
          </div>

          {/* Toggle Login/Register */}
          <div className="flex mb-6 p-1 rounded-lg bg-jarvis-blue/10">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-md transition-all ${
                isLogin
                  ? 'bg-jarvis-blue text-jarvis-darker font-semibold'
                  : 'text-jarvis-blue'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-md transition-all ${
                !isLogin
                  ? 'bg-jarvis-blue text-jarvis-darker font-semibold'
                  : 'text-jarvis-blue'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start space-x-2"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm text-jarvis-blue/70 mb-2">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-jarvis-blue/50" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tony Stark"
                    required={!isLogin}
                    className="w-full pl-10 pr-4 py-3 bg-jarvis-blue/10 border border-jarvis-blue/20 rounded-lg text-white placeholder-jarvis-blue/40 focus:outline-none focus:border-jarvis-blue/50 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-jarvis-blue/70 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-jarvis-blue/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tony@starkindustries.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-jarvis-blue/10 border border-jarvis-blue/20 rounded-lg text-white placeholder-jarvis-blue/40 focus:outline-none focus:border-jarvis-blue/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-jarvis-blue/70 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-jarvis-blue/50" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 bg-jarvis-blue/10 border border-jarvis-blue/20 rounded-lg text-white placeholder-jarvis-blue/40 focus:outline-none focus:border-jarvis-blue/50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-jarvis-blue text-jarvis-darker font-semibold hover:bg-jarvis-blue/90 transition-all jarvis-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
            </button>
          </form>

          {/* Guest Access */}
          <div className="mt-6 pt-6 border-t border-jarvis-blue/20">
            <button
              onClick={handleGuestAccess}
              className="w-full py-3 rounded-lg glass-effect text-jarvis-blue hover:bg-jarvis-blue/10 transition-all"
            >
              Continue as Guest
            </button>
            <p className="text-xs text-jarvis-blue/40 text-center mt-2">
              Guest mode has limited features (no database)
            </p>
          </div>
          
          {/* Clear Session Button */}
          {error && (
            <div className="mt-4">
              <button
                onClick={() => {
                  localStorage.clear()
                  setError('')
                  setEmail('')
                  setPassword('')
                  setName('')
                  window.location.reload()
                }}
                className="w-full py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all text-sm"
              >
                Clear Session & Reload
              </button>
              <p className="text-xs text-red-400/60 text-center mt-1">
                Use this if you're having login issues
              </p>
            </div>
          )}

          {/* Info */}
          <div className="mt-6 p-3 rounded-lg bg-jarvis-blue/5 border border-jarvis-blue/10">
            <p className="text-xs text-jarvis-blue/60 text-center">
              Your data is securely stored using Supabase with end-to-end encryption
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-jarvis-blue/40 text-xs mt-4">
          "Sometimes you gotta run before you can walk." - Tony Stark
        </p>
      </motion.div>
    </div>
  )
}

export default AuthModal
