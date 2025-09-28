from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import json

# GEMINI AI imports
import google.generativeai as genai
from textblob import TextBlob

# LangChain / Doctor Query imports
from sentence_transformers import SentenceTransformer
from langchain.schema import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain_groq import ChatGroq

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Configure APIs
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')
os.environ['GROQ_API_KEY'] = GROQ_API_KEY

# Flask app
app = Flask(__name__)
CORS(app)

# --- GEMINI Mental Health Chatbot ---
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

def generate_response(user_input):
    sentiment_analysis = analyze_sentiment(user_input)
    prompt = f"""
    You are a compassionate mental health support chatbot.
    Current user message: {user_input}
    Detected sentiment: {sentiment_analysis['sentiment']} (polarity: {sentiment_analysis['polarity']:.2f})

    Guidelines:
    1. Be empathetic and understanding
    2. Provide supportive responses
    3. If the user seems in crisis, encourage professional help
    4. Ask follow-up questions
    5. Provide coping strategies when appropriate
    6. Keep responses conversational and warm

    Please provide a supportive response:
    """
    response = model.generate_content(prompt)
    return response.text, sentiment_analysis

@app.route("/api/ai-response", methods=["POST"])
def ai_response():
    data = request.get_json()
    user_message = data.get("message")
    if not user_message:
        return jsonify({"error": "Message is required"}), 400
    ai_reply, sentiment_analysis = generate_response(user_message)
    return jsonify({"aiResponse": ai_reply, "sentiment": sentiment_analysis['sentiment']})

# --- Doctor Query API ---
embed_model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
llm = ChatGroq(model="llama-3.1-8b-instant")
VECTORDIR = "./vectordb"

def load_or_create_vectorstore(doctors_list):
    try:
        vectordb = Chroma(persist_directory=VECTORDIR, embedding_function=embeddings_model)
        existing_docs = vectordb.get(include=["metadatas", "documents"])
        existing_user_ids = set()
        for doc in existing_docs['documents']:
            try:
                doc_dict = json.loads(doc.replace("'", '"'))
                existing_user_ids.add(doc_dict.get("User ID"))
            except:
                continue

        new_docs = [Document(page_content=str(doc)) for doc in doctors_list if doc.get("User ID") not in existing_user_ids]
        if new_docs:
            vectordb.add_documents(new_docs)
            vectordb.persist()

    except Exception:
        documents = [Document(page_content=str(doc)) for doc in doctors_list]
        vectordb = Chroma.from_documents(documents=documents, embedding=embeddings_model, persist_directory=VECTORDIR)
        vectordb.persist()

    return vectordb

@app.route('/query', methods=['POST'])
def query_doctors():
    data = request.json
    user_query = data.get('query')
    doctors_list = data.get('doctors', [])
    if not user_query or not doctors_list:
        return jsonify({"error": "Both 'query' and 'doctors' are required"}), 400

    vectordb = load_or_create_vectorstore(doctors_list)
    retriever = vectordb.as_retriever(search_kwargs={"k": 3})
    qa_chain = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=retriever)
    answer_text = qa_chain.run(user_query)

    retrieved_docs = retriever.get_relevant_documents(user_query)
    user_ids = []
    for doc in retrieved_docs:
        try:
            doc_dict = json.loads(doc.page_content.replace("'", '"'))
            user_ids.append(doc_dict.get("User ID"))
        except:
            continue

    return jsonify({"answer": answer_text, "user_ids": user_ids})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
