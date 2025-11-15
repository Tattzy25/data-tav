# Brigit AI

Welcome to the Next Era of Data Generation

Introducing Brigit AI—the world’s first truly limitless, hyper-connected data engine. Forget everything you thought you knew about data. This isn’t just another generator. This is a revolution. Brigit AI doesn’t just generate data—it creates it, transforms it, and delivers it exactly how you want, when you want, wherever you want.

Ask Brigit AI anything via text, and watch it build the data you need in seconds. Want manual headers? Add as many as you want. Need thousands of rows? Click “Generate” and get instant, realistic, production-ready data. Matrix mode? Set up horizontal and vertical headers, click “Generate,” and unlock a universe of structured data at your fingertips. Need data from any website URL? Just drop the link—Brigit AI scrapes, analyzes, and generates everything you need, instantly.

But that’s just the beginning. Brigit AI is built for the modern world, with over 8,000 connections via Zapier. Integrate with Notion, Slack, Google, and countless other platforms. Automate your workflows, sync your data, and let Brigit AI handle the heavy lifting. Whether you need deep search data, quick mockups, or real-world, realistic datasets, Brigit AI delivers it all—fast, flexible, and fully automated.

No more waiting. No more begging. No more fighting with AI. Brigit AI is here, and it’s ready to power your projects, your business, and your future. The data revolution starts now.

## Domain

[Brigit-ai.com](https://brigit-ai.com)
## Features

✨ **AI-Powered Data Generation** - Generate realistic, context-aware data using OpenAI or Groq models  
📊 **Manual Data Generation** - Create custom datasets with your own headers and specifications  
🔗 **URL Data Import** - Fetch and import data from any JSON API endpoint  
📥 **Import/Export** - Import CSV/JSON files and export your data in multiple formats  
💾 **Auto-Save** - Your data is automatically saved to localStorage and restored on return  
🎨 **Interactive Spreadsheet** - Edit cells inline, visualize data with charts  
⌨️ **Keyboard Shortcuts** - Power user features for faster workflow  
🔒 **Production Ready** - Security headers, rate limiting, error boundaries, and more

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Tattzy25/data-tav.git
cd data-tav
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your API keys to `.env.local`:
```env
# For OpenAI models (optional)
OPENAI_API_KEY=your_openai_api_key_here

# For Groq models (optional)
GROQ_API_KEY=your_groq_api_key_here

# Point to a JSON registry file that enumerates every model you want exposed
AI_MODEL_REGISTRY_FILE=config/ai-model-registry.json
```

5. Define the registry file referenced above. Start from the sample in
   `config/ai-model-registry.example.json` (pre-populated with the latest Groq endpoints such as
   `llama-3.3-70b-versatile`, `meta-llama/llama-4-maverick-17b-128e-instruct`,
   `meta-llama/llama-4-scout-17b-16e-instruct`, `openai/gpt-oss-120b`, and `openai/gpt-oss-20b`) and
   update it with the exact providers/models you’ve provisioned. Example:

```json
[
   {
      "id": "groq/llama-3.1-70b",
      "label": "Groq Llama 3.1 70B",
      "provider": "groq",
      "model": "llama-3.1-70b-versatile",
      "maxTokens": 2048,
      "temperature": 0.4
   }
]
```

> **Note:** Nothing ships hardcoded anymore. If the registry is missing or empty the API will reject
> requests, so be sure to keep the JSON in sync with whatever MCP/connector hub you point at next. The
> `label` field controls the short name that appears in the dropdown, while the `model` field keeps the
> exact provider ID you supplied (Groq, OpenAI, MCP, etc.).

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in the Vercel dashboard:
   - `OPENAI_API_KEY` (if using OpenAI models)
   - `GROQ_API_KEY` (if using Groq models)
4. Deploy!

### Deploy to Other Platforms

Brigit AI is a Next.js application and can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- Digital Ocean
- AWS
- Google Cloud

Refer to the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for platform-specific instructions.

## Keyboard Shortcuts

- `Ctrl/Cmd + E` - Export as CSV
- `Ctrl/Cmd + Shift + E` - Export as JSON
- `Ctrl/Cmd + I` - Import data file
- `Ctrl/Cmd + K` - Clear all data (with confirmation)

## Usage

### Generate from URL
1. Click the "From URL" tab
2. Enter a JSON API endpoint (e.g., `https://jsonplaceholder.typicode.com/users`)
3. Click "Fetch & Generate"
4. Data is automatically imported and ready to use

### Manual Generation
1. Click the "Manual" tab
2. Enter comma-separated headers (e.g., `Name, Email, Company`)
3. Choose number of rows (1-10,000)
4. Click "Generate Data"

### AI Generation
1. Click the "AI Generate" tab
2. Enter comma-separated headers
3. (Optional) Add context for more realistic data
4. Select an AI model (OpenAI or Groq)
5. Choose number of rows (1-100)
6. Click "Generate with AI"

### Import Data
1. Click "Import Data" button when you have existing data
2. Select a CSV or JSON file
3. Data is automatically parsed and loaded

### Export Data
- Click "Export CSV" for Excel-compatible format
- Click "Export JSON" for JSON format

## Security Features

- ✅ Rate limiting on API endpoints (10 requests per minute)
- ✅ Input validation and sanitization
- ✅ Security headers (X-Frame-Options, CSP, etc.)
- ✅ Error boundaries for graceful error handling
- ✅ No data sent to external servers (except AI generation)
- ✅ localStorage for client-side persistence only

## Tech Stack

- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Charts**: Recharts
- **AI**: OpenAI & Groq SDK
- **Analytics**: Vercel Analytics

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.

## Support

For issues or questions, please open an issue on GitHub or contact the maintainers.

---

Built with ❤️ by Brigit AI
