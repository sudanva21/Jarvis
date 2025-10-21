"""
Quick test to verify Groq AI is working
"""

from ai_model_groq import JarvisAIGroq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize JARVIS
jarvis = JarvisAIGroq()

# Test commands
test_commands = [
    "Hello JARVIS",
    "What is quantum physics?",
    "Tell me a joke",
    "What time is it?"
]

print("=" * 50)
print("Testing JARVIS with Groq AI")
print("=" * 50)

for command in test_commands:
    print(f"\n👤 You: {command}")
    response = jarvis.process_command(command)
    print(f"🤖 JARVIS: {response}")
    print("-" * 50)

print("\n✅ Test complete!")
