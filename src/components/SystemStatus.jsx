import React from 'react'
import { motion } from 'framer-motion'
import { Cpu, HardDrive, Wifi } from 'lucide-react'

function SystemStatus({ status }) {
  return (
    <div className="flex items-center space-x-4">
      {/* CPU Usage */}
      <div className="flex items-center space-x-2">
        <Cpu className="w-4 h-4 text-jarvis-blue" />
        <div className="flex flex-col">
          <span className="text-xs text-jarvis-blue/70">CPU</span>
          <div className="flex items-center space-x-1">
            <div className="w-16 h-1.5 bg-jarvis-blue/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-jarvis-blue rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${status.cpu}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs text-jarvis-blue font-mono">
              {Math.round(status.cpu)}%
            </span>
          </div>
        </div>
      </div>

      {/* Memory Usage */}
      <div className="flex items-center space-x-2">
        <HardDrive className="w-4 h-4 text-jarvis-blue" />
        <div className="flex flex-col">
          <span className="text-xs text-jarvis-blue/70">MEM</span>
          <div className="flex items-center space-x-1">
            <div className="w-16 h-1.5 bg-jarvis-blue/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-jarvis-blue rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${status.memory}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs text-jarvis-blue font-mono">
              {Math.round(status.memory)}%
            </span>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Wifi className="w-4 h-4 text-jarvis-blue" />
          <motion.div
            className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <span className="text-xs text-jarvis-blue font-semibold uppercase">
          {status.status}
        </span>
      </div>
    </div>
  )
}

export default SystemStatus
