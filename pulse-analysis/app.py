import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_GEMINI_APIKEY")

genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-2.5-flash-preview-05-20")

def analyze_sentiment(text):
    prompt = f"What is the sentiment of the following text? Respond with 'Positive', 'Negative', or 'Neutral'.\n\nText: \"{text}\""
    response = model.generate_content(prompt)
    return response.text.strip()

def extract_keywords(title, delimiter):
    prompt = f"Extract most important key words from the text: {title}, respond with the key words separated by {delimiter}"
    response = model.generate_content(prompt)
    return response.text

print(analyze_sentiment("Privilege... is invisible to those who have it."))
print(extract_keywords("Todd Chrisley speaks out for the first time since pardon", "¶").split("¶"))