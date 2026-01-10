import os
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
AGENT_ID = os.getenv("AGENT_ID")
AGENT_PHONE_NUMBER_ID = os.getenv("AGENT_PHONE_NUMBER_ID")
DESTINATION_NUMBER = "+16478088854"

client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

# Expanded script to cover all schema requirements
script = (
    "Hello! I’m an automated assistant verifying clinic information. "
    "I have a few quick questions: "
    "1. Is the clinic open and currently accepting new patients? "
    "2. How much space or capacity do you have for new patients, and what is the current waitlist time? "
    "3. What languages are spoken by your staff? "
    "4. Do you offer same-day or online booking? "
    "5. Approximately how many doctors work at this location? "
    "Finally, what are your regular office hours? "
    "Thank you for your help!"
)

# Initiating the call
result = client.conversational_ai.twilio.outbound_call(
    agent_id=AGENT_ID,
    agent_phone_number_id=AGENT_PHONE_NUMBER_ID,
    to_number=DESTINATION_NUMBER,
    # Ensure your Agent's 'First Message' or 'System Prompt' in the dashboard
    # uses the {{script}} variable to actually say these words.
    conversation_initiation_client_data={
        "dynamic_variables": {"script": script}}
)

print(f"✔ Outbound call initiated")
print(f"Twilio SID: {result.call_sid}")
print(f"Conversation ID: {result.conversation_id}")
