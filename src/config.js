// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  health: `${API_URL}/api/health`,
  chat: `${API_URL}/api/chat`,
  voiceCommand: `${API_URL}/api/voice-command`,
  tasks: `${API_URL}/api/tasks`,
  register: `${API_URL}/api/auth/register`,
  login: `${API_URL}/api/auth/login`,
  user: `${API_URL}/api/auth/user`,
};
