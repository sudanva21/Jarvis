import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Volume2, Mic, Bell, Shield, Database, Zap, User } from 'lucide-react'

function SettingsPanel({ onClose, user, systemStatus }) {
  const [settings, setSettings] = useState({
    voiceEnabled: true,
    voiceSpeed: 0.9,
    volume: 0.8,
    notifications: true,
    autoListen: false,
    theme: 'dark'
  })

  // Load settings on mount
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('jarvis_settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
      } catch (e) {
        console.error('Error loading settings:', e)
      }
    }
  }, [])

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    // Save to localStorage immediately
    localStorage.setItem('jarvis_settings', JSON.stringify(newSettings))
    
    // Apply settings immediately
    if (key === 'voiceSpeed' || key === 'volume' || key === 'voiceEnabled') {
      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('jarvis-settings-changed', { 
        detail: newSettings 
      }))
    }
  }

  const handleSave = () => {
    localStorage.setItem('jarvis_settings', JSON.stringify(settings))
    window.dispatchEvent(new CustomEvent('jarvis-settings-changed', { 
      detail: settings 
    }))
    alert('Settings saved successfully!')
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto glass-effect rounded-lg p-8 m-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-jarvis-blue text-glow">Settings</h2>
            <p className="text-sm text-jarvis-blue/60">Configure JARVIS to your preferences</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-jarvis-blue/10 transition-all"
          >
            <X className="w-6 h-6 text-jarvis-blue" />
          </button>
        </div>

        {/* User Info */}
        <div className="mb-6 p-4 rounded-lg bg-jarvis-blue/10 border border-jarvis-blue/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-jarvis-blue/20 flex items-center justify-center">
              <User className="w-6 h-6 text-jarvis-blue" />
            </div>
            <div>
              <p className="text-white font-semibold">{user?.email || 'Guest User'}</p>
              <p className="text-xs text-jarvis-blue/60">Account Status: Active</p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mb-6 p-4 rounded-lg bg-jarvis-blue/5 border border-jarvis-blue/10">
          <h3 className="text-sm font-semibold text-jarvis-blue mb-3 flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            System Performance
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-jarvis-blue/60">CPU Usage</p>
              <p className="text-lg font-mono text-jarvis-blue">{Math.round(systemStatus.cpu)}%</p>
            </div>
            <div>
              <p className="text-xs text-jarvis-blue/60">Memory</p>
              <p className="text-lg font-mono text-jarvis-blue">{Math.round(systemStatus.memory)}%</p>
            </div>
            <div>
              <p className="text-xs text-jarvis-blue/60">Status</p>
              <p className="text-lg font-mono text-green-400 uppercase">{systemStatus.status}</p>
            </div>
            <div>
              <p className="text-xs text-jarvis-blue/60">Uptime</p>
              <p className="text-lg font-mono text-jarvis-blue">24h 15m</p>
            </div>
          </div>
        </div>

        {/* Voice Settings */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-jarvis-blue mb-3 flex items-center">
            <Volume2 className="w-4 h-4 mr-2" />
            Voice Settings
          </h3>
          
          <div className="space-y-4">
            {/* Voice Enabled */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm">Voice Responses</p>
                <p className="text-xs text-jarvis-blue/60">Enable JARVIS voice output</p>
              </div>
              <button
                onClick={() => handleSettingChange('voiceEnabled', !settings.voiceEnabled)}
                className={`relative w-12 h-6 rounded-full transition-all ${
                  settings.voiceEnabled ? 'bg-jarvis-blue' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    settings.voiceEnabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Voice Speed */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-white text-sm">Voice Speed</p>
                <span className="text-jarvis-blue text-sm font-mono">{settings.voiceSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={settings.voiceSpeed}
                onChange={(e) => handleSettingChange('voiceSpeed', parseFloat(e.target.value))}
                className="w-full accent-jarvis-blue"
              />
            </div>

            {/* Volume */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-white text-sm">Volume</p>
                <span className="text-jarvis-blue text-sm font-mono">{Math.round(settings.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.volume}
                onChange={(e) => handleSettingChange('volume', parseFloat(e.target.value))}
                className="w-full accent-jarvis-blue"
              />
            </div>
          </div>
        </div>

        {/* Microphone Settings */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-jarvis-blue mb-3 flex items-center">
            <Mic className="w-4 h-4 mr-2" />
            Microphone Settings
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm">Auto-Listen Mode</p>
              <p className="text-xs text-jarvis-blue/60">Automatically start listening on page load</p>
            </div>
            <button
              onClick={() => handleSettingChange('autoListen', !settings.autoListen)}
              className={`relative w-12 h-6 rounded-full transition-all ${
                settings.autoListen ? 'bg-jarvis-blue' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                  settings.autoListen ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-jarvis-blue mb-3 flex items-center">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm">Enable Notifications</p>
              <p className="text-xs text-jarvis-blue/60">Receive alerts for tasks and reminders</p>
            </div>
            <button
              onClick={() => handleSettingChange('notifications', !settings.notifications)}
              className={`relative w-12 h-6 rounded-full transition-all ${
                settings.notifications ? 'bg-jarvis-blue' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                  settings.notifications ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-jarvis-blue mb-3 flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Data & Privacy
          </h3>
          
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-jarvis-blue/5 border border-jarvis-blue/10">
              <p className="text-white text-sm mb-1">Data Storage</p>
              <p className="text-xs text-jarvis-blue/60">Your conversations and tasks are stored securely in Supabase</p>
            </div>
            <div className="p-3 rounded-lg bg-jarvis-blue/5 border border-jarvis-blue/10">
              <p className="text-white text-sm mb-1">Encryption</p>
              <p className="text-xs text-jarvis-blue/60">All data is encrypted using AES-256 encryption</p>
            </div>
          </div>
        </div>

        {/* Database Info */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-jarvis-blue mb-3 flex items-center">
            <Database className="w-4 h-4 mr-2" />
            Database Connection
          </h3>
          
          <div className="p-4 rounded-lg bg-jarvis-blue/5 border border-jarvis-blue/10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white text-sm">Backend Status</p>
              <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">Connected</span>
            </div>
            <p className="text-xs text-jarvis-blue/60 mb-1">API: http://localhost:5000</p>
            <p className="text-xs text-jarvis-blue/60">Database: Supabase</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 rounded-lg bg-jarvis-blue text-jarvis-darker font-semibold hover:bg-jarvis-blue/90 transition-all jarvis-glow"
          >
            Save Settings
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('jarvis_settings')
              window.location.reload()
            }}
            className="px-4 py-3 rounded-lg glass-effect text-jarvis-blue hover:bg-jarvis-blue/10 transition-all"
          >
            Reset to Default
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SettingsPanel
