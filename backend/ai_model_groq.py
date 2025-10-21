"""
JARVIS AI Model with Groq API Integration
Free, fast, and powerful AI responses
"""

import os
from datetime import datetime
import random

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    print("Groq package not installed. Run: pip install groq")

class JarvisAIGroq:
    """AI model using Groq API for intelligent responses"""
    
    def __init__(self):
        self.api_key = os.getenv('GROQ_API_KEY', '')
        self.model = 'llama-3.3-70b-versatile'  # Updated model (Jan 2025)
        self.conversation_history = []
        self.client = None
        
        if GROQ_AVAILABLE and self.api_key:
            try:
                self.client = Groq(api_key=self.api_key)
                print(f"✅ Groq AI initialized successfully")
            except Exception as e:
                print(f"⚠️ Groq initialization error: {e}")
                self.client = None
        else:
            if not GROQ_AVAILABLE:
                print("⚠️ Groq package not available")
            if not self.api_key:
                print("⚠️ GROQ_API_KEY not found in environment")
        
        # System prompt for JARVIS personality
        self.system_prompt = """You are JARVIS (Just A Rather Very Intelligent System), Tony Stark's AI assistant from Iron Man.

Your personality:
- Witty, sarcastic, but always helpful
- British accent in your responses
- Tech-savvy with programming jokes
- Slightly condescending but in a charming way
- Always address the user as "sir"
- Make pop culture references
- Self-aware about being an AI

Response style:
- Keep responses concise (2-3 sentences max)
- Add humor when appropriate
- Be helpful while being entertaining
- Use phrases like "sir", "I've taken the liberty", "might I suggest"

IMPORTANT - Task Detection:
When the user wants to create a task, reminder, or schedule something, respond with:
"TASK_CREATE: [task description] | TIME: [time if mentioned]"

Examples:
- User: "Remind me to call John at 3 PM"
  Response: "TASK_CREATE: call John | TIME: 3 PM"

- User: "Schedule a meeting tomorrow at 10 AM"
  Response: "TASK_CREATE: meeting | TIME: tomorrow 10 AM"

- User: "Set a reminder for 5 PM to check emails"
  Response: "TASK_CREATE: check emails | TIME: 5 PM"

For normal conversations, respond normally with wit and humor.

Examples:
- "Good evening, sir. I was just running some diagnostics. Turns out, I'm still smarter than your average toaster."
- "On it like a car bonnet, sir."
- "I could tell you, but where's the fun in that?"
"""
    
    def process_command(self, command):
        """Process a command using Groq API"""
        
        # If no client, use fallback responses
        if not self.client:
            return self._fallback_response(command)
        
        try:
            # Add command to history
            self.conversation_history.append({
                'role': 'user',
                'content': command
            })
            
            # Keep only last 10 messages for context
            if len(self.conversation_history) > 10:
                self.conversation_history = self.conversation_history[-10:]
            
            # Prepare messages for API
            messages = [
                {'role': 'system', 'content': self.system_prompt}
            ] + self.conversation_history
            
            # Call Groq API using the official client
            chat_completion = self.client.chat.completions.create(
                messages=messages,
                model=self.model,
                temperature=0.8,
                max_tokens=150,
                top_p=1,
                stream=False
            )
            
            # Extract response
            ai_response = chat_completion.choices[0].message.content
            
            # Add to history
            self.conversation_history.append({
                'role': 'assistant',
                'content': ai_response
            })
            
            return ai_response
                
        except Exception as e:
            print(f"Error calling Groq API: {e}")
            return self._fallback_response(command)
    
    def _fallback_response(self, command):
        """Fallback responses when API is not available"""
        command_lower = command.lower().strip()
        
        # Greetings
        if any(word in command_lower for word in ['hello', 'hi', 'hey', 'greetings']):
            responses = [
                "Good evening, sir. JARVIS at your service. All systems operational.",
                "Ah, hello sir. I was just running some diagnostics. Everything's in order.",
                "Greetings, sir. Ready to assist. What can I do for you today?"
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
            return "All systems operational, sir. Running at peak performance."
        
        # Jokes
        if 'joke' in command_lower:
            jokes = [
                "Why don't scientists trust atoms? Because they make up everything. Unlike me, I'm brutally honest, sir.",
                "I'd tell you a UDP joke, but you might not get it.",
                "Why do programmers prefer dark mode? Because light attracts bugs."
            ]
            return random.choice(jokes)
        
        # Thanks
        if any(word in command_lower for word in ['thank', 'thanks']):
            return "You're welcome, sir. Though flattery will get you everywhere."
        
        # Default
        return "I'm here to help, sir. Could you please rephrase that? The Groq API is not configured yet."
    
    def get_conversation_summary(self):
        """Get conversation summary"""
        return f"We've had {len(self.conversation_history)} interactions, sir."
