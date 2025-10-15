from langchain_ollama import OllamaLLM
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

# Create LLM connection
llm = OllamaLLM(model="phi3")

# Define system prompt (your persona)
prompt_text = """You are an expert mental health doctor.
Respond with empathy and professionalism in 3–4 sentences maximum..

Conversation:
{history}
User: {input}
AI:"""

prompt = PromptTemplate(
    input_variables=["history", "input"],
    template=prompt_text,
)

# Memory setup
memory = ConversationBufferMemory(memory_key="history")

# Create the chain
chain = LLMChain(
    llm=llm,
    prompt=prompt,
    memory=memory,
    verbose=False
)

print("🧠 Local Mental Health Chatbot (type 'exit' to quit)\n")

while True:
    user_input = input("You: ")
    if user_input.lower() in ["exit", "quit"]:
        print("Goodbye 👋")
        break

    result = chain.run(input=user_input)
    print("AI:", result, "\n")
