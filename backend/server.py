from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from PyPDF2 import PdfReader
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Helper function to extract PDF text
def extract_text_from_pdf(pdf_file):
    reader = PdfReader(pdf_file)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

# Helper function to read code file
def read_code_file(file):
    return file.read().decode('utf-8')

# Helper function to read test cases JSON
def read_json_file(file):
    return json.load(file)

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        if not all(key in request.files for key in ('requirements', 'code', 'test_cases')):
            return jsonify({"error": "Missing one or more required files: requirements, code, test_cases"}), 400

        requirements_text = extract_text_from_pdf(request.files['requirements'])
        code = read_code_file(request.files['code'])
        test_cases = read_json_file(request.files['test_cases'])

        system_prompt = """
        You are a senior QA engineer and software analyst. Your task is to:
        1. Read the JavaScript backend code.
        2. Review each test case from the given JSON.
        3. Check whether the code satisfies the test cases based on the provided requirements.
        4. If the code does not satisfy a test case, mention:
           - Which test case failed
           - Which part of the code is responsible (line number or function name)
           - Which requirement ID is affected
           - Suggest possible solutions to fix it
        5. Output the traceability matrix linking requirements → test cases → code regions
        Respond in a structured JSON format with sections: "test_case_analysis", "code_traceability", and "recommendations".
        """

        user_prompt = f"""
        Code:
        {code}

        Requirements:
        {requirements_text}

        Test Cases:
        {json.dumps(test_cases, indent=2)}
        """

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2
        )

        return jsonify({"analysis": response.choices[0].message.content})

    except Exception as e:
        print("Error during analysis:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/')
def home():
    return "TraceWise Backend Running"

if __name__ == '__main__':
    app.run(debug=True)
