import os
from dotenv import load_dotenv
import cohere

load_dotenv()

COHERE_API_KEY = os.getenv("COHERE_API_KEY")

co = cohere.ClientV2(api_key=COHERE_API_KEY)

def client_response(text):
    return txt

def chat(call, physician_name, conversation, end):
    
    if (call == 0):
        conversation.append({"role": "system",
        "content": ("You are a client that is looking for a personal physician." 
        "Greet the physician named " + physician_name + " and ask if they are available.")
        })

    if (call >= end):
        conversation.append({"role": "system",
        "content": ("Thank the physician")
        })

    txt = response(conversation)
    conversation.append({"role": "user", "content": txt})

    physician_reply = input("your reply: ")
    conversation.append({"role": "assistant", "content": physician_reply})
    return txt

#Generates what AI asks physician
def response(call, physician_name, conversation):
    output_text = co.chat(

        model="command-a-03-2025", 

        messages=[conversation]

    )
    
    print (response.message.content[0].text)
    return response.message.content[0].text

conv = []
for i in range (3):
    print(chat(i, "seb", conv, 3))