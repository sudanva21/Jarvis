import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Volume2 } from 'lucide-react'

function VoiceInterface({ isListening, setIsListening, onCommand, messages }) {
  const [transcript, setTranscript] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const recognitionRef = useRef(null)
  const synthRef = useRef(window.speechSynthesis)

  useEffect(() => {
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

        setTranscript(interimTranscript || finalTranscript)

        if (finalTranscript) {
          onCommand(finalTranscript.trim())
          setTranscript('')
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start()
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  useEffect(() => {
    // Speak JARVIS responses
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.type === 'jarvis' && lastMessage.text) {
      speak(lastMessage.text)
    }
  }, [messages])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      recognitionRef.current?.start()
      setIsListening(true)
    }
  }

  const speak = (text) => {
    if (synthRef.current && text) {
      // Cancel any ongoing speech
      synthRef.current.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      // Try to use a male British voice for JARVIS effect
      const voices = synthRef.current.getVoices()
      const jarvisVoice = voices.find(voice => 
        voice.name.includes('Google UK English Male') ||
        voice.name.includes('Microsoft David') ||
        voice.name.includes('Daniel')
      )
      if (jarvisVoice) {
        utterance.voice = jarvisVoice
      }

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      
      synthRef.current.speak(utterance)
    }
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      {/* Voice Control Button */}
      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleListening}
          className={`relative p-8 rounded-full transition-all ${
            isListening
              ? 'bg-jarvis-blue text-jarvis-darker jarvis-glow'
              : 'glass-effect text-jarvis-blue hover:bg-jarvis-blue/10'
          }`}
        >
          {isListening ? (
            <Mic className="w-12 h-12" />
          ) : (
            <MicOff className="w-12 h-12" />
          )}
          
          {/* Pulse rings when listening */}
          {isListening && (
            <>
              <span className="absolute inset-0 rounded-full bg-jarvis-blue animate-ping opacity-20" />
              <span className="absolute inset-0 rounded-full bg-jarvis-blue animate-pulse opacity-30" />
            </>
          )}
        </motion.button>
      </div>

      {/* Transcript Display */}
      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-lg p-4 text-center"
        >
          <p className="text-jarvis-blue text-lg">{transcript}</p>
        </motion.div>
      )}

      {/* Recent Messages */}
      <div className="glass-effect rounded-lg p-6 max-h-48 overflow-y-auto scrollbar-hide">
        {messages.slice(-3).map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, x: message.type === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`mb-4 last:mb-0 ${
              message.type === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-jarvis-blue/20 text-jarvis-blue'
                  : 'bg-jarvis-blue/10 text-white'
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          </motion.div>
        ))}
        
        {isSpeaking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center space-x-2 text-jarvis-blue"
          >
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span className="text-sm">JARVIS is speaking...</span>
          </motion.div>
        )}
      </div>

      {/* Voice Commands Help */}
      <div className="glass-effect rounded-lg p-4">
        <h3 className="text-jarvis-blue text-sm font-semibold mb-2">Voice Commands:</h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-jarvis-blue/70">
          <div>"What time is it?"</div>
          <div>"Set a reminder"</div>
          <div>"Schedule a meeting"</div>
          <div>"Search for..."</div>
          <div>"Open calculator"</div>
          <div>"Tell me a joke"</div>
        </div>
      </div>
    </div>
  )
}

export default VoiceInterface
