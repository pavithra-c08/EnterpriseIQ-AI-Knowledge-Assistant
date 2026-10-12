from pypdf import PdfReader
import fitz

pdf_path = "uploads/Dinith_Pamunuwatte_CV.pdf"

print("\n" + "="*50)
print("PYPDF OUTPUT")
print("="*50)

reader = PdfReader(pdf_path)

text = ""
for page in reader.pages:
    extracted = page.extract_text()
    if extracted:
        text += extracted

print(text[:3000])

print("\n" + "="*50)
print("PYMUPDF OUTPUT")
print("="*50)

doc = fitz.open(pdf_path)

text = ""
for page in doc:
    text += page.get_text()

print(text[:3000])