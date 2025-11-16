ii have a question , i connected a mcp connection for you to check out it cakked bridgit ai its real its live its rax i just mace it in 3 minutes ,  , my questio are we able to By using TypeScript to be our client provider we create a new directory and oxpose only the ai providers as tools then with ONE endpoint we connect this app so we dont do crazy wiring We really don't need to but I'm just giving you an example we could to 8000 plus perhaps if we wanted to but we're not i'm just saying this this way we have integration with anyone and everyone now the only thing I'm asking you to build this If you can't don't start building yet if you can somehow cut out the middleman which is Zapier from the following working file that same exact code I have connected to your MCP tool that you can actually make a call right now and I do want you to make a test call make a test call with tavily and search The question I just asked you how can we take out the Millman which is Zapier at this point right now it's using Zapier yes but if we can cut out Zapier and do this on our own I know we can To 120% we can The only thing are you able update it in a way we're not depending on Zapier from the following like I said the following is perfectly working and you have connection to it as well So try it out  See if you can do it do some research and we can use Typescript SDK as our client provider we install We would only install Typescript SDK and we can connect up to shit 8000 or more if we need to but we're not gonna connect up to 8 probably not even 8 I'm just saying in general this way we have one API end point 1 Wiring to and we get a lot more What do you think And here's a screenshot I took for you 







or with pnpm


pnpm add @modelcontextprotocol/sdk
Caution: Treat your MCP server URL like a password! It can be used to run tools attached to this server and access your data.

Usage

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

// Initialize the client with your details
const client = new Client(
  {
    name: "mcp-typescript-client",
    version: "1.0.0",
  },
  {
    capabilities: {},
  }
);

// Create a transport with your MCP server URL
const serverUrl =
  "https://mcp.zapier.com/api/mcp/s/ZjRmZTc3YmItNTA0Mi00MDAwLWFiZDgtZGFmNzlkYjJlOGFkOjAzNWYzNWFkLTU3MGEtNGI4NS05NWFjLWU4OTIyNDM4YzM2ZQ==/mcp";
const transport = new StreamableHTTPClientTransport(new URL(serverUrl));

async function main() {
  // Connect to the server
  console.log("Connecting to MCP server...");
  await client.connect(transport);
  console.log("Connected to MCP server");

  // List available tools
  console.log("Fetching available tools...");
  const tools = await client.listTools();

  console.log("Available tools:", tools);
  // Tools returned would look like:
  //   - name: "google_docs_find_a_document"
  //     description: "Search for a specific document by name."
  //     params: ["drive","title","folder"]
//   - name: "google_docs_get_document_content"
  //     description: "Retrieves the full content and metadata of a Google Doc by ID."
  //     params: ["document_id"]
//   - name: "google_docs_append_text_to_document"
  //     description: "Appends text to an existing document."
  //     params: ["file","text","drive", ...]
//   - name: "google_docs_create_document_from_template"
  //     description: "Creates a new doc based on an existing one and can replace any placeholder variables found in your template doc, like {{name}}, {{email}}, etc."
  //     params: ["file","drive","image", ...]
//   - name: "google_docs_upload_document"
  //     description: "Copy an already-existing file from another service to Docs. Will convert the file to Google Doc format if possible."
  //     params: ["file","drive","title", ...]
//   - name: "google_docs_find_and_replace_text"
  //     description: "Find and replace text in a Google Doc with case sensitivity support."
  //     params: ["find_text","match_case","document_id", ...]
//   - name: "google_docs_format_text"
  //     description: "Format text in a Google Doc with bold, italic, colors, and other styling options."
  //     params: ["tabId","endIndex","fontSize", ...]
//   - name: "google_docs_insert_image"
  //     description: "Insert an image at a specific position in a Google Doc."
  //     params: ["index","tabId","width", ...]
//   - name: "google_docs_insert_text"
  //     description: "Insert text at a specific position in a Google Doc."
  //     params: ["text","index","tabId", ...]
//   - name: "google_docs_create_document_from_text"
  //     description: "Create a new document from text. Also supports limited HTML."
  //     params: ["file","drive","image", ...]
//   - name: "google_docs_replace_image"
  //     description: "Replace an existing image in a Google Doc with a new one."
  //     params: ["tabId","imageUri","documentId", ...]
//   - name: "google_docs_update_document_properties"
  //     description: "Update document properties like background color, margins, and page settings in a Google Doc."
  //     params: ["marginTop","pageWidth","documentId", ...]
//   - name: "google_docs_api_request_beta"
  //     description: "This is an advanced action which makes a raw HTTP request that includes this integration's authentication."
  //     params: ["url","body","method", ...]
//   - name: "google_forms_api_request_beta"
  //     description: "This is an advanced action which makes a raw HTTP request that includes this integration's authentication."
  //     params: ["url","body","method", ...]
//   - name: "google_sheets_sort_range"
  //     description: "Sort data within a specified range in Google Sheets by a chosen column in ascending or descending order."
  //     params: ["drive","range","worksheet", ...]
//   - name: "google_sheets_update_spreadsheet_row"
  //     description: "Update a row in a specific spreadsheet with optional formatting."
  //     params: ["row","drive","worksheet", ...]
//   - name: "google_sheets_update_spreadsheet_row_s"
  //     description: "Update one or more rows in a specific spreadsheet (with line item support)."
  //     params: ["drive","worksheet","spreadsheet"]
//   - name: "google_sheets_api_request_beta"
  //     description: "This is an advanced action which makes a raw HTTP request that includes this integration's authentication."
  //     params: ["url","body","method", ...]
//   - name: "google_sheets_clear_spreadsheet_row_s"
  //     description: "Clears the contents of the selected row(s) while keeping the row(s) intact in the spreadsheet."
  //     params: ["row","drive","worksheet", ...]
//   - name: "google_sheets_find_worksheet"
  //     description: "Finds a worksheet by title."
  //     params: ["drive","title","spreadsheet"]
//   - name: "google_sheets_lookup_spreadsheet_rows_advanced"
  //     description: "Find up to 500 rows based on a column and value as line items."
  //     params: ["drive","bottom_up","row_count", ...]
//   - name: "google_sheets_get_data_range"
  //     description: "Get data from a specific range in a Google Spreadsheet using A1 notation (e.g., "A1:D10", "B2:E5")."
  //     params: ["drive","a1_range","worksheet", ...]
//   - name: "google_sheets_get_many_spreadsheet_rows_advanced"
  //     description: "Return up to 1,500 rows as a single JSON value or as line items."
  //     params: ["drive","range","first_row", ...]
//   - name: "google_sheets_get_row_by_id"
  //     description: "Get a specific spreadsheet row by its row number (ID). Row 1 is typically the header row."
  //     params: ["drive","row_id","worksheet", ...]
//   - name: "google_sheets_get_spreadsheet_by_id"
  //     description: "Get a specific Google Spreadsheet by its ID. Returns the raw spreadsheet data from the Google Sheets API."
  //     params: ["spreadsheet"]
//   - name: "google_sheets_lookup_spreadsheet_row"
  //     description: "Find a specific spreadsheet row based on a column and value. If found, it returns the entire row."
  //     params: ["drive","bottom_up","row_count", ...]
//   - name: "google_sheets_create_spreadsheet_column"
  //     description: "Create a new column in a specific spreadsheet."
  //     params: ["drive","index","worksheet", ...]
//   - name: "google_sheets_create_spreadsheet_row"
  //     description: "Create a new row in a specific spreadsheet."
  //     params: ["drive","timezone","worksheet", ...]
//   - name: "google_sheets_create_multiple_spreadsheet_rows"
  //     description: "Create one or more new rows in a specific spreadsheet (with line item support)."
  //     params: ["drive","worksheet","spreadsheet"]
//   - name: "google_sheets_create_spreadsheet_row_at_top"
  //     description: "Creates a new spreadsheet row at the top of a spreadsheet (after the header row)."
  //     params: ["drive","worksheet","spreadsheet"]
//   - name: "google_sheets_change_sheet_properties"
  //     description: "Update Google Sheets properties like frozen rows/columns, sheet position, and visibility settings."
  //     params: ["drive","hidden","worksheet", ...]
//   - name: "google_sheets_create_conditional_formatting_rule"
  //     description: "Apply conditional formatting to cells in a Google Sheets spreadsheet based on their values."
  //     params: ["drive","range","worksheet", ...]
//   - name: "google_sheets_copy_range"
  //     description: "Copy data from one range to another within a Google Sheets spreadsheet, with options for what to paste (values, formatting, etc.)."
  //     params: ["drive","worksheet","paste_type", ...]
//   - name: "google_sheets_copy_worksheet"
  //     description: "Creates a new worksheet by copying an existing worksheet."
  //     params: ["drive","copy_to","worksheet", ...]
//   - name: "google_sheets_create_spreadsheet"
  //     description: "Creates a new spreadsheet. Choose from a blank spreadsheet, a copy of an existing one, or one with headers."
  //     params: ["drive","title","headers", ...]
//   - name: "google_sheets_create_worksheet"
  //     description: "Creates a new worksheet in a Google Sheet."
  //     params: ["drive","title","headers", ...]
//   - name: "google_sheets_delete_sheet"
  //     description: "Permanently delete a worksheet from a Google Sheets spreadsheet. Warning: This action cannot be undone."
  //     params: ["drive","worksheet","spreadsheet", ...]
//   - name: "google_sheets_delete_spreadsheet_row_s"
  //     description: "Deletes the selected row(s) from the spreadsheet. This action removes the row(s) and all associated data."
  //     params: ["rows","drive","worksheet", ...]
//   - name: "google_sheets_format_cell_range"
  //     description: "Apply date, number, or style formatting (colors, bold, italic, strikethrough) to a range of cells in a Google Sheets spreadsheet."
  //     params: ["drive","range","worksheet", ...]
//   - name: "google_sheets_format_spreadsheet_row"
  //     description: "Format a row in a specific spreadsheet."
  //     params: ["row","drive","worksheet", ...]
//   - name: "google_sheets_rename_sheet"
  //     description: "Rename a worksheet in a Google Sheets spreadsheet."
  //     params: ["new_name","worksheet","spreadsheet"]
//   - name: "google_sheets_set_data_validation"
  //     description: "Set data validation rules on a range of cells in Google Sheets to control what data can be entered."
  //     params: ["drive","range","strict", ...]
//   - name: "tavily_search"
  //     description: "Search the web and return answers using Tavily"
  //     params: ["query","topic","include_answer", ...]
//   - name: "chatgpt_openai_conversation_legacy"
  //     description: "Sends a Chat to OpenAI and generates a Completion, optionally storing messages as we do. Powered by Chat Completions API."
  //     params: ["image","model","top_p", ...]
//   - name: "chatgpt_openai_conversation"
  //     description: "(Recommended) Send a chat to OpenAI, optionally storing messages for continuous conversation. This enhanced action can also help with web search, file search, and advanced tooling such as MCP. Powered by Responses API."
  //     params: ["files","model","tools", ...]
//   - name: "chatgpt_openai_create_transcription"
  //     description: "Creates a new transcription, using Whisper, from an audio or video file."
  //     params: ["file","prompt","language", ...]
//   - name: "chatgpt_openai_extract_structured_data_legacy"
  //     description: "Sends unstructured text and returns structured data using OpenAI's "Function Calling" capability. Powered by Chat Completions API."
  //     params: ["model","prompt","arguments", ...]
//   - name: "chatgpt_openai_extract_structured_data"
  //     description: "(Recommended) Improved structured data extraction with better formatting options and more reliable schema adherence. Powered by Responses API."
  //     params: ["model","prompt","arguments", ...]
//   - name: "chatgpt_openai_send_prompt"
  //     description: "Sends a prompt to OpenAI and generates a completion. _Note:_ this uses the legacy OpenAI Completions API. We recommend using `Conversation` or `Conversation With Assistant` actions instead, which are powered by the latest OpenAI APIs."
  //     params: ["stop","model","top_p", ...]
//   - name: "chatgpt_openai_summarize_text_legacy"
  //     description: "Enter a block of text and generate a summary. Powered by Chat Completions API."
  //     params: ["model","top_p","max_tokens", ...]
//   - name: "chatgpt_openai_api_request_beta"
  //     description: "This is an advanced action which makes a raw HTTP request that includes this integration's authentication."
  //     params: ["url","body","method", ...]
//   - name: "chatgpt_openai_convert_text_to_speech"
  //     description: "Converts a given text to speech."
  //     params: ["input","model","speed", ...]
//   - name: "chatgpt_openai_create_translation"
  //     description: "Creates a new translation."
  //     params: ["file","prompt","temperature", ...]
//   - name: "chatgpt_openai_upload_file"
  //     description: "Uploads a file so it can be used with assistants or fine-tuning."
  //     params: ["file","purpose"]
//   - name: "chatgpt_openai_classify_text_legacy"
  //     description: "Classify your text into one of your provided categories. Powered by Chat Completions API."
  //     params: ["model","top_p","categories", ...]
//   - name: "chatgpt_openai_write_an_email"
  //     description: "Writes the content of an email based on your provided prompt for use in a subsequent step."
  //     params: ["from","name","tone", ...]
//   - name: "chatgpt_openai_find_file"
  //     description: "Finds a file by filename."
  //     params: ["filename_to_search_for","file_purpose_to_search_for"]
//   - name: "chatgpt_openai_search_embeddings"
  //     description: "This best matches a query string (like "big animal") to a list of document strings (like "mouse", "cat", "buffalo", and "blue whale")."
  //     params: ["query","documents"]
//   - name: "chatgpt_openai_analyze_image_content_with_vision_legacy"
  //     description: "Upload an image and send a message or question about it. Powered by Chat Completions API."
  //     params: ["images","max_tokens","user_message"]
//   - name: "chatgpt_openai_analyze_text_sentiment_legacy"
  //     description: "Generate an analysis of the overall sentiment of a block of text. Powered by Chat Completions API."
  //     params: ["model","max_tokens","temperature", ...]
//   - name: "groq_api_request_beta"
  //     description: "This is an advanced action which makes a raw HTTP request that includes this integration's authentication."
  //     params: ["url","body","method", ...]
//   - name: "groq_create_response_beta"
  //     description: "Creates a response using Groq's response API (BETA)"
  //     params: ["input","model","top_p", ...]
//   - name: "groq_create_speech"
  //     description: "Converts text to speech using Groq's text-to-speech API"
  //     params: ["input","model","speed", ...]
//   - name: "groq_create_transcription"
  //     description: "Transcribes audio files using Groq's audio transcription API"
  //     params: ["model","prompt","file_url", ...]
//   - name: "groq_create_translation"
  //     description: "Translates audio files to English using Groq's audio translation API"
  //     params: ["model","prompt","file_url", ...]
//   - name: "groq_send_prompt"
  //     description: "Sends a prompt to Groq and returns the AI-generated response"
  //     params: ["model","top_p","prompt", ...]

  // Example: Call a specific tool with parameters
  console.log("Calling google_docs_find_a_document...");
  const result = await client.callTool({
    name: "google_docs_find_a_document",
    arguments: {
      instructions:
        "Execute the Google Docs: Find a Document tool with the following parameters",
      title: "example-string",
    },
  });
  console.log("google_docs_find_a_document result:\n", result);

  // Close the connection
  await client.transport?.close();
  await client.close();
}

main();
Server URL

The URL for this MCP server.

