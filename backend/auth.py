import jwt
import bcrypt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
import os
from database import db

SECRET_KEY = os.getenv('SECRET_KEY', 'jarvis_secret_key_change_in_production')

# In-memory user storage (fallback if database not available)
users_db = {}

def hash_password(password):
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password, hashed):
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_token(user_id, email):
    """Generate JWT token"""
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def decode_token(token):
    """Decode JWT token"""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from header
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(' ')[1]
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        # Decode token
        data = decode_token(token)
        if not data:
            return jsonify({'error': 'Token is invalid or expired'}), 401
        
        # Add user info to request
        request.user_id = data['user_id']
        request.user_email = data['email']
        
        return f(*args, **kwargs)
    
    return decorated

def register_user(email, password, name):
    """Register a new user"""
    # Try database first
    if db.is_connected():
        user = db.create_user(email, password, name)
        if user is None:
            return None, 'User already exists or registration failed'
        
        # Generate token
        token = generate_token(user['id'], email)
        return user, token
    
    # Fallback to in-memory storage
    if email in users_db:
        return None, 'User already exists'
    
    user_id = f"user_{len(users_db) + 1}"
    hashed_password = hash_password(password)
    
    users_db[email] = {
        'id': user_id,
        'email': email,
        'name': name,
        'password': hashed_password,
        'created_at': datetime.now().isoformat()
    }
    
    token = generate_token(user_id, email)
    
    return {
        'id': user_id,
        'email': email,
        'name': name
    }, token

def login_user(email, password):
    """Login a user"""
    # Try database first
    if db.is_connected():
        user = db.authenticate_user(email, password)
        if user is None:
            return None, 'Invalid credentials'
        
        # Generate token
        token = generate_token(user['id'], email)
        return user, token
    
    # Fallback to in-memory storage
    if email not in users_db:
        return None, 'Invalid credentials'
    
    user = users_db[email]
    
    if not verify_password(password, user['password']):
        return None, 'Invalid credentials'
    
    token = generate_token(user['id'], email)
    
    return {
        'id': user['id'],
        'email': user['email'],
        'name': user['name']
    }, token

def get_user_by_id(user_id):
    """Get user by ID"""
    # Try database first
    if db.is_connected():
        return db.get_user(user_id)
    
    # Fallback to in-memory storage
    for email, user in users_db.items():
        if user['id'] == user_id:
            return {
                'id': user['id'],
                'email': user['email'],
                'name': user['name']
            }
    return None
