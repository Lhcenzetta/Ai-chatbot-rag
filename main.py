from langchain_core.messages import SystemMessage, HumanMessage
from langchain_ollama import ChatOllama


llm = ChatOllama(
    model="mistral",  #
    temperature=0,
)

def get_response(query: str) -> str:
        """Return the assistant response for a given user query.

        Inputs:
            - query: user message string
        Outputs:
            - assistant reply string
        Error modes:
            - may raise exceptions from the underlying LLM library
        """
        prompt = f"""You are a professional  assistant. Answer the following question using ONLY the provided information.    
                        query: "{query}"
                        """

        messages = [
                SystemMessage(content="You are a polite and professional hotel concierge assistant."),
                HumanMessage(content=prompt),
        ]

        response = llm.invoke(messages)
        return response.content


if __name__ == "__main__":
        # quick CLI test
        print(get_response("hi"))