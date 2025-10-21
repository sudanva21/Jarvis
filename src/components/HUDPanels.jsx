import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Cpu, HardDrive, Wifi, Zap, Brain, Database, Shield, Clock, TrendingUp } from 'lucide-react'

function HUDPanels({ systemStatus, isListening, isSpeaking }) {
  const [time, setTime] = useState(new Date())
  const [aiActivity, setAiActivity] = useState(0)
  const [networkSpeed, setNetworkSpeed] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Simulate AI activity
    const interval = setInterval(() => {
      setAiActivity(Math.random() * 100)
      setNetworkSpeed(Math.random() * 1000)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* TOP LEFT - System Diagnostics */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-20 left-4 z-30 w-72"
      >
        <div className="glass-effect rounded-lg p-4 border border-jarvis-blue/20">
          <div className="flex items-center space-x-2 mb-3">
            <Activity className="w-4 h-4 text-jarvis-blue animate-pulse" />
            <h3 className="text-xs font-bold text-jarvis-blue uppercase tracking-wider">System Diagnostics</h3>
          </div>
          
          <div className="space-y-2">
            {/* CPU */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-3 h-3 text-jarvis-blue/70" />
                  <span className="text-xs text-jarvis-blue/70">CPU</span>
                </div>
                <span className="text-xs text-jarvis-blue font-mono">{Math.round(systemStatus.cpu)}%</span>
              </div>
              <div className="h-1 bg-jarvis-darker rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-jarvis-blue to-cyan-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${systemStatus.cpu}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Memory */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-3 h-3 text-jarvis-blue/70" />
                  <span className="text-xs text-jarvis-blue/70">Memory</span>
                </div>
                <span className="text-xs text-jarvis-blue font-mono">{Math.round(systemStatus.memory)}%</span>
              </div>
              <div className="h-1 bg-jarvis-darker rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${systemStatus.memory}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* AI Activity */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <Brain className="w-3 h-3 text-jarvis-blue/70" />
                  <span className="text-xs text-jarvis-blue/70">AI Activity</span>
                </div>
                <span className="text-xs text-jarvis-blue font-mono">{Math.round(aiActivity)}%</span>
              </div>
              <div className="h-1 bg-jarvis-darker rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                  animate={{ width: `${aiActivity}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="mt-3 pt-3 border-t border-jarvis-blue/10">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
                <span className="text-jarvis-blue/60">Listening</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-blue-400 animate-pulse' : 'bg-gray-600'}`} />
                <span className="text-jarvis-blue/60">Speaking</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* TOP RIGHT - Network & Security */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="fixed top-20 right-4 z-30 w-72"
      >
        <div className="glass-effect rounded-lg p-4 border border-jarvis-blue/20">
          <div className="flex items-center space-x-2 mb-3">
            <Shield className="w-4 h-4 text-jarvis-blue animate-pulse" />
            <h3 className="text-xs font-bold text-jarvis-blue uppercase tracking-wider">Network & Security</h3>
          </div>
          
          <div className="space-y-3">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wifi className="w-3 h-3 text-green-400" />
                <span className="text-xs text-jarvis-blue/70">Connection</span>
              </div>
              <span className="text-xs text-green-400 font-semibold">SECURE</span>
            </div>

            {/* Network Speed */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-3 h-3 text-jarvis-blue/70" />
                  <span className="text-xs text-jarvis-blue/70">Network</span>
                </div>
                <span className="text-xs text-jarvis-blue font-mono">{Math.round(networkSpeed)} Mbps</span>
              </div>
              <div className="h-1 bg-jarvis-darker rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-400"
                  animate={{ width: `${(networkSpeed / 1000) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Security Level */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-3 h-3 text-jarvis-blue/70" />
                <span className="text-xs text-jarvis-blue/70">Encryption</span>
              </div>
              <span className="text-xs text-jarvis-blue font-mono">AES-256</span>
            </div>

            {/* Database */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-3 h-3 text-jarvis-blue/70" />
                <span className="text-xs text-jarvis-blue/70">Database</span>
              </div>
              <span className="text-xs text-green-400 font-semibold">ONLINE</span>
            </div>
          </div>

          {/* API Status */}
          <div className="mt-3 pt-3 border-t border-jarvis-blue/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-jarvis-blue/60">Groq API</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 font-semibold">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* BOTTOM LEFT - Time & Date */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed bottom-20 left-4 z-30 w-72"
      >
        <div className="glass-effect rounded-lg p-4 border border-jarvis-blue/20">
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="w-4 h-4 text-jarvis-blue animate-pulse" />
            <h3 className="text-xs font-bold text-jarvis-blue uppercase tracking-wider">System Time</h3>
          </div>
          
          <div className="space-y-2">
            {/* Time */}
            <div className="text-center">
              <div className="text-3xl font-bold text-jarvis-blue font-mono tracking-wider">
                {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-xs text-jarvis-blue/60 mt-1">
                {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {/* Timezone */}
            <div className="pt-2 border-t border-jarvis-blue/10">
              <div className="flex items-center justify-between text-xs">
                <span className="text-jarvis-blue/60">Timezone</span>
                <span className="text-jarvis-blue font-mono">
                  {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* BOTTOM RIGHT - Power & Performance */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="fixed bottom-20 right-4 z-30 w-72"
      >
        <div className="glass-effect rounded-lg p-4 border border-jarvis-blue/20">
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="w-4 h-4 text-jarvis-blue animate-pulse" />
            <h3 className="text-xs font-bold text-jarvis-blue uppercase tracking-wider">Power Status</h3>
          </div>
          
          <div className="space-y-3">
            {/* Power Level */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-jarvis-blue/70">Power Level</span>
                <span className="text-xs text-jarvis-blue font-mono">{isListening ? '100%' : '85%'}</span>
              </div>
              <div className="h-2 bg-jarvis-darker rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-jarvis-blue via-cyan-400 to-blue-500"
                  animate={{ width: isListening ? '100%' : '85%' }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="h-full w-full animate-pulse opacity-50 bg-white" />
                </motion.div>
              </div>
            </div>

            {/* System Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-jarvis-blue/60 mb-1">Uptime</div>
                <div className="text-jarvis-blue font-mono">24h 15m</div>
              </div>
              <div>
                <div className="text-jarvis-blue/60 mb-1">Requests</div>
                <div className="text-jarvis-blue font-mono">1,247</div>
              </div>
              <div>
                <div className="text-jarvis-blue/60 mb-1">Latency</div>
                <div className="text-green-400 font-mono">&lt;10ms</div>
              </div>
              <div>
                <div className="text-jarvis-blue/60 mb-1">Status</div>
                <div className="text-green-400 font-semibold">OPTIMAL</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default HUDPanels
