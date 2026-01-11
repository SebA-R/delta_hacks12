import os
import time
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs

load_dotenv()

# Initialize Client
client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

# The ID from your outbound call result
CONVERSATION_ID = "conv_3901kemmzsedenvvdstfk5xsybwm"


def get_call_results(conversation_id, poll_interval_seconds=10):
    print(f"--- Fetching Results for {conversation_id} ---")

    while True:
        # 1. Fetch the conversation object
        conv = client.conversational_ai.conversations.get(conversation_id)

        status = conv.status
        print(f"Status: {status}...")

        if status == "done":
            print("\n" + "=" * 40)
            print("CALL ANALYSIS COMPLETE")
            print("=" * 40)

            # 2. Safely get the Summary
            # The SDK uses 'transcript_summary' for the auto-generated overview
            summary = getattr(
                conv.analysis, "transcript_summary", "No summary available."
            )
            print(f"\nSUMMARY:\n{summary}")

            # 3. Get Data Collection (Custom variables like 'open_status', etc.)
            if hasattr(conv.analysis, "data_collection") and conv.analysis.data_collection:
                print("\nCOLLECTED DATA:")
                for key, value in conv.analysis.data_collection.items():
                    print(f" - {key}: {value}")

            # 4. Print Transcript
            print("\nTRANSCRIPT:")
            for turn in conv.transcript:
                role = getattr(turn, "role", "unknown").upper()
                message = getattr(turn, "message", "")
                print(f"[{role}]: {message}")

            return conv

        if status == "failed":
            print("The conversation failed.")
            return None

        # Wait before polling again to avoid rate limits
        time.sleep(poll_interval_seconds)


if __name__ == "__main__":
    get_call_results(CONVERSATION_ID)
