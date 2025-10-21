import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, User, Bot } from 'lucide-react'
import { format } from 'date-fns'

function ChatInterface({ messages, onSendMessage }) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input.trim())
      setInput('')
      inputRef.current?.focus()
    }
  }

  return (
    <div className="h-full flex flex-col glass-effect rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-jarvis-blue/20">
        <h2 className="text-xl font-bold text-jarvis-blue text-glow">Chat with JARVIS</h2>
        <p className="text-xs text-jarvis-blue/50">Type your message below</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start space-x-3 ${
              message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                message.type === 'user'
                  ? 'bg-jarvis-blue/20'
                  : 'bg-jarvis-blue/30 jarvis-glow'
              }`}
            >
              {message.type === 'user' ? (
                <User className="w-5 h-5 text-jarvis-blue" />
              ) : (
                <Bot className="w-5 h-5 text-jarvis-blue" />
              )}
            </div>

            {/* Message Content */}
            <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
              <div
                className={`inline-block max-w-[80%] px-4 py-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-jarvis-blue/20 text-white'
                    : 'bg-jarvis-blue/10 text-white border border-jarvis-blue/20'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
              <p className="text-xs text-jarvis-blue/40 mt-1">
                {format(message.timestamp, 'HH:mm')}
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-jarvis-blue/20">
        <div className="flex items-center space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-jarvis-blue/10 border border-jarvis-blue/20 rounded-lg px-4 py-3 text-white placeholder-jarvis-blue/40 focus:outline-none focus:border-jarvis-blue/50 transition-all"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!input.trim()}
            className="p-3 rounded-lg bg-jarvis-blue text-jarvis-darker hover:bg-jarvis-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all jarvis-glow"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </form>
    </div>
  )
}

export default ChatInterface
