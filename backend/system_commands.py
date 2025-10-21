"""
System Commands Module for JARVIS
Handles opening apps, playing music, web searches, and system operations
"""

import os
import subprocess
import webbrowser
import re
from urllib.parse import quote

class SystemCommands:
    """Execute system-level commands"""
    
    def __init__(self):
        self.app_paths = {
            # Common Windows applications
            'notepad': 'notepad.exe',
            'calculator': 'calc.exe',
            'paint': 'mspaint.exe',
            'chrome': r'C:\Program Files\Google\Chrome\Application\chrome.exe',
            'edge': r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
            'firefox': r'C:\Program Files\Mozilla Firefox\firefox.exe',
            'spotify': r'C:\Users\{}\AppData\Roaming\Spotify\Spotify.exe'.format(os.getenv('USERNAME')),
            'vscode': r'C:\Users\{}\AppData\Local\Programs\Microsoft VS Code\Code.exe'.format(os.getenv('USERNAME')),
            'word': r'C:\Program Files\Microsoft Office\root\Office16\WINWORD.EXE',
            'excel': r'C:\Program Files\Microsoft Office\root\Office16\EXCEL.EXE',
            'powerpoint': r'C:\Program Files\Microsoft Office\root\Office16\POWERPNT.EXE',
            'outlook': r'C:\Program Files\Microsoft Office\root\Office16\OUTLOOK.EXE',
            'file explorer': 'explorer.exe',
            'explorer': 'explorer.exe',
            'cmd': 'cmd.exe',
            'command prompt': 'cmd.exe',
            'powershell': 'powershell.exe',
            'task manager': 'taskmgr.exe',
            'control panel': 'control.exe',
            'settings': 'ms-settings:',
        }
    
    def execute_command(self, command):
        """Parse and execute a system command"""
        command_lower = command.lower()
        
        # Open application
        if any(keyword in command_lower for keyword in ['open', 'launch', 'start', 'run']):
            return self.open_application(command)
        
        # Play music
        elif any(keyword in command_lower for keyword in ['play', 'music', 'song']):
            return self.play_music(command)
        
        # Web search
        elif any(keyword in command_lower for keyword in ['search', 'google', 'find', 'look up']):
            return self.web_search(command)
        
        # Open website
        elif any(keyword in command_lower for keyword in ['website', 'go to', 'navigate to']):
            return self.open_website(command)
        
        # System operations
        elif 'volume' in command_lower:
            return self.control_volume(command)
        
        elif 'screenshot' in command_lower or 'screen shot' in command_lower:
            return self.take_screenshot()
        
        elif 'lock' in command_lower and 'computer' in command_lower:
            return self.lock_computer()
        
        elif 'shutdown' in command_lower or 'shut down' in command_lower:
            return self.shutdown_computer(command)
        
        elif 'restart' in command_lower or 'reboot' in command_lower:
            return self.restart_computer()
        
        else:
            return {
                'success': False,
                'message': "I'm not sure how to execute that command, sir."
            }
    
    def open_application(self, command):
        """Open an application"""
        command_lower = command.lower()
        
        # Remove trigger words
        for word in ['open', 'launch', 'start', 'run', 'please', 'can you', 'could you']:
            command_lower = command_lower.replace(word, '')
        
        command_lower = command_lower.strip()
        
        # Find matching app
        for app_name, app_path in self.app_paths.items():
            if app_name in command_lower:
                try:
                    if app_path.startswith('ms-settings:'):
                        # Windows Settings
                        os.startfile(app_path)
                    elif os.path.exists(app_path):
                        subprocess.Popen(app_path)
                    else:
                        # Try to run as command
                        subprocess.Popen(app_path, shell=True)
                    
                    return {
                        'success': True,
                        'message': f"Opening {app_name.title()}, sir.",
                        'action': 'open_app',
                        'app': app_name
                    }
                except Exception as e:
                    return {
                        'success': False,
                        'message': f"I couldn't open {app_name}, sir. {str(e)}"
                    }
        
        # If no match, try to open as generic command
        try:
            subprocess.Popen(command_lower, shell=True)
            return {
                'success': True,
                'message': f"Attempting to open {command_lower}, sir.",
                'action': 'open_app'
            }
        except Exception as e:
            return {
                'success': False,
                'message': f"I couldn't find that application, sir. Available apps: {', '.join(list(self.app_paths.keys())[:10])}"
            }
    
    def play_music(self, command):
        """Play music on YouTube or Spotify"""
        command_lower = command.lower()
        
        # Extract song name
        song_name = command
        for word in ['play', 'music', 'song', 'on youtube', 'on spotify', 'please', 'can you', 'could you']:
            song_name = song_name.replace(word, '')
        
        song_name = song_name.strip()
        
        if not song_name:
            return {
                'success': False,
                'message': "What would you like me to play, sir?"
            }
        
        # Play on YouTube
        if 'spotify' in command_lower:
            # Try to open Spotify
            spotify_path = self.app_paths.get('spotify')
            if spotify_path and os.path.exists(spotify_path):
                try:
                    subprocess.Popen(spotify_path)
                    return {
                        'success': True,
                        'message': f"Opening Spotify, sir. Please search for '{song_name}' manually.",
                        'action': 'play_music',
                        'song': song_name
                    }
                except:
                    pass
        
        # Default to YouTube
        try:
            search_url = f"https://www.youtube.com/results?search_query={quote(song_name)}"
            webbrowser.open(search_url)
            
            return {
                'success': True,
                'message': f"Playing '{song_name}' on YouTube, sir.",
                'action': 'play_music',
                'song': song_name,
                'url': search_url
            }
        except Exception as e:
            return {
                'success': False,
                'message': f"I couldn't play that, sir. {str(e)}"
            }
    
    def web_search(self, command):
        """Perform a web search"""
        command_lower = command.lower()
        
        # Extract search query
        query = command
        for word in ['search', 'google', 'find', 'look up', 'for', 'about', 'please', 'can you', 'could you', 'on google', 'on the web', 'on internet']:
            query = query.replace(word, '')
        
        query = query.strip()
        
        if not query:
            return {
                'success': False,
                'message': "What would you like me to search for, sir?"
            }
        
        try:
            # Use Google search
            search_url = f"https://www.google.com/search?q={quote(query)}"
            webbrowser.open(search_url)
            
            return {
                'success': True,
                'message': f"Searching for '{query}' on Google, sir.",
                'action': 'web_search',
                'query': query,
                'url': search_url
            }
        except Exception as e:
            return {
                'success': False,
                'message': f"I couldn't perform that search, sir. {str(e)}"
            }
    
    def open_website(self, command):
        """Open a website"""
        command_lower = command.lower()
        
        # Common websites
        websites = {
            'youtube': 'https://www.youtube.com',
            'google': 'https://www.google.com',
            'gmail': 'https://mail.google.com',
            'facebook': 'https://www.facebook.com',
            'twitter': 'https://www.twitter.com',
            'instagram': 'https://www.instagram.com',
            'linkedin': 'https://www.linkedin.com',
            'github': 'https://www.github.com',
            'stackoverflow': 'https://stackoverflow.com',
            'reddit': 'https://www.reddit.com',
            'amazon': 'https://www.amazon.com',
            'netflix': 'https://www.netflix.com',
            'spotify': 'https://www.spotify.com',
        }
        
        # Check for known websites
        for site_name, site_url in websites.items():
            if site_name in command_lower:
                try:
                    webbrowser.open(site_url)
                    return {
                        'success': True,
                        'message': f"Opening {site_name.title()}, sir.",
                        'action': 'open_website',
                        'website': site_name,
                        'url': site_url
                    }
                except Exception as e:
                    return {
                        'success': False,
                        'message': f"I couldn't open {site_name}, sir. {str(e)}"
                    }
        
        # Try to extract URL
        url_match = re.search(r'(https?://[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|org|net|edu|gov|io|co))', command)
        if url_match:
            url = url_match.group(0)
            if not url.startswith('http'):
                url = 'https://' + url
            
            try:
                webbrowser.open(url)
                return {
                    'success': True,
                    'message': f"Opening {url}, sir.",
                    'action': 'open_website',
                    'url': url
                }
            except Exception as e:
                return {
                    'success': False,
                    'message': f"I couldn't open that website, sir. {str(e)}"
                }
        
        return {
            'success': False,
            'message': "I couldn't identify the website, sir. Please specify a URL or known website name."
        }
    
    def control_volume(self, command):
        """Control system volume"""
        command_lower = command.lower()
        
        try:
            if 'mute' in command_lower:
                # Mute volume
                os.system('nircmd.exe mutesysvolume 1')
                return {
                    'success': True,
                    'message': "Volume muted, sir.",
                    'action': 'volume_mute'
                }
            elif 'unmute' in command_lower:
                # Unmute volume
                os.system('nircmd.exe mutesysvolume 0')
                return {
                    'success': True,
                    'message': "Volume unmuted, sir.",
                    'action': 'volume_unmute'
                }
            elif 'up' in command_lower or 'increase' in command_lower:
                # Increase volume
                os.system('nircmd.exe changesysvolume 5000')
                return {
                    'success': True,
                    'message': "Volume increased, sir.",
                    'action': 'volume_up'
                }
            elif 'down' in command_lower or 'decrease' in command_lower:
                # Decrease volume
                os.system('nircmd.exe changesysvolume -5000')
                return {
                    'success': True,
                    'message': "Volume decreased, sir.",
                    'action': 'volume_down'
                }
        except:
            # Fallback: Use PowerShell
            return {
                'success': False,
                'message': "Volume control requires NirCmd utility, sir."
            }
    
    def take_screenshot(self):
        """Take a screenshot"""
        try:
            # Use Windows Snipping Tool
            subprocess.Popen('snippingtool.exe')
            return {
                'success': True,
                'message': "Opening Snipping Tool, sir.",
                'action': 'screenshot'
            }
        except Exception as e:
            return {
                'success': False,
                'message': f"I couldn't take a screenshot, sir. {str(e)}"
            }
    
    def lock_computer(self):
        """Lock the computer"""
        try:
            os.system('rundll32.exe user32.dll,LockWorkStation')
            return {
                'success': True,
                'message': "Locking computer, sir.",
                'action': 'lock'
            }
        except Exception as e:
            return {
                'success': False,
                'message': f"I couldn't lock the computer, sir. {str(e)}"
            }
    
    def shutdown_computer(self, command):
        """Shutdown the computer"""
        command_lower = command.lower()
        
        # Safety check - require confirmation
        if 'confirm' not in command_lower and 'yes' not in command_lower:
            return {
                'success': False,
                'message': "Are you sure you want to shutdown, sir? Please confirm.",
                'requires_confirmation': True,
                'action': 'shutdown'
            }
        
        try:
            os.system('shutdown /s /t 10')
            return {
                'success': True,
                'message': "Shutting down in 10 seconds, sir. Goodbye.",
                'action': 'shutdown'
            }
        except Exception as e:
            return {
                'success': False,
                'message': f"I couldn't shutdown the computer, sir. {str(e)}"
            }
    
    def restart_computer(self):
        """Restart the computer"""
        try:
            os.system('shutdown /r /t 10')
            return {
                'success': True,
                'message': "Restarting in 10 seconds, sir.",
                'action': 'restart'
            }
        except Exception as e:
            return {
                'success': False,
                'message': f"I couldn't restart the computer, sir. {str(e)}"
            }

# Global instance
system_commands = SystemCommands()
