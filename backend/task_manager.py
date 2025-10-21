import json
import re
from datetime import datetime, timedelta
from dateutil import parser
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.date import DateTrigger
from database import db
from notification_manager import notification_manager

class TaskManager:
    """Manages tasks, reminders, and scheduling"""
    
    def __init__(self, user_id=None):
        self.user_id = user_id  # Current user ID (if logged in)
        self.tasks = []
        self.task_id_counter = 1
        self.scheduler = BackgroundScheduler()
        self.scheduler.start()
        self.tasks_file = 'tasks.json'
        self._load_tasks()
    
    def _load_tasks(self):
        """Load tasks from file"""
        try:
            with open(self.tasks_file, 'r') as f:
                data = json.load(f)
                self.tasks = data.get('tasks', [])
                self.task_id_counter = data.get('counter', 1)
        except FileNotFoundError:
            self.tasks = []
            self.task_id_counter = 1
        except Exception as e:
            print(f"Error loading tasks: {e}")
            self.tasks = []
            self.task_id_counter = 1
    
    def _save_tasks(self):
        """Save tasks to file"""
        try:
            with open(self.tasks_file, 'w') as f:
                json.dump({
                    'tasks': self.tasks,
                    'counter': self.task_id_counter
                }, f, indent=2, default=str)
        except Exception as e:
            print(f"Error saving tasks: {e}")
    
    def create_task(self, text, scheduled_for=None, user_id=None):
        """Create a new task"""
        # Use provided user_id or instance user_id
        uid = user_id or self.user_id
        
        # Try database first if user is logged in
        if uid and db.is_connected():
            task = db.create_task(uid, text, scheduled_for)
            if task:
                # Schedule reminder if scheduled_for is provided
                if scheduled_for:
                    self._schedule_reminder(task)
                return task
        
        # Fallback to file storage
        task = {
            'id': self.task_id_counter,
            'text': text,
            'completed': False,
            'createdAt': datetime.now().isoformat(),
            'scheduledFor': scheduled_for
        }
        
        self.tasks.append(task)
        self.task_id_counter += 1
        self._save_tasks()
        
        # Schedule reminder if scheduled_for is provided
        if scheduled_for:
            self._schedule_reminder(task)
        
        return task
    
    def create_task_from_command(self, command):
        """Create a task from a natural language command"""
        # Extract task text and time
        task_text, scheduled_time = self._parse_task_command(command)
        
        if task_text:
            return self.create_task(task_text, scheduled_time)
        return None
    
    def _parse_task_command(self, command):
        """Parse a natural language task command"""
        command_lower = command.lower()
        
        # Enhanced time patterns (more comprehensive)
        time_patterns = [
            (r'at (\d{1,2}):(\d{2})\s*(am|pm)?', 'time'),
            (r'at (\d{1,2})\s*(am|pm)', 'time'),
            (r'(\d{1,2}):(\d{2})\s*(am|pm)', 'time'),  # Without "at"
            (r'(\d{1,2})\s*(am|pm)', 'time'),  # Without "at"
            (r'in (\d+)\s*(second|minute|hour|day)s?', 'relative'),
            (r'after (\d+)\s*(second|minute|hour|day)s?', 'relative'),
            (r'tomorrow\s+at\s+(\d{1,2}):?(\d{2})?\s*(am|pm)?', 'tomorrow_time'),
            (r'tomorrow', 'tomorrow'),
            (r'next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)', 'day_of_week'),
            (r'(today|tonight)', 'today')
        ]
        
        scheduled_time = None
        time_match = None
        
        # Find time in command
        for pattern, time_type in time_patterns:
            match = re.search(pattern, command_lower)
            if match:
                time_match = match
                scheduled_time = self._parse_time(match, time_type)
                break
        
        # Extract task text (remove time-related parts and trigger phrases)
        task_text = command
        if time_match:
            # Remove the time portion
            task_text = command[:time_match.start()] + command[time_match.end():]
        
        # Remove common trigger phrases more intelligently
        trigger_patterns = [
            r'^remind me to\s+',
            r'^remind me\s+',
            r'^set a reminder to\s+',
            r'^set a reminder for\s+',
            r'^set reminder to\s+',
            r'^create a task to\s+',
            r'^create task to\s+',
            r'^add a task to\s+',
            r'^add task to\s+',
            r'^schedule\s+',
            r'^task:\s+',
            r'^task\s+',
            r'\s+for me$',
            r'\s+please$'
        ]
        
        for pattern in trigger_patterns:
            task_text = re.sub(pattern, '', task_text, flags=re.IGNORECASE)
        
        # Clean up extra whitespace
        task_text = ' '.join(task_text.split())
        task_text = task_text.strip()
        
        # Capitalize first letter
        if task_text:
            task_text = task_text[0].upper() + task_text[1:]
        
        return task_text, scheduled_time.isoformat() if scheduled_time else None
    
    def _parse_time(self, match, time_type):
        """Parse time from regex match"""
        now = datetime.now()
        
        if time_type == 'time':
            # Parse specific time
            if len(match.groups()) == 3:  # HH:MM AM/PM
                hour = int(match.group(1))
                minute = int(match.group(2))
                period = match.group(3)
                
                if period and period.lower() == 'pm' and hour != 12:
                    hour += 12
                elif period and period.lower() == 'am' and hour == 12:
                    hour = 0
            else:  # HH AM/PM
                hour = int(match.group(1))
                minute = 0
                period = match.group(2)
                
                if period.lower() == 'pm' and hour != 12:
                    hour += 12
                elif period.lower() == 'am' and hour == 12:
                    hour = 0
            
            scheduled = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
            
            # If time has passed today, schedule for tomorrow
            if scheduled < now:
                scheduled += timedelta(days=1)
            
            return scheduled
        
        elif time_type == 'relative':
            # Parse relative time
            amount = int(match.group(1))
            unit = match.group(2)
            
            if 'second' in unit:
                return now + timedelta(seconds=amount)
            elif 'minute' in unit:
                return now + timedelta(minutes=amount)
            elif 'hour' in unit:
                return now + timedelta(hours=amount)
            elif 'day' in unit:
                return now + timedelta(days=amount)
        
        elif time_type == 'tomorrow':
            # Tomorrow at 9 AM
            tomorrow = now + timedelta(days=1)
            return tomorrow.replace(hour=9, minute=0, second=0, microsecond=0)
        
        elif time_type == 'tomorrow_time':
            # Tomorrow at specific time
            tomorrow = now + timedelta(days=1)
            hour = int(match.group(1))
            minute = int(match.group(2)) if match.group(2) else 0
            period = match.group(3)
            
            if period and period.lower() == 'pm' and hour != 12:
                hour += 12
            elif period and period.lower() == 'am' and hour == 12:
                hour = 0
            
            return tomorrow.replace(hour=hour, minute=minute, second=0, microsecond=0)
        
        elif time_type == 'today':
            # Today/tonight - default to current time + 1 hour
            return now + timedelta(hours=1)
        
        elif time_type == 'day_of_week':
            # Next specific day of week
            day_name = match.group(1)
            days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            target_day = days.index(day_name)
            current_day = now.weekday()
            
            days_ahead = target_day - current_day
            if days_ahead <= 0:
                days_ahead += 7
            
            target_date = now + timedelta(days=days_ahead)
            return target_date.replace(hour=9, minute=0, second=0, microsecond=0)
        
        return None
    
    def _schedule_reminder(self, task):
        """Schedule a reminder for a task"""
        try:
            scheduled_time = parser.parse(task['scheduledFor'])
            
            self.scheduler.add_job(
                func=self._send_reminder,
                trigger=DateTrigger(run_date=scheduled_time),
                args=[task],
                id=f"task_{task['id']}"
            )
        except Exception as e:
            print(f"Error scheduling reminder: {e}")
    
    def _send_reminder(self, task):
        """Send a reminder for a task"""
        print(f"🔔 REMINDER: {task['text']}")
        
        # Create notification
        notification = notification_manager.create_reminder_notification(task)
        print(f"✅ Notification created: {notification['message']}")
        
        # Play alarm sound and speak reminder
        self._play_alarm_and_speak(task)
    
    def _play_alarm_and_speak(self, task):
        """Play alarm sound and speak the reminder"""
        try:
            import pyttsx3
            import winsound
            import threading
            
            def alarm_thread():
                try:
                    # Play Windows system beep (frequency, duration in ms)
                    # Play 3 beeps for attention
                    for _ in range(3):
                        winsound.Beep(1000, 300)  # 1000 Hz for 300ms
                        import time
                        time.sleep(0.2)
                    
                    # Speak the reminder
                    engine = pyttsx3.init()
                    engine.setProperty('rate', 150)  # Speed
                    engine.setProperty('volume', 1.0)  # Max volume
                    
                    # Get available voices
                    voices = engine.getProperty('voices')
                    # Try to use a female voice (usually index 1)
                    if len(voices) > 1:
                        engine.setProperty('voice', voices[1].id)
                    
                    # Speak the reminder
                    reminder_text = f"Sir, this is a reminder. {task['text']}"
                    engine.say(reminder_text)
                    engine.runAndWait()
                    
                except Exception as e:
                    print(f"Error playing alarm: {e}")
            
            # Run alarm in separate thread to not block scheduler
            thread = threading.Thread(target=alarm_thread, daemon=True)
            thread.start()
            
        except Exception as e:
            print(f"Error in alarm system: {e}")
    
    def get_all_tasks(self, user_id=None):
        """Get all tasks"""
        # Use provided user_id or instance user_id
        uid = user_id or self.user_id
        
        # Try database first if user is logged in
        if uid and db.is_connected():
            return db.get_user_tasks(uid)
        
        # Fallback to file storage
        return self.tasks
    
    def get_task(self, task_id):
        """Get a specific task"""
        for task in self.tasks:
            if task['id'] == task_id:
                return task
        return None
    
    def update_task(self, task_id, updates):
        """Update a task"""
        # Try database first
        if db.is_connected():
            task = db.update_task(task_id, updates)
            if task:
                return task
        
        # Fallback to file storage
        for i, task in enumerate(self.tasks):
            if task['id'] == task_id:
                self.tasks[i].update(updates)
                self._save_tasks()
                return self.tasks[i]
        return None
    
    def delete_task(self, task_id):
        """Delete a task"""
        # Try database first
        if db.is_connected():
            success = db.delete_task(task_id)
            if success:
                # Remove scheduled reminder
                try:
                    self.scheduler.remove_job(f"task_{task_id}")
                except:
                    pass
                return True
        
        # Fallback to file storage
        self.tasks = [task for task in self.tasks if task['id'] != task_id]
        self._save_tasks()
        
        # Remove scheduled reminder
        try:
            self.scheduler.remove_job(f"task_{task_id}")
        except:
            pass
        return True
    
    def get_upcoming_tasks(self, hours=24):
        """Get tasks scheduled in the next N hours"""
        now = datetime.now()
        cutoff = now + timedelta(hours=hours)
        
        upcoming = []
        for task in self.tasks:
            if task.get('scheduledFor') and not task['completed']:
                scheduled = parser.parse(task['scheduledFor'])
                if now <= scheduled <= cutoff:
                    upcoming.append(task)
        
        return sorted(upcoming, key=lambda x: x['scheduledFor'])
    
    def cleanup(self):
        """Cleanup resources"""
        self.scheduler.shutdown()
