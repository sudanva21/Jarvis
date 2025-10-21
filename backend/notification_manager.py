"""
Notification Manager for JARVIS
Handles reminders and notifications
"""

import json
from datetime import datetime
from collections import defaultdict

class NotificationManager:
    """Manages notifications and reminders"""
    
    def __init__(self):
        self.active_notifications = []
        self.notification_callbacks = defaultdict(list)
    
    def add_notification(self, notification):
        """Add a notification to the queue"""
        notification['id'] = f"notif_{datetime.now().timestamp()}"
        notification['timestamp'] = datetime.now().isoformat()
        notification['read'] = False
        self.active_notifications.append(notification)
        
        # Trigger callbacks
        self._trigger_callbacks(notification)
        
        return notification
    
    def create_reminder_notification(self, task):
        """Create a notification for a task reminder"""
        notification = {
            'type': 'reminder',
            'title': 'Task Reminder',
            'message': f"Reminder: {task['text']}",
            'task_id': task.get('id'),
            'task': task,
            'priority': 'high'
        }
        return self.add_notification(notification)
    
    def get_notifications(self, user_id=None, unread_only=False):
        """Get all notifications, optionally filtered"""
        notifications = self.active_notifications
        
        if unread_only:
            notifications = [n for n in notifications if not n.get('read')]
        
        return notifications
    
    def mark_as_read(self, notification_id):
        """Mark a notification as read"""
        for notif in self.active_notifications:
            if notif.get('id') == notification_id:
                notif['read'] = True
                return True
        return False
    
    def clear_notification(self, notification_id):
        """Remove a notification"""
        self.active_notifications = [
            n for n in self.active_notifications 
            if n.get('id') != notification_id
        ]
    
    def clear_all_notifications(self):
        """Clear all notifications"""
        self.active_notifications = []
    
    def register_callback(self, event_type, callback):
        """Register a callback for notification events"""
        self.notification_callbacks[event_type].append(callback)
    
    def _trigger_callbacks(self, notification):
        """Trigger registered callbacks"""
        event_type = notification.get('type', 'general')
        for callback in self.notification_callbacks[event_type]:
            try:
                callback(notification)
            except Exception as e:
                print(f"Error in notification callback: {e}")

# Global instance
notification_manager = NotificationManager()
