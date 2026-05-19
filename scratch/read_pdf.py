from pypdf import PdfReader

reader = PdfReader("/Users/lait-zet/Desktop/Ai-chatbot-rag/data/atlas_insurance_data.pdf")
text = ""
for page in reader.pages:
    text += page.extract_text()

print(text[:1000])
