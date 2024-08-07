# RAG-aTron Multimodal LLM Chatbot

Welcome to the RAG-aTron AI! This project leverages the power of Vercel's AI SDK, LangChain JS, and Chroma DB (vector DB) to provide a versatile and interactive chatbot experience. This showcases the use of multimodal LLMs to assist with crimes and case analysis.
Currently, this project is tested with OpenAI. Do change to Cohere/Anthropic if needed.

## Overview

This chatbot is built on Next.js and offers a wide range of features, including:

- **Retrieval-Augmented Generation (RAG):** Enhances the chatbot's responses by retrieving relevant information from a custom knowledge base.
- **Image-to-Image Query:** Allows users to input an image and get relevant image outputs via RAG.
- **Text-to-Image Query:** Converts textual queries into retrieve relevant images via RAG.
- **Text-to-Text Query (RAG):** Generates textual responses from knowledge base via RAG.
- **Audio Transcription:** Converts audio input into text.
- **Video to Text:** Summarises video with VideoLLaVa.

## Features

- **Routing of LLM Requests:** Utilises LangChain for efficient routing and handling of large language model requests.
- **Interactive Playground:** Users can ingest their images or conversation files and query based on case IDs.
- **Customisation Options:** Adjust temperature and retrieval settings to fine-tune the chatbot's responses.
- **Conversation History:** Keeps track of conversation history for better context and continuity in interactions.
- **Streaming:** Streaming of replies from AI assistant for better UX.

## Installation

This project uses Bun as the package installer. Follow the steps below to set up the project:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/timooo-thy/rag-atron-mllm.git
   cd rag-atron-mllm
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Create a Chroma Client and run:**

   ```bash
   docker pull chromadb/chroma
   docker run -p 8000:8000 chromadb/chroma
   ```

4. **Ensure Ollama is installed**

   Refer to this [link](https://github.com/ollama/ollama) if you have not done so. Skip this step if you intend to use OpenAI/Cohere/Anthropic instead.

5. **Insert API Keys and insert into .env (Follow .env.local.example. Langsmith for tracing and evaluation purposes)**

   ```bash
   OPENAI_API_KEY=""
   LANGCHAIN_TRACING_V2=true
   LANGCHAIN_ENDPOINT="https://api.smith.langchain.com"
   LANGCHAIN_API_KEY=""
   LANGCHAIN_PROJECT=""
   LANGCHAIN_CALLBACKS_BACKGROUND=true
   CHROMA_DB_URL=""
   AWS_BUCKET_NAME=""
   AWS_REGION=""
   AWS_BUCKET_ACCESS_KEY=""
   AWS_SECRET_ACCESS_KEY=""
   ```

6. **Start the development server:**

   ```bash
   bun run dev
   ```

7. **Only for Production**:

   Start a tmux session

   ```bash
   tmux new -s [session-name]
   ```

   One tmux terminal to build and run the server

   ```bash
   bun run build
   bun run start
   ```

   And the other tmux terminal to port over to ngrok

   ```bash
   ngrok http --domain=[***] [port]
   ```

   Alternatively, you can start the server with Chroma DB with Docker instead (port is set to 3000). In that case, remember to set CHROMA_DB_URL="http://chroma:8000" instead.

   ```bash
   docker-compose up --build -d
   ```

## Usage

### Ingest Data:

- Upload images or conversation text files.
- Assign a case ID to each upload for easy retrieval via metadata.

### Query the Chatbot:

- Use the interface to input your queries.
- Adjust the temperature and retrieval sliders to customise responses.
- View conversation history for context.

### Explore Different Query Types:

- **Text-to-Text:** Type your query and receive a text response.
- **Image-to-Image:** Upload an image and get related images in response.
- **Text-to-Image:** Input text and related image described by input text.
- **Audio Transcription:** Upload an audio file to get the transcribed text.
- **Video to Text:** Upload a video file to query/summarise the video.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or feedback, please open an issue or contact us at timothylhy@hotmail.com.

---

Thank you for using RAG-aTron Chatbot! I hope you find it useful and engaging.
