import speech_recognition as sr
import pyttsx3
import threading
from queue import Queue

class VoiceEngine:
    """Handles voice recognition and text-to-speech"""
    
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.engine = pyttsx3.init()
        self.speech_queue = Queue()
        self.is_speaking = False
        
        # Configure TTS engine for JARVIS-like voice
        self._configure_voice()
        
        # Start speech thread
        self.speech_thread = threading.Thread(target=self._speech_worker, daemon=True)
        self.speech_thread.start()
    
    def _configure_voice(self):
        """Configure the TTS engine"""
        try:
            # Set properties
            self.engine.setProperty('rate', 175)  # Speed of speech
            self.engine.setProperty('volume', 0.9)  # Volume (0.0 to 1.0)
            
            # Try to set a male voice
            voices = self.engine.getProperty('voices')
            for voice in voices:
                if 'male' in voice.name.lower() or 'david' in voice.name.lower():
                    self.engine.setProperty('voice', voice.id)
                    break
        except Exception as e:
            print(f"Error configuring voice: {e}")
    
    def _speech_worker(self):
        """Worker thread for speaking"""
        while True:
            text = self.speech_queue.get()
            if text is None:
                break
            
            try:
                self.is_speaking = True
                self.engine.say(text)
                self.engine.runAndWait()
                self.is_speaking = False
            except Exception as e:
                print(f"Error speaking: {e}")
                self.is_speaking = False
            
            self.speech_queue.task_done()
    
    def speak(self, text):
        """Add text to speech queue"""
        if text:
            self.speech_queue.put(text)
    
    def listen(self, timeout=5):
        """Listen for voice input"""
        try:
            with sr.Microphone() as source:
                print("Listening...")
                self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                audio = self.recognizer.listen(source, timeout=timeout)
                
                print("Processing...")
                text = self.recognizer.recognize_google(audio)
                print(f"Recognized: {text}")
                return text
        
        except sr.WaitTimeoutError:
            return None
        except sr.UnknownValueError:
            print("Could not understand audio")
            return None
        except sr.RequestError as e:
            print(f"Could not request results; {e}")
            return None
        except Exception as e:
            print(f"Error listening: {e}")
            return None
    
    def stop_speaking(self):
        """Stop current speech"""
        try:
            self.engine.stop()
            self.is_speaking = False
        except Exception as e:
            print(f"Error stopping speech: {e}")
    
    def cleanup(self):
        """Cleanup resources"""
        self.speech_queue.put(None)
        self.speech_thread.join()
