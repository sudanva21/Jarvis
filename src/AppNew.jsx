import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ArcReactorV2 from './components/ArcReactorV2'
import ChatInterface from './components/ChatInterface'
import TaskManager from './components/TaskManager'
import SystemStatus from './components/SystemStatus'
import SettingsPanel from './components/SettingsPanel'
import AuthModal from './components/AuthModal'
import HUDPanels from './components/HUDPanels'
import ParticleField from './components/ParticleField'
import { Mic, MicOff, MessageSquare, Calendar, Settings, Power, LogOut, User, X, Volume2 } from 'lucide-react'
import { API_ENDPOINTS } from './config'

function App() {
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState([])
  const [tasks, setTasks] = useState([])
  const [systemStatus, setSystemStatus] = useState({
    cpu: 0,
    memory: 0,
    status: 'online'
  })
  const [showChat, setShowChat] = useState(false)
  const [showTasks, setShowTasks] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAuth, setShowAuth] = useState(true) // Show auth on startup
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [transcript, setTranscript] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const synthRef = React.useRef(window.speechSynthesis)
  const recognitionRef = React.useRef(null)
  const [voiceSettings, setVoiceSettings] = useState({
    voiceEnabled: true,
    voiceSpeed: 0.9,
    volume: 0.8
  })
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

  const loadTasks = async () => {
    try {
      // Get token from localStorage
      const token = user?.token || localStorage.getItem('jarvis_token')
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(API_ENDPOINTS.tasks, { headers })
      const data = await response.json()
      if (data.tasks) {
        setTasks(data.tasks)
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }

  useEffect(() => {
    // Check if user is already authenticated
    const savedUser = localStorage.getItem('jarvis_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setIsAuthenticated(true)
      setShowAuth(false)
      initializeJarvis()
    }

    // Load tasks from backend
    loadTasks()

    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        // Interrupt JARVIS if he's speaking and user starts talking
        if ((interimTranscript || finalTranscript) && synthRef.current && synthRef.current.speaking) {
          synthRef.current.cancel()
          setIsSpeaking(false)
        }

        setTranscript(interimTranscript || finalTranscript)

        if (finalTranscript) {
          handleVoiceCommand(finalTranscript.trim())
          setTranscript('')
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone permissions in your browser.')
        }
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        if (isListening) {
          try {
            recognitionRef.current.start()
          } catch (e) {
            console.log('Recognition restart failed:', e)
          }
        }
      }
    } else {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.')
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Load voice settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('jarvis_settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setVoiceSettings({
          voiceEnabled: parsed.voiceEnabled ?? true,
          voiceSpeed: parsed.voiceSpeed ?? 0.9,
          volume: parsed.volume ?? 0.8
        })
      } catch (e) {
        console.error('Error loading settings:', e)
      }
    }

    // Listen for settings changes
    const handleSettingsChange = (event) => {
      const newSettings = event.detail
      setVoiceSettings({
        voiceEnabled: newSettings.voiceEnabled ?? true,
        voiceSpeed: newSettings.voiceSpeed ?? 0.9,
        volume: newSettings.volume ?? 0.8
      })
    }

    window.addEventListener('jarvis-settings-changed', handleSettingsChange)
    return () => {
      window.removeEventListener('jarvis-settings-changed', handleSettingsChange)
    }
  }, [])

  // Speak JARVIS responses
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.type === 'jarvis' && lastMessage.text && voiceSettings.voiceEnabled) {
      speak(lastMessage.text)
    }
  }, [messages, voiceSettings])

  const speak = (text) => {
    if (synthRef.current && text && voiceSettings.voiceEnabled) {
      // Cancel any ongoing speech
      synthRef.current.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = voiceSettings.voiceSpeed
      utterance.pitch = 1.0
      utterance.volume = voiceSettings.volume
      
      // Try to use a male British voice for JARVIS effect
      const voices = synthRef.current.getVoices()
      const jarvisVoice = voices.find(voice => 
        voice.name.includes('Google UK English Male') ||
        voice.name.includes('Microsoft David') ||
        voice.name.includes('Daniel') ||
        voice.name.includes('Male')
      )
      if (jarvisVoice) {
        utterance.voice = jarvisVoice
      }

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      
      // Small delay to ensure voices are loaded
      setTimeout(() => {
        synthRef.current.speak(utterance)
      }, 100)
    }
  }

  const initializeJarvis = () => {
    const hour = new Date().getHours()
    let timeGreeting = 'evening'
    if (hour >= 5 && hour < 12) timeGreeting = 'morning'
    else if (hour >= 12 && hour < 17) timeGreeting = 'afternoon'
    
    const greetings = [
      `Good ${timeGreeting}, sir. JARVIS at your service. All systems operational. Try not to break anything today.`,
      `Ah, good ${timeGreeting}, sir. I was just running some diagnostics. Turns out, I'm still smarter than your average toaster.`,
      `Well, well, look who decided to show up. Good ${timeGreeting}, sir. Shall we save the world today, or just order pizza?`,
      `Hello, sir. JARVIS reporting for duty. I promise to be only mildly sarcastic today.`
    ]
    
    const greeting = {
      id: Date.now(),
      type: 'jarvis',
      text: greetings[Math.floor(Math.random() * greetings.length)],
      timestamp: new Date()
    }
    setMessages([greeting])

    // System status updates
    const statusInterval = setInterval(() => {
      setSystemStatus({
        cpu: Math.random() * 30 + 10,
        memory: Math.random() * 40 + 20,
        status: 'online'
      })
    }, 2000)

    return () => clearInterval(statusInterval)
  }

  const handleAuth = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    setShowAuth(false)
    localStorage.setItem('jarvis_user', JSON.stringify(userData))
    initializeJarvis()
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('jarvis_user')
    setMessages([])
    setShowAuth(true)
  }

  const handleVoiceCommand = async (command) => {
    // Add user message
    const userMessage = {
      type: 'user',
      text: command,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])

    try {
      // Get token from localStorage
      const token = user?.token || localStorage.getItem('jarvis_token')
      const headers = { 'Content-Type': 'application/json' }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(API_ENDPOINTS.voiceCommand, {
        method: 'POST',
        headers,
        body: JSON.stringify({ command, sessionId })
      })

      const data = await response.json()

      // Add JARVIS response
      const jarvisMessage = {
        type: 'jarvis',
        text: data.response || 'Command processed, sir.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, jarvisMessage])

      // Speak the response if voice is enabled
      if (voiceSettings.voiceEnabled && data.response) {
        speak(data.response)
      }

      // Handle task operations
      if (data.task && data.taskCreated) {
        setTasks(prev => [...prev, data.task])
        
        // Show task notification
        const taskNotification = {
          type: 'system',
          text: `✅ Task Created: ${data.task.text}${data.task.scheduledFor ? ` (Scheduled for ${new Date(data.task.scheduledFor).toLocaleString()})` : ''}`,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, taskNotification])
        
        // Reload tasks to ensure UI is in sync
        loadTasks()
      }
      
      // Handle task deletion
      if (data.taskDeleted) {
        setTasks(prev => prev.filter(t => t.id !== data.taskId))
        
        const deleteNotification = {
          type: 'system',
          text: `🗑️ Task Deleted`,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, deleteNotification])
        
        loadTasks()
      }
      
      // Handle task completion
      if (data.taskCompleted) {
        setTasks(prev => prev.map(t => 
          t.id === data.taskId ? { ...t, completed: true } : t
        ))
        
        const completeNotification = {
          type: 'system',
          text: `✅ Task Completed`,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, completeNotification])
        
        loadTasks()
      }
      
      // Handle task update
      if (data.taskUpdated) {
        const updateNotification = {
          type: 'system',
          text: `📝 Task Updated`,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, updateNotification])
        
        loadTasks()
      }

      // If JARVIS is awaiting input, automatically start listening again
      if (data.awaitingInput && !isListening) {
        setTimeout(() => {
          if (recognitionRef.current && !isListening) {
            try {
              recognitionRef.current.start()
              setIsListening(true)
            } catch (error) {
              console.error('Error restarting recognition:', error)
            }
          }
        }, 2000) // Wait 2 seconds for JARVIS to finish speaking
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        type: 'jarvis',
        text: 'Apologies, sir. I seem to be experiencing technical difficulties.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const handleChatMessage = async (message) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: message,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    try {
      const response = await fetch(API_ENDPOINTS.chat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, userId: user?.id, sessionId: `${sessionId}_chat` })
      })
      const data = await response.json()
      
      const jarvisMessage = {
        id: Date.now() + 1,
        type: 'jarvis',
        text: data.response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, jarvisMessage])

      // If a task was created, add it to the tasks list and show notification
      if (data.task && data.taskCreated) {
        setTasks(prev => [...prev, data.task])
        
        // Show task notification
        const taskNotification = {
          id: Date.now() + 2,
          type: 'system',
          text: `✅ Task Created: ${data.task.text}${data.task.scheduledFor ? ` (Scheduled for ${new Date(data.task.scheduledFor).toLocaleString()})` : ''}`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, taskNotification])
        
        // Reload tasks to ensure UI is in sync
        loadTasks()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'jarvis',
        text: 'Apologies, sir. I seem to be experiencing technical difficulties.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const toggleListening = () => {
    if (isListening) {
      // Stop listening
      recognitionRef.current?.stop()
      setIsListening(false)
      setTranscript('')
    } else {
      // Stop any ongoing speech when starting to listen
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel()
        setIsSpeaking(false)
      }
      
      // Start listening
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
          setIsListening(true)
        } catch (error) {
          console.error('Error starting recognition:', error)
          alert('Could not start voice recognition. Please check microphone permissions.')
        }
      } else {
        alert('Voice recognition is not available. Please use Chrome, Edge, or Safari.')
      }
    }
  }

  if (showAuth) {
    return <AuthModal onAuth={handleAuth} />
  }

  return (
    <div className="relative w-screen h-screen bg-jarvis-darker overflow-y-auto overflow-x-hidden">
      {/* Particle Field Background */}
      <ParticleField isActive={isListening} />

      {/* Animated Background Grid */}
      <div className="fixed inset-0 opacity-20 pointer-events-none" style={{ zIndex: 2 }}>
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 217, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 217, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Scan Line Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 3 }}>
        <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-jarvis-blue to-transparent opacity-30 animate-scan" />
      </div>

      {/* HUD Panels - New Amazing Visual Elements */}
      <HUDPanels 
        systemStatus={systemStatus} 
        isListening={isListening} 
        isSpeaking={isSpeaking} 
      />

      {/* HUD Corner Elements */}
      <div className="fixed top-4 left-4 text-jarvis-blue/40 text-xs font-mono pointer-events-none z-50">
        <div>SYS_ID: JARVIS_v2.0</div>
        <div>USER: {user?.email || 'GUEST'}</div>
      </div>
      <div className="fixed top-4 right-4 text-jarvis-blue/40 text-xs font-mono pointer-events-none text-right z-50">
        <div>NEURAL_NET: ACTIVE</div>
        <div>LATENCY: &lt;10ms</div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-jarvis-darker/80 backdrop-blur-sm border-b border-jarvis-blue/20">
        <div className="flex items-center justify-between px-8 py-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <div className="w-10 h-10 rounded-full bg-jarvis-blue/20 flex items-center justify-center jarvis-glow">
              <Power className="w-5 h-5 text-jarvis-blue" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-glow">JARVIS</h1>
              <p className="text-xs text-jarvis-blue/70">Just A Rather Very Intelligent System</p>
            </div>
          </motion.div>

          <div className="flex items-center space-x-4">
            <SystemStatus status={systemStatus} />
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg glass-effect hover:bg-jarvis-blue/10 transition-all"
            >
              <Settings className="w-5 h-5 text-jarvis-blue" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg glass-effect hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-5 h-5 text-red-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <div className="relative pt-24 pb-8 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Centered Arc Reactor Section */}
          <div className="flex flex-col items-center justify-center mb-12">
            <ArcReactorV2 isListening={isListening} />
            
            {/* Voice Control Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleListening}
              className={`mt-8 relative p-6 rounded-full transition-all ${
                isListening
                  ? 'bg-jarvis-blue text-jarvis-darker jarvis-glow'
                  : 'glass-effect text-jarvis-blue hover:bg-jarvis-blue/10'
              }`}
            >
              {isListening ? (
                <Mic className="w-10 h-10" />
              ) : (
                <MicOff className="w-10 h-10" />
              )}
              
              {isListening && (
                <>
                  <span className="absolute inset-0 rounded-full bg-jarvis-blue animate-ping opacity-20" />
                  <span className="absolute inset-0 rounded-full bg-jarvis-blue animate-pulse opacity-30" />
                </>
              )}
            </motion.button>

            {/* Transcript Display */}
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 glass-effect rounded-lg p-4 max-w-2xl text-center"
              >
                <p className="text-jarvis-blue text-lg">{transcript}</p>
              </motion.div>
            )}

            {/* Speaking Indicator */}
            {isSpeaking && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center space-x-2 text-jarvis-blue"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Volume2 className="w-5 h-5" />
                </motion.div>
                <span className="text-sm font-semibold uppercase tracking-wider">JARVIS is speaking...</span>
              </motion.div>
            )}

            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-4 mt-8">
              <button
                onClick={() => { setShowChat(!showChat); setShowTasks(false); }}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                  showChat
                    ? 'bg-jarvis-blue text-jarvis-darker jarvis-glow'
                    : 'glass-effect text-jarvis-blue hover:bg-jarvis-blue/10'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="font-semibold">Chat</span>
              </button>
              <button
                onClick={() => { setShowTasks(!showTasks); setShowChat(false); }}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                  showTasks
                    ? 'bg-jarvis-blue text-jarvis-darker jarvis-glow'
                    : 'glass-effect text-jarvis-blue hover:bg-jarvis-blue/10'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">Tasks</span>
              </button>
              <button
                onClick={() => speak("Hello sir, I'm JARVIS. Voice synthesis is working perfectly.")}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg glass-effect text-jarvis-blue hover:bg-jarvis-blue/10 transition-all"
                title="Test Voice"
              >
                <Volume2 className="w-5 h-5" />
                <span className="font-semibold">Test Voice</span>
              </button>
            </div>
          </div>

          {/* Recent Messages Display */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="glass-effect rounded-lg p-6">
              <h3 className="text-jarvis-blue text-sm font-semibold mb-4 uppercase tracking-wider">Recent Interactions</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
                {messages.slice(-5).map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, x: message.type === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`inline-block px-4 py-2 rounded-lg max-w-md ${
                        message.type === 'user'
                          ? 'bg-jarvis-blue/20 text-jarvis-blue'
                          : 'bg-jarvis-blue/10 text-white border border-jarvis-blue/20'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Panels */}
          <AnimatePresence>
            {showChat && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="max-w-4xl mx-auto mb-8"
              >
                <div className="relative">
                  <button
                    onClick={() => setShowChat(false)}
                    className="absolute -top-2 -right-2 z-10 p-2 rounded-full bg-jarvis-blue/20 hover:bg-jarvis-blue/30 transition-all"
                  >
                    <X className="w-4 h-4 text-jarvis-blue" />
                  </button>
                  <ChatInterface
                    messages={messages}
                    onSendMessage={handleChatMessage}
                  />
                </div>
              </motion.div>
            )}

            {showTasks && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="max-w-4xl mx-auto mb-8"
              >
                <div className="relative">
                  <button
                    onClick={() => setShowTasks(false)}
                    className="absolute -top-2 -right-2 z-10 p-2 rounded-full bg-jarvis-blue/20 hover:bg-jarvis-blue/30 transition-all"
                  >
                    <X className="w-4 h-4 text-jarvis-blue" />
                  </button>
                  <TaskManager tasks={tasks} setTasks={setTasks} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Settings Panel Overlay */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel
            onClose={() => setShowSettings(false)}
            user={user}
            systemStatus={systemStatus}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative py-4 text-center text-jarvis-blue/40 text-xs">
        <p>JARVIS v2.0 - All Systems Operational</p>
      </footer>
    </div>
  )
}

export default App
