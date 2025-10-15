from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import json

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from datasets import ClassLabel



from textblob import TextBlob

# Cohere for summarization
import cohere

# LangChain / Doctor Query imports
from sentence_transformers import SentenceTransformer
from langchain.schema import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain_groq import ChatGroq

# --- LOCAL Mental Health Chatbot using Ollama ---
from langchain_ollama import OllamaLLM
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

# Connect to local Ollama model
llm = OllamaLLM(model="llama3")

# Define system prompt for the chatbot
prompt_text = """You are a compassionate and expert mental health doctor.
Answer the user's question fully and clearly in 4-5 sentences.
Do not ask the user what to do next.
Do not repeat previous responses.
Use empathy, professionalism, and warmth.

Conversation History:
{history}

User Question:
{input}

AI:"""

prompt = PromptTemplate(
    input_variables=["history", "input"],
    template=prompt_text,
)

user_memories = {}

def get_memory(session_id):
    """Return memory for this user, creating if needed."""
    if session_id not in user_memories:
        user_memories[session_id] = ConversationBufferMemory(memory_key="history")
    return user_memories[session_id]




# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
COHERE_API_KEY = os.getenv("COHERE_API_KEY")

# Configure APIs

co = cohere.ClientV2(COHERE_API_KEY)  # Initialize Cohere client
os.environ['GROQ_API_KEY'] = GROQ_API_KEY

# Load fine-tuned model and tokenizer from local folder
MODEL_REPO = "kps05/ClassifyMessages_NeuroCare"
model = AutoModelForSequenceClassification.from_pretrained(MODEL_REPO)
tokenizer = AutoTokenizer.from_pretrained(MODEL_REPO)

model.eval()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Define label map (ensure this matches training)
labels = ["academic", "career", "relationship", "other"]
label_map = ClassLabel(names=labels).int2str

# Flask app
app = Flask(__name__)
CORS(app)

# --- LOCAL Mental Health Chatbot using Ollama ---

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

# def clean_response(text: str) -> str:
#     text = text.strip()
#     greetings = ["hello", "hi", "hey", "greetings"]
#     for g in greetings:
#         if text.lower().startswith(g):
#             text = text[len(g):].lstrip(",.! ").strip()
#             break
#     return text

def generate_response(user_input, session_id):
    sentiment_analysis = analyze_sentiment(user_input)
    memory = get_memory(session_id)
    chain = LLMChain(llm=llm, prompt=prompt, memory=memory)
    response = chain.run(input=user_input)
    # response = clean_response(response)
    return response, sentiment_analysis

def classify_texts(texts):
    """
    texts: list of strings
    returns: list of predicted labels
    """
    if not texts:
        return []

    inputs = tokenizer(
        texts,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=256
    )
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)
        predicted_ids = torch.argmax(outputs.logits, dim=-1).cpu().tolist()

    predicted_labels = [label_map(i) for i in predicted_ids]
    return predicted_labels



app = Flask(__name__)
CORS(app)

@app.route("/api/ai-response", methods=["POST"])
def ai_response():
    data = request.get_json()
    user_message = data.get("message")
    session_id = data.get("session_id", "default_user")  # front-end should send this

    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    ai_reply, sentiment_analysis = generate_response(user_message, session_id)
    return jsonify({
        "aiResponse": ai_reply,
        "sentiment": sentiment_analysis["sentiment"]
    })
# --- Doctor Query API ---
embed_model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
groq_llm = ChatGroq(model="llama-3.1-8b-instant")
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

@app.route('/api/summarize', methods=['POST'])
def summarize_text():
    try:
        data = request.json
        raw_text = data.get("raw_text", "")

        prompt = f"""
        Summarize this doctor-patient conversation. 
        Provide output in the following JSON format ONLY:

        {{
            "title": "A concise descriptive title for the conversation",
            "content": "A summarized version of the conversation"
        }}

        Conversation:
        {raw_text}
        """

        # Call Cohere Chat API
        response = co.chat(
            model="command-a-03-2025",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=800
        )

        # Extract generated text
        if isinstance(response.message.content, list):
            summary_text = " ".join([item.text for item in response.message.content])
        else:
            summary_text = response.message.content.text

        # Remove any ```json or ``` code blocks
        cleaned_text = summary_text.replace("```json", "").replace("```", "").strip()

        # Parse JSON safely
        import json
        try:
            summary_json = json.loads(cleaned_text)
            title = summary_json.get("title", "")
            content = summary_json.get("content", "")
        except json.JSONDecodeError:
            # fallback
            title = "Summary Title"
            content = cleaned_text

        # Return clean JSON
        return jsonify({
            "title": title,
            "content": content
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/query', methods=['POST'])
def query_doctors():
    data = request.json
    user_query = data.get('query')
    doctors_list = data.get('doctors', [])
    if not user_query or not doctors_list:
        return jsonify({"error": "Both 'query' and 'doctors' are required"}), 400

    vectordb = load_or_create_vectorstore(doctors_list)
    retriever = vectordb.as_retriever(search_kwargs={"k": 3})
    qa_chain = RetrievalQA.from_chain_type(llm=groq_llm, chain_type="stuff", retriever=retriever)
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

@app.route("/api/classify-messages", methods=["POST"])
def classify_messages():
    """
    Expects JSON payload:
    {"messages": ["message1", "message2", ...]}
    """
    data = request.get_json()
    texts = data.get("messages", [])
    if not texts:
        return jsonify({"error": "No messages provided"}), 400

    predictions = classify_texts(texts)
    return jsonify({"predictions": predictions})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
