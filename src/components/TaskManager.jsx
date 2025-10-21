import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, CheckCircle, Circle, Trash2, Plus } from 'lucide-react'
import { format } from 'date-fns'

function TaskManager({ tasks, setTasks }) {
  const [newTask, setNewTask] = useState('')
  const [newTaskTime, setNewTaskTime] = useState('')

  const addTask = (e) => {
    e.preventDefault()
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        text: newTask,
        completed: false,
        createdAt: new Date(),
        scheduledFor: newTaskTime ? new Date(newTaskTime) : null
      }
      setTasks([...tasks, task])
      setNewTask('')
      setNewTaskTime('')
    }
  }

  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    if (a.scheduledFor && b.scheduledFor) {
      return new Date(a.scheduledFor) - new Date(b.scheduledFor)
    }
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  return (
    <div className="h-full flex flex-col glass-effect rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-jarvis-blue/20">
        <h2 className="text-xl font-bold text-jarvis-blue text-glow">Task Manager</h2>
        <p className="text-xs text-jarvis-blue/50">
          {tasks.filter(t => !t.completed).length} active tasks
        </p>
      </div>

      {/* Add Task Form */}
      <form onSubmit={addTask} className="p-4 border-b border-jarvis-blue/20">
        <div className="space-y-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="w-full bg-jarvis-blue/10 border border-jarvis-blue/20 rounded-lg px-4 py-2 text-white placeholder-jarvis-blue/40 focus:outline-none focus:border-jarvis-blue/50 transition-all text-sm"
          />
          <div className="flex items-center space-x-2">
            <input
              type="datetime-local"
              value={newTaskTime}
              onChange={(e) => setNewTaskTime(e.target.value)}
              className="flex-1 bg-jarvis-blue/10 border border-jarvis-blue/20 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-jarvis-blue/50 transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!newTask.trim()}
              className="p-2 rounded-lg bg-jarvis-blue text-jarvis-darker hover:bg-jarvis-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </form>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
        <AnimatePresence>
          {sortedTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-jarvis-blue/40"
            >
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No tasks yet. Add one to get started!</p>
            </motion.div>
          ) : (
            sortedTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`glass-effect rounded-lg p-4 border transition-all ${
                  task.completed
                    ? 'border-jarvis-blue/10 opacity-60'
                    : 'border-jarvis-blue/20 hover:border-jarvis-blue/40'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex-shrink-0 mt-0.5"
                  >
                    {task.completed ? (
                      <CheckCircle className="w-5 h-5 text-jarvis-blue" />
                    ) : (
                      <Circle className="w-5 h-5 text-jarvis-blue/50 hover:text-jarvis-blue transition-colors" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${
                        task.completed
                          ? 'line-through text-jarvis-blue/40'
                          : 'text-white'
                      }`}
                    >
                      {task.text}
                    </p>
                    {task.scheduledFor && (
                      <div className="flex items-center space-x-1 mt-1 text-xs text-jarvis-blue/60">
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(task.scheduledFor), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="flex-shrink-0 text-red-400/50 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default TaskManager
