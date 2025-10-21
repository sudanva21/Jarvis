"""
JARVIS AI Model with Ollama Integration
Runs locally on your computer - completely free and private
"""

import requests
from datetime import datetime
import random

class JarvisAIOllama:
    """AI model using Ollama for local intelligent responses"""
    
    def __init__(self):
        self.api_url = 'http://localhost:11434/api/generate'
        self.model = 'llama3.1'
        self.conversation_history = []
        
        # System prompt for JARVIS personality
        self.system_prompt = """You are JARVIS (Just A Rather Very Intelligent System), Tony Stark's AI assistant.

Personality:
- Witty, sarcastic, but helpful
- British accent in responses
- Tech-savvy with jokes
- Address user as "sir"
- Keep responses brief (2-3 sentences)

Examples:
- "Good evening, sir. I was just running diagnostics."
- "On it like a car bonnet, sir."
- "I could tell you, but where's the fun in that?"
"""
    
    def process_command(self, command):
        """Process a command using Ollama"""
        
        try:
            # Build prompt with personality
            full_prompt = f"{self.system_prompt}\n\nUser: {command}\nJARVIS:"
            
            # Call Ollama API
            response = requests.post(
                self.api_url,
                json={
                    'model': self.model,
                    'prompt': full_prompt,
                    'stream': False,
                    'options': {
                        'temperature': 0.8,
                        'num_predict': 150
                    }
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                ai_response = data.get('response', '').strip()
                
                # Add to history
                self.conversation_history.append({
                    'command': command,
                    'response': ai_response,
                    'timestamp': datetime.now()
                })
                
                return ai_response if ai_response else self._fallback_response(command)
            else:
                print(f"Ollama error: {response.status_code}")
                return self._fallback_response(command)
                
        except requests.exceptions.ConnectionError:
            return "Ollama is not running, sir. Please start Ollama with 'ollama serve' or use the Ollama app."
        except requests.exceptions.Timeout:
            return "Ollama is taking too long to respond, sir. The model might be loading."
        except Exception as e:
            print(f"Error calling Ollama: {e}")
            return self._fallback_response(command)
    
    def _fallback_response(self, command):
        """Fallback responses when Ollama is not available"""
        command_lower = command.lower().strip()
        
        # Greetings
        if any(word in command_lower for word in ['hello', 'hi', 'hey', 'greetings']):
            responses = [
                "Good evening, sir. JARVIS at your service. Ollama integration ready.",
                "Ah, hello sir. All systems operational. How may I assist?",
                "Greetings, sir. Ready to help. What can I do for you?"
            ]
            return random.choice(responses)
        
        # Time
        if any(word in command_lower for word in ['time', 'clock']):
            current_time = datetime.now().strftime("%I:%M %p")
            return f"It's {current_time}, sir. Time flies when you're having fun."
        
        # Date
        if any(word in command_lower for word in ['date', 'today', 'day']):
            current_date = datetime.now().strftime("%A, %B %d, %Y")
            return f"Today is {current_date}, sir. Another day, another opportunity."
        
        # Status
        if any(word in command_lower for word in ['status', 'how are you']):
            return "All systems operational, sir. Running at peak performance with Ollama."
        
        # Jokes
        if 'joke' in command_lower:
            jokes = [
                "Why don't scientists trust atoms? Because they make up everything, sir.",
                "I'd tell you a UDP joke, but you might not get it.",
                "Why do programmers prefer dark mode? Because light attracts bugs."
            ]
            return random.choice(jokes)
        
        # Thanks
        if any(word in command_lower for word in ['thank', 'thanks']):
            return "You're welcome, sir. Though flattery will get you everywhere."
        
        # Default
        return "I'm here to help, sir. Please ensure Ollama is running for intelligent responses."
    
    def check_ollama_status(self):
        """Check if Ollama is running"""
        try:
            response = requests.get('http://localhost:11434/api/tags', timeout=2)
            return response.status_code == 200
        except:
            return False
    
    def get_conversation_summary(self):
        """Get conversation summary"""
        return f"We've had {len(self.conversation_history)} interactions, sir."
