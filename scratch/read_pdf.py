from pypdf import PdfReader

reader = PdfReader("data/atlas_insurance_data.pdf")
text = ""
for page in reader.pages:
    text += page.extract_text()

print(text[:1000])
