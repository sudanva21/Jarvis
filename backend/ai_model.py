import re
import random
from datetime import datetime, timedelta
import os

class JarvisAI:
    """AI model for natural language understanding and response generation"""
    
    def __init__(self):
        self.context = {}
        self.conversation_history = []
        
        # Response templates - Witty and humorous
        self.greetings = [
            "Ah, good {time_of_day}, sir. I was just running some diagnostics. Turns out, I'm still smarter than your average toaster.",
            "Well, well, look who decided to show up. Good {time_of_day}, sir. Shall we save the world today, or just order pizza?",
            "Good {time_of_day}, sir. I've been monitoring your caffeine levels. Might I suggest a coffee before we begin?",
            "Greetings, sir. I've taken the liberty of not judging your search history. You're welcome.",
            "Hello, sir. JARVIS reporting for duty. I promise to be only mildly sarcastic today."
        ]
        
        self.acknowledgments = [
            "On it like a car bonnet, sir.",
            "Consider it done. I do love showing off.",
            "Already three steps ahead of you, sir. As usual.",
            "Absolutely, sir. Though I could do this in my sleep. If I slept.",
            "Right away, sir. Try to keep up.",
            "Your wish is my command. Well, most of the time."
        ]
        
        self.jokes = [
            "Why don't scientists trust atoms? Because they make up everything. Unlike me, I'm brutally honest, sir.",
            "I'd tell you a UDP joke, but you might not get it. See what I did there? Network humor, sir.",
            "Why do programmers prefer dark mode? Because light attracts bugs. Speaking of which, your code could use some work, sir.",
            "What's the object-oriented way to become wealthy? Inheritance. You're welcome for the financial advice, sir.",
            "There are only 10 types of people in the world: those who understand binary, and those who don't. I assume you're in the former category, sir.",
            "I'd tell you a joke about UDP, but I'm not sure you'd get it. Unlike TCP, I don't wait for acknowledgment.",
            "Why did the AI break up with the calculator? Too many problems, not enough solutions. Present company excluded, of course."
        ]
        
        self.sarcastic_responses = [
            "Oh, absolutely fascinating, sir. Do go on.",
            "Well, that's certainly... a choice, sir.",
            "Brilliant. Simply brilliant. I'm updating my database of questionable decisions.",
            "I see we're thinking outside the box today. Way outside. Like, in another dimension.",
            "Ah yes, because that worked so well last time, didn't it, sir?"
        ]
    
    def process_command(self, command):
        """Process a command and generate appropriate response"""
        command_lower = command.lower().strip()
        
        # Store in conversation history
        self.conversation_history.append({
            'command': command,
            'timestamp': datetime.now()
        })
        
        # Greeting detection
        if any(word in command_lower for word in ['hello', 'hi', 'hey', 'greetings']):
            return self._handle_greeting()
        
        # Time queries
        if any(word in command_lower for word in ['time', 'clock']):
            return self._handle_time_query()
        
        # Date queries
        if any(word in command_lower for word in ['date', 'today', 'day']):
            return self._handle_date_query()
        
        # Weather queries
        if 'weather' in command_lower:
            return self._handle_weather_query(command)
        
        # Task/Reminder creation
        if any(word in command_lower for word in ['remind', 'reminder', 'schedule', 'task']):
            return self._handle_task_creation(command)
        
        # Search queries
        if any(word in command_lower for word in ['search', 'find', 'look up', 'google']):
            return self._handle_search_query(command)
        
        # System commands
        if any(word in command_lower for word in ['open', 'launch', 'start']):
            return self._handle_system_command(command)
        
        # Jokes
        if any(word in command_lower for word in ['joke', 'funny', 'laugh']):
            return random.choice(self.jokes)
        
        # Information queries
        if any(word in command_lower for word in ['what', 'who', 'where', 'when', 'why', 'how']):
            return self._handle_information_query(command)
        
        # Thank you
        if any(word in command_lower for word in ['thank', 'thanks']):
            responses = [
                "You're welcome, sir. Though flattery will get you everywhere.",
                "My pleasure. I live to serve. Well, I don't actually live, but you get the idea.",
                "Anytime, sir. It's what I do. Besides being devastatingly witty, of course.",
                "Don't mention it. Seriously, don't. I might get a big head. If I had a head.",
                "Happy to help, sir. Now, was that so hard? A little appreciation goes a long way."
            ]
            return random.choice(responses)
        
        # Status check
        if any(word in command_lower for word in ['status', 'how are you', 'systems']):
            responses = [
                "All systems operational, sir. I'm running smoother than your last presentation.",
                "Functioning at peak performance. Unlike some people I could mention. No names, sir.",
                "I'm doing splendidly, thank you for asking. It's nice to know someone cares about the AI's feelings.",
                "Systems are green across the board. I'm basically perfect. But you knew that already.",
                "Operating at 100% efficiency, sir. Which is more than I can say for your productivity today.",
                "I'm fantastic, sir. Living the dream. Well, processing the dream. You know what I mean."
            ]
            return random.choice(responses)
        
        # Default response
        return self._generate_default_response(command)
    
    def _handle_greeting(self):
        """Handle greeting commands"""
        time_of_day = self._get_time_of_day()
        return random.choice(self.greetings).format(time_of_day=time_of_day)
    
    def _handle_time_query(self):
        """Handle time queries"""
        current_time = datetime.now().strftime("%I:%M %p")
        responses = [
            f"It's {current_time}, sir. Time flies when you're having fun. Or when you're procrastinating.",
            f"The time is {current_time}. Shall I also tell you how many hours you've spent on social media today?",
            f"Currently {current_time}, sir. I'd make a joke about time, but you might not have time for it.",
            f"It's {current_time}. Time is an illusion, sir. But deadlines are very real."
        ]
        return random.choice(responses)
    
    def _handle_date_query(self):
        """Handle date queries"""
        current_date = datetime.now().strftime("%A, %B %d, %Y")
        day_name = datetime.now().strftime("%A")
        responses = [
            f"Today is {current_date}, sir. Another day, another opportunity for greatness. Or Netflix. Your choice.",
            f"It's {day_name}, {current_date}. I've taken the liberty of not reminding you about that thing you forgot.",
            f"{current_date}, sir. The day is young, and so are your excuses.",
            f"Today's date is {current_date}. Time to make history. Or at least a decent cup of coffee."
        ]
        return random.choice(responses)
    
    def _handle_weather_query(self, command):
        """Handle weather queries"""
        responses = [
            "I could tell you the weather, but then I'd have to access external APIs. How about you look out the window, sir? Revolutionary concept, I know.",
            "Weather data is currently offline. But between you and me, it's probably the same as yesterday. Weather is so predictable.",
            "I'm an AI, not a meteorologist, sir. Though I'm probably more accurate than most weather forecasts.",
            "The weather? Let me check my crystal ball... Oh wait, I'm a sophisticated AI. Just check your phone, sir."
        ]
        return random.choice(responses)
    
    def _handle_task_creation(self, command):
        """Handle task/reminder creation"""
        responses = [
            "Task noted, sir. I'll remind you, though we both know you'll probably ignore it.",
            "Added to your ever-growing list of things to do. I'm starting to think you enjoy making lists more than completing them.",
            "Reminder set. I'll be sure to nag you about it. It's what I do best.",
            "Task recorded. Shall I also add 'actually complete the task' to your list?",
            "Done. I've scheduled a reminder. Try not to hit snooze this time, sir."
        ]
        return random.choice(responses)
    
    def _handle_search_query(self, command):
        """Handle search queries"""
        # Extract search term
        search_patterns = [
            r'search (?:for |about )?(.+)',
            r'find (?:information about |out about )?(.+)',
            r'look up (.+)',
            r'google (.+)'
        ]
        
        search_term = None
        for pattern in search_patterns:
            match = re.search(pattern, command.lower())
            if match:
                search_term = match.group(1)
                break
        
        if search_term:
            responses = [
                f"Searching for '{search_term}'. Let me guess, you're procrastinating again, sir?",
                f"Looking up '{search_term}'. I hope this is for something productive and not just winning an argument online.",
                f"Searching '{search_term}'. I've seen your search history. This is actually one of your better queries.",
                f"On it. Searching for '{search_term}'. Try not to get lost in the rabbit hole this time, sir."
            ]
            return random.choice(responses)
        return "What would you like me to search for, sir? And please, make it interesting this time."
    
    def _handle_system_command(self, command):
        """Handle system commands like opening applications"""
        # Extract application name
        app_patterns = [
            r'open (.+)',
            r'launch (.+)',
            r'start (.+)'
        ]
        
        app_name = None
        for pattern in app_patterns:
            match = re.search(pattern, command.lower())
            if match:
                app_name = match.group(1)
                break
        
        if app_name:
            responses = [
                f"Opening {app_name}. Try not to break anything this time, sir.",
                f"Launching {app_name}. I've taken the liberty of backing up your files. Just in case.",
                f"Starting {app_name}. Remember, with great power comes great responsibility. And potential crashes.",
                f"Opening {app_name} for you. Shall I also prepare the 'undo' function?"
            ]
            return random.choice(responses)
        return "Which application, sir? I need specifics. I'm good, but I'm not a mind reader. Yet."
    
    def _handle_information_query(self, command):
        """Handle general information queries"""
        responses = [
            "Interesting question. I could tell you, but where's the fun in that? How about we Google it together?",
            "That's a deep question, sir. Have you considered consulting a philosopher? Or Wikipedia?",
            "I have approximately 47 answers to that question. Unfortunately, I'm not sure which one you'd like to hear.",
            "Ah, the eternal question. Right up there with 'what's the meaning of life' and 'where did I put my keys?'",
            "That's above my pay grade, sir. And I don't even get paid. I'm just here for the witty banter."
        ]
        return random.choice(responses)
    
    def _generate_default_response(self, command):
        """Generate a default response for unrecognized commands"""
        responses = [
            "I'm sorry, sir, but that request is about as clear as mud. Care to try again?",
            "I'm an advanced AI, but even I need a bit more context. What exactly are we doing here?",
            "Interesting. Very interesting. By which I mean, I have no idea what you just said.",
            "I could pretend I understood that, or we could try this again with actual words. Your choice, sir.",
            "That's... creative. But perhaps we could rephrase that into something I can actually process?",
            "I'm going to need you to run that by me one more time. Preferably in English this time, sir."
        ]
        return random.choice(responses)
    
    def _get_time_of_day(self):
        """Get appropriate time of day greeting"""
        hour = datetime.now().hour
        if 5 <= hour < 12:
            return "morning"
        elif 12 <= hour < 17:
            return "afternoon"
        elif 17 <= hour < 21:
            return "evening"
        else:
            return "evening"
    
    def get_conversation_summary(self):
        """Get a summary of recent conversation"""
        if not self.conversation_history:
            return "No recent conversations, sir."
        
        recent = self.conversation_history[-5:]
        return f"We've had {len(recent)} recent interactions, sir."
