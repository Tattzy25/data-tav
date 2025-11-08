import requests
import json
import random
import string
from typing import List, Dict, Any
from groq import Groq
from openai import OpenAI

# Initialize clients
groq_client = Groq(api_key="your_groq_api_key")
openai_client = OpenAI(api_key="your_openai_api_key")

def fetch_from_url(url: str) -> List[Dict[str, Any]]:
    """Fetch data from a JSON API endpoint."""
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    if isinstance(data, list):
        return data
    elif isinstance(data, dict):
        return [data]
    else:
        raise ValueError("Invalid JSON format")

def generate_manual(headers: List[str], rows: int) -> List[Dict[str, Any]]:
    """Generate manual sample data."""
    data = []
    for _ in range(rows):
        row = {}
        for header in headers:
            header_lower = header.lower()
            if 'name' in header_lower:
                row[header] = f"{random.choice(['John', 'Jane', 'Bob', 'Alice'])} {random.choice(['Smith', 'Doe', 'Johnson', 'Williams'])}"
            elif 'email' in header_lower:
                row[header] = f"{random.choice(['john', 'jane', 'bob', 'alice'])}.{random.choice(['smith', 'doe'])}@example.com"
            elif 'age' in header_lower:
                row[header] = random.randint(18, 65)
            elif 'phone' in header_lower:
                row[header] = f"+1-{random.randint(200,999)}-{random.randint(100,999)}-{random.randint(1000,9999)}"
            elif 'address' in header_lower:
                row[header] = f"{random.randint(1,999)} {random.choice(['Main St', 'Oak Ave', 'Elm Rd'])}"
            else:
                row[header] = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
        data.append(row)
    return data

def generate_ai(headers: List[str], rows: int, context: str = "", model: str = "groq/openai/gpt-oss-120b") -> List[Dict[str, Any]]:
    """Generate AI-powered data."""
    prompt = f"""Generate {rows} rows of realistic sample data in JSON format for the following columns: {', '.join(headers)}.
{context if context else ''}

Requirements:
- Return ONLY a valid JSON array of objects
- Each object should have keys matching the column names exactly
- Generate realistic, diverse data that makes sense for each column
- For names, use realistic full names
- For emails, use realistic email addresses
- For dates, use ISO format (YYYY-MM-DD)
- For numbers, use appropriate ranges
- For addresses, use complete realistic addresses
- Make the data varied and realistic

Example format:
[
  {{"Name": "John Smith", "Email": "john.smith@example.com", "Age": 32}},
  {{"Name": "Jane Doe", "Email": "jane.doe@example.com", "Age": 28}}
]"""

    if model.startswith("groq/"):
        groq_model = model.replace("groq/", "")
        response = groq_client.chat.completions.create(
            model=groq_model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            max_tokens=32768,
        )
        text = response.choices[0].message.content
    elif model.startswith("openai/"):
        openai_model = model.replace("openai/", "")
        response = openai_client.chat.completions.create(
            model=openai_model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8,
        )
        text = response.choices[0].message.content
    else:
        raise ValueError("Invalid model")

    # Parse JSON
    json_text = text.strip()
    if json_text.startswith("```json"):
        json_text = json_text.replace("```json\n", "").replace("```", "")
    elif json_text.startswith("```"):
        json_text = json_text.replace("```\n", "").replace("```", "")

    data = json.loads(json_text)
    if not isinstance(data, list):
        raise ValueError("Response is not an array")
    return data

# System prompts file
SYSTEM_PROMPTS = {
    "url": "Fetch data from the provided URL and return as JSON array.",
    "manual": "Generate sample data based on headers and row count using predefined rules.",
    "ai": "Use AI to generate realistic data based on headers, row count, context, and model."
}

if __name__ == "__main__":
    # Example usage
    print("Data Generator Ready")
