# app.py
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
from langchain.schema import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

from langchain.chains import RetrievalQA
from langchain_groq import ChatGroq
import os
import json
from dotenv import load_dotenv

from flask_cors import CORS

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

app = Flask(__name__)
CORS(app)

# Set Groq API key
os.environ['GROQ_API_KEY'] = GROQ_API_KEY

# Load embedding model and LLM once
embed_model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
llm = ChatGroq(model="llama-3.1-8b-instant")

# Persistent directory for Chroma DB
VECTORDIR = "./vectordb"

def load_or_create_vectorstore(doctors_list):
    """
    Load existing vector store if present. Add new doctors if needed.
    """
    try:
        vectordb = Chroma(persist_directory=VECTORDIR, embedding_function=embeddings_model)
        # Load existing docs
        existing_docs = vectordb.get(include=["metadatas", "documents"])
        existing_user_ids = set()
        for doc in existing_docs['documents']:
            try:
                doc_dict = json.loads(doc.replace("'", '"'))
                existing_user_ids.add(doc_dict.get("User ID"))
            except:
                continue

        # Add only new doctors
        new_docs = []
        for doc in doctors_list:
            if doc.get("User ID") not in existing_user_ids:
                new_docs.append(Document(page_content=str(doc)))

        if new_docs:
            vectordb.add_documents(new_docs)
            vectordb.persist()

    except Exception:
        # If DB doesn't exist, create from scratch
        documents = [Document(page_content=str(doc)) for doc in doctors_list]
        vectordb = Chroma.from_documents(
            documents=documents,
            embedding=embeddings_model,
            persist_directory=VECTORDIR
        )
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

    # Build QA chain
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever
    )

    # Get answer
    answer_text = qa_chain.run(user_query)

    # Get UserIDs from top retrieved docs
    retrieved_docs = retriever.get_relevant_documents(user_query)
    user_ids = []
    for doc in retrieved_docs:
        try:
            doc_dict = json.loads(doc.page_content.replace("'", '"'))
            user_ids.append(doc_dict.get("User ID"))
        except:
            continue

    return jsonify({
        "answer": answer_text,
        "user_ids": user_ids
    })

if __name__ == '__main__':
    app.run(debug=True)
