from flask import Flask, request, jsonify
import google.generativeai as genai
from textblob import TextBlob
from dotenv import load_dotenv
import os
from flask_cors import CORS

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

app = Flask(__name__)
CORS(app)

# Sentiment analysis
def analyze_sentiment(text):
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    if polarity > 0.1:
        sentiment = "Positive"
    elif polarity < -0.1:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"
    return {"sentiment": sentiment, "polarity": polarity}

# Generate AI response
def generate_response(user_input):
    sentiment_analysis = analyze_sentiment(user_input)

    prompt = f"""
    You are a compassionate mental health support chatbot. Your role is to provide empathetic, supportive responses while being mindful that you're not a replacement for professional therapy.

    Current user message: {user_input}
    Detected sentiment: {sentiment_analysis['sentiment']} (polarity: {sentiment_analysis['polarity']:.2f})

    Guidelines:
    1. Be empathetic and understanding
    2. Provide supportive responses
    3. If the user seems to be in crisis, encourage them to seek professional help
    4. Ask follow-up questions to better understand their situation
    5. Provide practical coping strategies when appropriate
    6. Keep responses conversational and warm

    Please provide a supportive response:
    """

    

    response = model.generate_content(prompt)
    return response.text, sentiment_analysis

# Single route
@app.route("/api/ai-response", methods=["POST"])
def ai_response():
    data = request.get_json()
    user_message = data.get("message")
    if not user_message:
        return jsonify({"error": "Message is required"}), 400
    
    

    ai_reply, sentiment_analysis = generate_response(user_message)

    return jsonify({
        "aiResponse": ai_reply,
        "sentiment": sentiment_analysis['sentiment']
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
