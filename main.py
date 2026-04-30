import os
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_ollama import ChatOllama
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# Initialize LLM
llm = ChatOllama(
    model="gemma4:e2b",
    temperature=0,
)

# Initialize Embeddings
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Load and process PDF data
pdf_path = "data/atlas_insurance_data.pdf"
if os.path.exists(pdf_path):
    loader = PyPDFLoader(pdf_path)
    docs = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    splits = text_splitter.split_documents(docs)
    vectorstore = Chroma.from_documents(documents=splits, embedding=embeddings)
    retriever = vectorstore.as_retriever()
else:
    print(f"Warning: {pdf_path} not found.")
    retriever = None

def get_response(query: str) -> str:
    """Return the assistant response for a given user query using RAG.
    
    Rules:
    - Be clear and professional
    - Give concise answers
    - If the answer is not in the data, say: "I don't have that information"
    - Do not invent information
    """
    
    context = ""
    if retriever:
        relevant_docs = retriever.invoke(query)
        context = "\n\n".join([doc.page_content for doc in relevant_docs])

    system_prompt = (
        "You are an AI assistant for Atlas Insurance. "
        "Your role is to answer user questions based ONLY on the provided company data. "
        "Rules:\n"
        "- Be clear and professional\n"
        "- Give concise answers\n"
        "- If the answer is not in the data, say: 'I don't have that information'\n"
        "- Do not invent information\n\n"
        f"Context from company data:\n{context}"
    )

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=query),
    ]

    try:
        response = llm.invoke(messages)
        return response.content
    except Exception as e:
        return f"I encountered an error: {str(e)}"

if __name__ == "__main__":
    print(get_response("How can I file a claim?"))
    print(get_response("What plans do you offer?"))
    print(get_response("Do you offer life insurance?"))