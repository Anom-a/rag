# Ethio Robotics RAG Architecture Documentation

## 1. Overview
This platform serves as a modern Retrieval-Augmented Generation (RAG) system tailored for Ethio Robotics. The primary goal is to provide internal staff with an intuitive, efficient chat interface capable of referencing extensive internal documentation. 

The system relies on LLMs to synthesize answers and Vector databases to fetch relevant historical or technical context.

## 2. Tech Stack

### 2.1 Backend (Go + Gin)
*   **Framework:** The backend is built on the high-performance Go web framework, Gin.
*   **Data Storage:** We utilize MongoDB both for conventional database needs (authentication, settings, documents management) and as a scalable vector database for document embeddings.
*   **AI Integrations:**
    *   **LLM Engine:** Provided via Groq. Optimized for low-latency token generation on open-weights models (e.g., Llama 3, Qwen, or OpenAI OSS models).
    *   **Embeddings:** Voyage AI. Used for creating highly semantic vectors out of text chunks, ensuring accurate knowledge retrieval.

### 2.2 Frontend (React + Vite)
*   **Framework:** Built using modern React and bootstrapped with Vite for fast HMR and compilation.
*   **Styling:** Designed utilizing responsive utility classes via TailwindCSS (or equivalent CSS) to offer a modern, glassmorphic, and seamless UI structure that aligns with modern web standards.
*   **Key Components:**
    *   **Chat Interface:** Provides real-time messaging, conversation history, and clear visibility into contextual sources.
    *   **Admin Dashboard:** Dedicated sections for managing indexed documents, reviewing system logs, and adjusting model behaviors.

## 3. Deployment Configuration

### 3.1 Security & Rates
*   All endpoints should be secured using JWT tokens, specifically leveraging `ADMIN_TOKEN_SECRET`.
*   The system includes rate limiting mapped per client to prevent API abuse, particularly aimed at expensive LLM endpoints.

### 3.2 Prompts
*   The system behavior revolves around the `DEFAULT_SYSTEM_PROMPT` housed in the environment variables. Ensure the prompt is meticulously crafted to force the LLM into answering exclusively from the retrieved context. (e.g., *"Always refer to the company as 'Ethio Robotics'"*).

## 4. Ongoing Maintenance
*   Ensure that new embeddings use the corresponding vector dimensionality defined during the Voyage AI endpoint configuration.
*   Routinely test LLM models against the Groq console since experimental open models may have their endpoints/IDs updated by the provider.
