from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os
from dotenv import load_dotenv

from voice_engine import VoiceEngine
from ai_model_groq import JarvisAIGroq as JarvisAI
from task_manager import TaskManager
from auth import register_user, login_user, token_required, get_user_by_id
from database import db
from notification_manager import notification_manager
from system_commands import system_commands

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize components
voice_engine = VoiceEngine()
jarvis_ai = JarvisAI()
task_manager = TaskManager()

# Check database connection
if db.is_connected():
    print("🗄️  Database: Connected")
else:
    print("⚠️  Database: Not connected (using local storage)")

def get_user_id_from_request():
    """Extract user_id from Authorization header"""
    try:
        from auth import decode_token
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            data = decode_token(token)
            if data:
                return data.get('user_id')
    except:
        pass
    return None

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'online',
        'timestamp': datetime.now().isoformat(),
        'message': 'JARVIS systems operational'
    })

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        name = data.get('name', 'User')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        user, token_or_error = register_user(email, password, name)
        
        if user is None:
            return jsonify({'error': token_or_error}), 400
        
        return jsonify({
            'user': user,
            'token': token_or_error,
            'message': 'Registration successful'
        })
    
    except Exception as e:
        print(f"Error in registration: {e}")
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login a user"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        user, token_or_error = login_user(email, password)
        
        if user is None:
            return jsonify({'error': token_or_error}), 401
        
        return jsonify({
            'user': user,
            'token': token_or_error,
            'message': 'Login successful'
        })
    
    except Exception as e:
        print(f"Error in login: {e}")
        return jsonify({'error': 'Login failed'}), 500

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user():
    """Get current user info"""
    try:
        user = get_user_by_id(request.user_id)
        if user:
            return jsonify({'user': user})
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        print(f"Error getting user: {e}")
        return jsonify({'error': 'Failed to get user'}), 500

@app.route('/api/voice-command', methods=['POST'])
def voice_command():
    """Process voice commands - optimized for speed"""
    try:
        data = request.json
        command = data.get('command', '')
        session_id = data.get('sessionId', 'default')
        
        if not command:
            return jsonify({'error': 'No command provided'}), 400
        
        # Check if we're in a task operation flow (delete/edit/complete)
        if hasattr(task_manager, 'pending_operations'):
            operation = task_manager.pending_operations.get(session_id)
            if operation and operation['state'] == 'awaiting_task_selection':
                # User is selecting a task to delete/edit/complete
                selection = command.strip()
                user_id = get_user_id_from_request()
                tasks = task_manager.get_all_tasks(user_id=user_id)
                
                # Try to match by number
                selected_task = None
                try:
                    task_num = int(selection)
                    if 1 <= task_num <= len(tasks):
                        selected_task = tasks[task_num - 1]
                except ValueError:
                    # Try to match by name
                    selection_lower = selection.lower()
                    for task in tasks:
                        if selection_lower in task['text'].lower():
                            selected_task = task
                            break
                
                if not selected_task:
                    response = "I couldn't find that task, sir. Please say the number or name of the task you want to manage."
                    return jsonify({
                        'response': response,
                        'awaitingInput': True,
                        'inputType': 'taskSelection',
                        'timestamp': datetime.now().isoformat()
                    })
                
                # Perform the operation
                if operation['operation'] == 'delete':
                    task_manager.delete_task(selected_task['id'])
                    del task_manager.pending_operations[session_id]
                    response = f"Task '{selected_task['text']}' has been deleted, sir. Consider it done."
                    
                    return jsonify({
                        'response': response,
                        'taskDeleted': True,
                        'taskId': selected_task['id'],
                        'timestamp': datetime.now().isoformat()
                    })
                
                elif operation['operation'] == 'complete':
                    task_manager.update_task(selected_task['id'], {'completed': True})
                    del task_manager.pending_operations[session_id]
                    response = f"Excellent work, sir. Task '{selected_task['text']}' has been marked as complete."
                    
                    return jsonify({
                        'response': response,
                        'taskCompleted': True,
                        'taskId': selected_task['id'],
                        'timestamp': datetime.now().isoformat()
                    })
                
                elif operation['operation'] == 'edit':
                    # Store the task to edit and ask for new name
                    operation['task_id'] = selected_task['id']
                    operation['state'] = 'awaiting_new_name'
                    response = f"What would you like to rename '{selected_task['text']}' to, sir?"
                    
                    return jsonify({
                        'response': response,
                        'awaitingInput': True,
                        'inputType': 'newTaskName',
                        'timestamp': datetime.now().isoformat()
                    })
            
            elif operation and operation['state'] == 'awaiting_new_name':
                # User provided new name for task
                new_name = command.strip()
                task_manager.update_task(operation['task_id'], {'text': new_name})
                
                # Ask for new time
                operation['state'] = 'awaiting_new_time'
                response = f"Got it, sir. Renamed to '{new_name}'. Would you like to change the scheduled time? Say a new time, or 'keep the same' to leave it unchanged."
                
                return jsonify({
                    'response': response,
                    'awaitingInput': True,
                    'inputType': 'newTaskTime',
                    'timestamp': datetime.now().isoformat()
                })
            
            elif operation and operation['state'] == 'awaiting_new_time':
                # User provided new time or wants to keep it
                time_input = command.strip().lower()
                
                if 'keep' in time_input or 'same' in time_input or 'no change' in time_input:
                    del task_manager.pending_operations[session_id]
                    response = "Perfect, sir. The task has been updated."
                else:
                    # Parse new time
                    try:
                        full_command = f"task {time_input}"
                        task_text, scheduled_time = task_manager._parse_task_command(full_command)
                        task_manager.update_task(operation['task_id'], {'scheduledFor': scheduled_time})
                        
                        response = "Excellent, sir. The task has been updated with the new schedule."
                    except Exception as e:
                        print(f"Error parsing new time: {e}")
                        response = "The task name has been updated, but I had trouble with the new time, sir."
                    
                    del task_manager.pending_operations[session_id]
                
                return jsonify({
                    'response': response,
                    'taskUpdated': True,
                    'timestamp': datetime.now().isoformat()
                })
        
        # Check if we're in a task creation flow
        if hasattr(task_manager, 'pending_tasks'):
            pending = task_manager.pending_tasks.get(session_id)
            if pending:
                # We're collecting task details
                if pending['state'] == 'awaiting_name':
                    # User provided task name
                    task_name = command.strip()
                    pending['name'] = task_name
                    pending['state'] = 'awaiting_time'
                    
                    response = f"Got it, sir. '{task_name}'. When would you like to be reminded? You can say a time like '3 PM', 'tomorrow', 'in 30 minutes', or 'no time' for no specific time."
                    
                    return jsonify({
                        'response': response,
                        'awaitingInput': True,
                        'inputType': 'time',
                        'timestamp': datetime.now().isoformat()
                    })
                
                elif pending['state'] == 'awaiting_time':
                    # User provided time
                    time_input = command.strip().lower()
                    
                    if 'no time' in time_input or 'no specific' in time_input or 'none' in time_input:
                        # Create task without time
                        user_id = get_user_id_from_request()
                        task = task_manager.create_task(pending['name'], None, user_id=user_id)
                        del task_manager.pending_tasks[session_id]
                        
                        response = f"Perfect, sir. Task '{task['text']}' has been created. I'll keep it on your list."
                        
                        return jsonify({
                            'response': response,
                            'task': task,
                            'taskCreated': True,
                            'timestamp': datetime.now().isoformat()
                        })
                    else:
                        # Parse time and create task
                        try:
                            full_command = f"{pending['name']} {time_input}"
                            task_text, scheduled_time = task_manager._parse_task_command(full_command)
                            
                            user_id = get_user_id_from_request()
                            task = task_manager.create_task(pending['name'], scheduled_time, user_id=user_id)
                            del task_manager.pending_tasks[session_id]
                            
                            response = f"Excellent, sir. Task '{task['text']}' has been scheduled"
                            if task.get('scheduledFor'):
                                from dateutil import parser as date_parser
                                scheduled_dt = date_parser.parse(task['scheduledFor'])
                                response += f" for {scheduled_dt.strftime('%I:%M %p on %B %d')}"
                            response += ". I'll remind you at the appropriate time."
                            
                            return jsonify({
                                'response': response,
                                'task': task,
                                'taskCreated': True,
                                'timestamp': datetime.now().isoformat()
                            })
                        except Exception as e:
                            print(f"Error parsing time: {e}")
                            response = "I didn't quite catch that time, sir. Could you say it again? For example: '3 PM', 'tomorrow', or 'in 30 minutes'."
                            
                            return jsonify({
                                'response': response,
                                'awaitingInput': True,
                                'inputType': 'time',
                                'timestamp': datetime.now().isoformat()
                            })
        
        # Check for system commands first (open apps, play music, web search)
        command_lower = command.lower()
        
        # System commands
        if any(keyword in command_lower for keyword in [
            'open', 'launch', 'start', 'run',  # Open apps
            'play', 'music', 'song',  # Play music
            'search', 'google', 'find', 'look up',  # Web search
            'website', 'go to', 'navigate',  # Open website
            'volume', 'mute', 'unmute',  # Volume control
            'screenshot', 'screen shot',  # Screenshot
            'lock computer', 'shutdown', 'restart'  # System operations
        ]):
            result = system_commands.execute_command(command)
            
            if result['success']:
                return jsonify({
                    'response': result['message'],
                    'action': result.get('action'),
                    'commandExecuted': True,
                    'timestamp': datetime.now().isoformat()
                })
            else:
                # If system command failed, continue to AI response
                response = result['message']
                return jsonify({
                    'response': response,
                    'timestamp': datetime.now().isoformat()
                })
        
        # Get AI response
        response = jarvis_ai.process_command(command)
        
        # Check for task management commands
        command_lower = command.lower()
        
        # DELETE TASK
        if any(keyword in command_lower for keyword in ['delete task', 'remove task', 'delete the task', 'remove the task', 'cancel task']):
            user_id = get_user_id_from_request()
            tasks = task_manager.get_all_tasks(user_id=user_id)
            if not tasks:
                response = "You don't have any tasks to delete, sir."
                return jsonify({
                    'response': response,
                    'timestamp': datetime.now().isoformat()
                })
            
            # Ask which task to delete
            if not hasattr(task_manager, 'pending_operations'):
                task_manager.pending_operations = {}
            
            task_manager.pending_operations[session_id] = {
                'operation': 'delete',
                'state': 'awaiting_task_selection'
            }
            
            # List tasks
            task_list = "Which task would you like to delete, sir? Here are your tasks:\n"
            for i, task in enumerate(tasks, 1):
                task_list += f"{i}. {task['text']}\n"
            task_list += "Please say the number or name of the task."
            
            response = task_list
            
            return jsonify({
                'response': response,
                'awaitingInput': True,
                'inputType': 'taskSelection',
                'tasks': tasks,
                'timestamp': datetime.now().isoformat()
            })
        
        # EDIT TASK
        elif any(keyword in command_lower for keyword in ['edit task', 'update task', 'change task', 'modify task']):
            user_id = get_user_id_from_request()
            tasks = task_manager.get_all_tasks(user_id=user_id)
            if not tasks:
                response = "You don't have any tasks to edit, sir."
                return jsonify({
                    'response': response,
                    'timestamp': datetime.now().isoformat()
                })
            
            # Ask which task to edit
            if not hasattr(task_manager, 'pending_operations'):
                task_manager.pending_operations = {}
            
            task_manager.pending_operations[session_id] = {
                'operation': 'edit',
                'state': 'awaiting_task_selection'
            }
            
            # List tasks
            task_list = "Which task would you like to edit, sir? Here are your tasks:\n"
            for i, task in enumerate(tasks, 1):
                task_list += f"{i}. {task['text']}\n"
            task_list += "Please say the number or name of the task."
            
            response = task_list
            
            return jsonify({
                'response': response,
                'awaitingInput': True,
                'inputType': 'taskSelection',
                'tasks': tasks,
                'timestamp': datetime.now().isoformat()
            })
        
        # COMPLETE TASK
        elif any(keyword in command_lower for keyword in ['complete task', 'finish task', 'mark task complete', 'task done', 'mark as done']):
            user_id = get_user_id_from_request()
            tasks = task_manager.get_all_tasks(user_id=user_id)
            incomplete_tasks = [t for t in tasks if not t.get('completed')]
            
            if not incomplete_tasks:
                response = "You don't have any incomplete tasks, sir. Well done!"
                return jsonify({
                    'response': response,
                    'timestamp': datetime.now().isoformat()
                })
            
            # Ask which task to complete
            if not hasattr(task_manager, 'pending_operations'):
                task_manager.pending_operations = {}
            
            task_manager.pending_operations[session_id] = {
                'operation': 'complete',
                'state': 'awaiting_task_selection'
            }
            
            # List incomplete tasks
            task_list = "Which task have you completed, sir? Here are your incomplete tasks:\n"
            for i, task in enumerate(incomplete_tasks, 1):
                task_list += f"{i}. {task['text']}\n"
            task_list += "Please say the number or name of the task."
            
            response = task_list
            
            return jsonify({
                'response': response,
                'awaitingInput': True,
                'inputType': 'taskSelection',
                'tasks': incomplete_tasks,
                'timestamp': datetime.now().isoformat()
            })
        
        # CREATE TASK
        elif any(keyword in command_lower for keyword in ['remind', 'schedule', 'task', 'meeting', 'reminder', 'create task', 'add task', 'set reminder']):
            # Try smart parsing first - check if command contains both task and time
            task_text, scheduled_time = task_manager._parse_task_command(command)
            
            # If we successfully extracted both task name and time, create it directly!
            if task_text and scheduled_time:
                user_id = get_user_id_from_request()
                task = task_manager.create_task(task_text, scheduled_time, user_id=user_id)
                
                response = f"Excellent, sir! I've scheduled '{task['text']}'"
                if task.get('scheduledFor'):
                    from dateutil import parser as date_parser
                    scheduled_dt = date_parser.parse(task['scheduledFor'])
                    response += f" for {scheduled_dt.strftime('%I:%M %p on %B %d')}"
                response += ". I'll remind you at the appropriate time."
                
                return jsonify({
                    'response': response,
                    'task': task,
                    'taskCreated': True,
                    'timestamp': datetime.now().isoformat()
                })
            
            # If only task name was extracted (no time), ask for time
            elif task_text:
                if not hasattr(task_manager, 'pending_tasks'):
                    task_manager.pending_tasks = {}
                
                task_manager.pending_tasks[session_id] = {
                    'state': 'awaiting_time',
                    'name': task_text,
                    'time': None
                }
                
                response = f"Got it, sir. '{task_text}'. When would you like to be reminded?"
                
                return jsonify({
                    'response': response,
                    'awaitingInput': True,
                    'inputType': 'time',
                    'timestamp': datetime.now().isoformat()
                })
            
            # If nothing was extracted, ask for task name
            else:
                if not hasattr(task_manager, 'pending_tasks'):
                    task_manager.pending_tasks = {}
                
                task_manager.pending_tasks[session_id] = {
                    'state': 'awaiting_name',
                    'name': None,
                    'time': None
                }
                
                response = "Of course, sir. What would you like to name this task?"
                
                return jsonify({
                    'response': response,
                    'awaitingInput': True,
                    'inputType': 'taskName',
                    'timestamp': datetime.now().isoformat()
                })
        
        # Normal conversation
        return jsonify({
            'response': response,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        print(f"Error processing voice command: {e}")
        return jsonify({
            'error': 'Failed to process command',
            'response': "Oops, something went wrong. But don't worry, I'm still here, sir."
        }), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """Process chat messages - optimized for speed"""
    try:
        data = request.json
        message = data.get('message', '')
        session_id = data.get('sessionId', 'default_chat')
        
        if not message:
            return jsonify({'error': 'No message provided'}), 400
        
        # Check if we're in a task creation flow
        if hasattr(task_manager, 'pending_tasks'):
            pending = task_manager.pending_tasks.get(session_id)
            if pending:
                # We're collecting task details
                if pending['state'] == 'awaiting_name':
                    # User provided task name
                    task_name = message.strip()
                    pending['name'] = task_name
                    pending['state'] = 'awaiting_time'
                    
                    response = f"Got it, sir. '{task_name}'. When would you like to be reminded? You can say a time like '3 PM', 'tomorrow', 'in 30 minutes', or 'no time' for no specific time."
                    
                    return jsonify({
                        'response': response,
                        'awaitingInput': True,
                        'inputType': 'time',
                        'timestamp': datetime.now().isoformat()
                    })
                
                elif pending['state'] == 'awaiting_time':
                    # User provided time
                    time_input = message.strip().lower()
                    
                    if 'no time' in time_input or 'no specific' in time_input or 'none' in time_input:
                        # Create task without time
                        user_id = get_user_id_from_request()
                        task = task_manager.create_task(pending['name'], None, user_id=user_id)
                        del task_manager.pending_tasks[session_id]
                        
                        response = f"Perfect, sir. Task '{task['text']}' has been created. I'll keep it on your list."
                        
                        return jsonify({
                            'response': response,
                            'task': task,
                            'taskCreated': True,
                            'timestamp': datetime.now().isoformat()
                        })
                    else:
                        # Parse time and create task
                        try:
                            full_command = f"{pending['name']} {time_input}"
                            task_text, scheduled_time = task_manager._parse_task_command(full_command)
                            
                            user_id = get_user_id_from_request()
                            task = task_manager.create_task(pending['name'], scheduled_time, user_id=user_id)
                            del task_manager.pending_tasks[session_id]
                            
                            response = f"Excellent, sir. Task '{task['text']}' has been scheduled"
                            if task.get('scheduledFor'):
                                from dateutil import parser as date_parser
                                scheduled_dt = date_parser.parse(task['scheduledFor'])
                                response += f" for {scheduled_dt.strftime('%I:%M %p on %B %d')}"
                            response += ". I'll remind you at the appropriate time."
                            
                            return jsonify({
                                'response': response,
                                'task': task,
                                'taskCreated': True,
                                'timestamp': datetime.now().isoformat()
                            })
                        except Exception as e:
                            print(f"Error parsing time: {e}")
                            response = "I didn't quite catch that time, sir. Could you say it again? For example: '3 PM', 'tomorrow', or 'in 30 minutes'."
                            
                            return jsonify({
                                'response': response,
                                'awaitingInput': True,
                                'inputType': 'time',
                                'timestamp': datetime.now().isoformat()
                            })
        
        # Get AI response
        response = jarvis_ai.process_command(message)
        
        # Check if user wants to create a task
        message_lower = message.lower()
        if any(keyword in message_lower for keyword in ['remind', 'schedule', 'task', 'meeting', 'reminder', 'create task', 'add task', 'set reminder']):
            # Initialize pending task
            if not hasattr(task_manager, 'pending_tasks'):
                task_manager.pending_tasks = {}
            
            task_manager.pending_tasks[session_id] = {
                'state': 'awaiting_name',
                'name': None,
                'time': None
            }
            
            response = "Of course, sir. What would you like to name this task?"
            
            return jsonify({
                'response': response,
                'awaitingInput': True,
                'inputType': 'taskName',
                'timestamp': datetime.now().isoformat()
            })
        
        # Normal conversation
        return jsonify({
            'response': response,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        print(f"Error processing chat message: {e}")
        return jsonify({
            'error': 'Failed to process message',
            'response': "Well, that didn't go as planned. Let's try that again, shall we, sir?"
        }), 500

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks"""
    try:
        # Get user_id from token if available
        user_id = get_user_id_from_request()
        tasks = task_manager.get_all_tasks(user_id=user_id)
        return jsonify({'tasks': tasks})
    except Exception as e:
        print(f"Error getting tasks: {e}")
        return jsonify({'error': 'Failed to retrieve tasks'}), 500

@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new task"""
    try:
        data = request.json
        # Get user_id from token if available
        user_id = get_user_id_from_request()
        task = task_manager.create_task(
            text=data.get('text'),
            scheduled_for=data.get('scheduledFor'),
            user_id=user_id
        )
        return jsonify({'task': task})
    except Exception as e:
        print(f"Error creating task: {e}")
        return jsonify({'error': 'Failed to create task'}), 500

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Update a task"""
    try:
        data = request.json
        task = task_manager.update_task(task_id, data)
        return jsonify({'task': task})
    except Exception as e:
        print(f"Error updating task: {e}")
        return jsonify({'error': 'Failed to update task'}), 500

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task"""
    try:
        task_manager.delete_task(task_id)
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error deleting task: {e}")
        return jsonify({'error': 'Failed to delete task'}), 500

@app.route('/api/system-status', methods=['GET'])
def system_status():
    """Get system status"""
    try:
        import psutil
        
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        
        return jsonify({
            'cpu': cpu_percent,
            'memory': memory.percent,
            'status': 'online',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        print(f"Error getting system status: {e}")
        return jsonify({
            'cpu': 0,
            'memory': 0,
            'status': 'online',
            'timestamp': datetime.now().isoformat()
        })

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    """Get all notifications"""
    try:
        unread_only = request.args.get('unread', 'false').lower() == 'true'
        notifications = notification_manager.get_notifications(unread_only=unread_only)
        return jsonify({'notifications': notifications})
    except Exception as e:
        print(f"Error getting notifications: {e}")
        return jsonify({'error': 'Failed to get notifications'}), 500

@app.route('/api/notifications/<notification_id>/read', methods=['POST'])
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    try:
        success = notification_manager.mark_as_read(notification_id)
        if success:
            return jsonify({'message': 'Notification marked as read'})
        return jsonify({'error': 'Notification not found'}), 404
    except Exception as e:
        print(f"Error marking notification as read: {e}")
        return jsonify({'error': 'Failed to mark notification as read'}), 500

@app.route('/api/notifications/<notification_id>', methods=['DELETE'])
def delete_notification(notification_id):
    """Delete a notification"""
    try:
        notification_manager.clear_notification(notification_id)
        return jsonify({'message': 'Notification deleted'})
    except Exception as e:
        print(f"Error deleting notification: {e}")
        return jsonify({'error': 'Failed to delete notification'}), 500

@app.route('/api/notifications/clear', methods=['POST'])
def clear_all_notifications():
    """Clear all notifications"""
    try:
        notification_manager.clear_all_notifications()
        return jsonify({'message': 'All notifications cleared'})
    except Exception as e:
        print(f"Error clearing notifications: {e}")
        return jsonify({'error': 'Failed to clear notifications'}), 500

if __name__ == '__main__':
    print("=" * 50)
    print("JARVIS - Just A Rather Very Intelligent System")
    print("=" * 50)
    print("Initializing systems...")
    print("Voice Engine: Online")
    print("AI Model: Online")
    print("Task Manager: Online")
    print("=" * 50)
    print("Server running on http://localhost:5000")
    print("=" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
