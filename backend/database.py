"""
Database service for JARVIS - Supabase integration
Handles all database operations for users, tasks, notes, calendar events, etc.
"""

import os
from supabase import create_client, Client
from datetime import datetime
from typing import Optional, List, Dict, Any
import bcrypt

class DatabaseService:
    def __init__(self):
        """Initialize Supabase client"""
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_KEY')
        
        if not supabase_url or not supabase_key:
            print("⚠️  Warning: Supabase credentials not found. Database features will be limited.")
            self.client = None
        else:
            try:
                self.client: Client = create_client(supabase_url, supabase_key)
                print("✅ Supabase database connected successfully")
            except Exception as e:
                print(f"❌ Error connecting to Supabase: {e}")
                self.client = None
    
    def is_connected(self) -> bool:
        """Check if database is connected"""
        return self.client is not None
    
    # ==================== USER MANAGEMENT ====================
    
    def create_user(self, email: str, password: str, name: str = None) -> Optional[Dict]:
        """Create a new user"""
        if not self.client:
            return None
        
        try:
            # Hash password
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            # Create user
            response = self.client.table('users').insert({
                'email': email,
                'password_hash': password_hash,
                'name': name,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }).execute()
            
            if response.data:
                user = response.data[0]
                # Don't return password hash
                user.pop('password_hash', None)
                return user
            return None
        except Exception as e:
            print(f"Error creating user: {e}")
            return None
    
    def authenticate_user(self, email: str, password: str) -> Optional[Dict]:
        """Authenticate user with email and password"""
        if not self.client:
            return None
        
        try:
            # Get user by email
            response = self.client.table('users').select('*').eq('email', email).execute()
            
            if not response.data:
                return None
            
            user = response.data[0]
            password_hash = user.get('password_hash')
            
            # Verify password
            if bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8')):
                # Don't return password hash
                user.pop('password_hash', None)
                return user
            return None
        except Exception as e:
            print(f"Error authenticating user: {e}")
            return None
    
    def get_user(self, user_id: str) -> Optional[Dict]:
        """Get user by ID"""
        if not self.client:
            return None
        
        try:
            response = self.client.table('users').select('*').eq('id', user_id).execute()
            if response.data:
                user = response.data[0]
                user.pop('password_hash', None)
                return user
            return None
        except Exception as e:
            print(f"Error getting user: {e}")
            return None
    
    # ==================== TASK MANAGEMENT ====================
    
    def create_task(self, user_id: str, text: str, scheduled_for: str = None) -> Optional[Dict]:
        """Create a new task for a user"""
        if not self.client:
            return None
        
        try:
            response = self.client.table('tasks').insert({
                'user_id': user_id,
                'text': text,
                'completed': False,
                'scheduled_for': scheduled_for,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }).execute()
            
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error creating task: {e}")
            return None
    
    def get_user_tasks(self, user_id: str) -> List[Dict]:
        """Get all tasks for a user"""
        if not self.client:
            return []
        
        try:
            response = self.client.table('tasks').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error getting tasks: {e}")
            return []
    
    def update_task(self, task_id: str, updates: Dict) -> Optional[Dict]:
        """Update a task"""
        if not self.client:
            return None
        
        try:
            updates['updated_at'] = datetime.now().isoformat()
            response = self.client.table('tasks').update(updates).eq('id', task_id).execute()
            
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error updating task: {e}")
            return None
    
    def delete_task(self, task_id: str) -> bool:
        """Delete a task"""
        if not self.client:
            return False
        
        try:
            self.client.table('tasks').delete().eq('id', task_id).execute()
            return True
        except Exception as e:
            print(f"Error deleting task: {e}")
            return False
    
    # ==================== NOTES MANAGEMENT ====================
    
    def create_note(self, user_id: str, title: str, content: str = "", category: str = None) -> Optional[Dict]:
        """Create a new note"""
        if not self.client:
            return None
        
        try:
            response = self.client.table('notes').insert({
                'user_id': user_id,
                'title': title,
                'content': content,
                'category': category,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }).execute()
            
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error creating note: {e}")
            return None
    
    def get_user_notes(self, user_id: str) -> List[Dict]:
        """Get all notes for a user"""
        if not self.client:
            return []
        
        try:
            response = self.client.table('notes').select('*').eq('user_id', user_id).order('updated_at', desc=True).execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error getting notes: {e}")
            return []
    
    def update_note(self, note_id: str, updates: Dict) -> Optional[Dict]:
        """Update a note"""
        if not self.client:
            return None
        
        try:
            updates['updated_at'] = datetime.now().isoformat()
            response = self.client.table('notes').update(updates).eq('id', note_id).execute()
            
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error updating note: {e}")
            return None
    
    def delete_note(self, note_id: str) -> bool:
        """Delete a note"""
        if not self.client:
            return False
        
        try:
            self.client.table('notes').delete().eq('id', note_id).execute()
            return True
        except Exception as e:
            print(f"Error deleting note: {e}")
            return False
    
    # ==================== CALENDAR EVENTS ====================
    
    def create_event(self, user_id: str, title: str, start_time: str, end_time: str, 
                     description: str = None, location: str = None) -> Optional[Dict]:
        """Create a calendar event"""
        if not self.client:
            return None
        
        try:
            response = self.client.table('calendar_events').insert({
                'user_id': user_id,
                'title': title,
                'description': description,
                'start_time': start_time,
                'end_time': end_time,
                'location': location,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }).execute()
            
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error creating event: {e}")
            return None
    
    def get_user_events(self, user_id: str, start_date: str = None, end_date: str = None) -> List[Dict]:
        """Get calendar events for a user"""
        if not self.client:
            return []
        
        try:
            query = self.client.table('calendar_events').select('*').eq('user_id', user_id)
            
            if start_date:
                query = query.gte('start_time', start_date)
            if end_date:
                query = query.lte('start_time', end_date)
            
            response = query.order('start_time', desc=False).execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error getting events: {e}")
            return []
    
    def update_event(self, event_id: str, updates: Dict) -> Optional[Dict]:
        """Update a calendar event"""
        if not self.client:
            return None
        
        try:
            updates['updated_at'] = datetime.now().isoformat()
            response = self.client.table('calendar_events').update(updates).eq('id', event_id).execute()
            
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error updating event: {e}")
            return None
    
    def delete_event(self, event_id: str) -> bool:
        """Delete a calendar event"""
        if not self.client:
            return False
        
        try:
            self.client.table('calendar_events').delete().eq('id', event_id).execute()
            return True
        except Exception as e:
            print(f"Error deleting event: {e}")
            return False
    
    # ==================== USER PREFERENCES ====================
    
    def get_user_preferences(self, user_id: str) -> Optional[Dict]:
        """Get user preferences"""
        if not self.client:
            return None
        
        try:
            response = self.client.table('user_preferences').select('*').eq('user_id', user_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error getting preferences: {e}")
            return None
    
    def update_user_preferences(self, user_id: str, preferences: Dict) -> Optional[Dict]:
        """Update user preferences"""
        if not self.client:
            return None
        
        try:
            # Check if preferences exist
            existing = self.get_user_preferences(user_id)
            
            if existing:
                # Update existing
                preferences['updated_at'] = datetime.now().isoformat()
                response = self.client.table('user_preferences').update(preferences).eq('user_id', user_id).execute()
            else:
                # Create new
                preferences['user_id'] = user_id
                preferences['created_at'] = datetime.now().isoformat()
                preferences['updated_at'] = datetime.now().isoformat()
                response = self.client.table('user_preferences').insert(preferences).execute()
            
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error updating preferences: {e}")
            return None


# Global database instance
db = DatabaseService()
