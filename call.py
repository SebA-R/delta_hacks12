from flask import Flask, request
from twilio.twiml.voice_response import VoiceResponse, Gather

app = Flask(__name__)


@app.route("/call", methods=["POST"])
def call():
    r = VoiceResponse()

    gather = Gather(
        num_digits=1,
        action="/handle",
        timeout=6
    )

    gather.say(
        "Hello. This is an automated verification call."
        "We are confirming publicly listed clinic information."
        "Please press 1 if you are accepting new patients."
        "Press 2 if you are not accepting new patients."
        "Press 3 if this number is no longer in service."
    )

    r.append(gather)
    r.say("No input received. Thank you. Goodbye.")
    r.hangup()

    return str(r)


@app.route("/handle", methods=["POST"])
def handle():
    digit = request.values.get("Digits")
    r = VoiceResponse()

    if digit == "1":
        r.say("Thank you. We have recorded that you are accepting new patients.")
    elif digit == "2":
        r.say("Thank you. We have recorded that you are not accepting new patients.")
    elif digit == "3":
        r.say("Thank you. We will update our records.")
    else:
        r.say("Invalid input.")

    r.hangup()
    return str(r)


if __name__ == "__main__":
    app.run(debug=True)
