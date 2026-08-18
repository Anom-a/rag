# AI RAG Platform

Welcome to the **AI RAG Platform**. This project provides a Retrieval-Augmented Generation (RAG) platform customized for enterprise internal staff. 

The application enables staff members to query documents and context from the organization’s knowledge base, retrieving accurate answers powered by state-of-the-art AI models, while incorporating a modern frontend and a robust backend.

## Architecture

*   **Backend:** Golang (Gin framework) 
*   **Frontend:** React (Vite, TailwindCSS)
*   **Database / Vector Store:** MongoDB
*   **LLM Provider:** Groq
*   **Embedding Provider:** Voyage AI

## Project Structure

*   `backend/`: Contains the Go-based API backend.
    *   `config/`: Configurations, database setups.
    *   `controllers/`: API route handlers.
    *   `models/`: Database schema modeling.
    *   `routes/`: Routing mechanisms.
    *   `services/`: Core logic integrations (LLM, Embeddings).
*   `frontend/`: Contains the React/Vite-based User Interface.
    *   `src/components/`: Reusable UI components.
    *   `src/services/`: API integration for frontend components.

## Getting Started

### Prerequisites

*   **Go** (v1.20+)
*   **Node.js** (v18+)
*   **MongoDB** database connection
*   API keys for **Groq** and **Voyage AI**

### Setup Environment Variables

Both the frontend and backend require `.env` files. Start by copying the provided example templates:

```bash
# Backend
cd backend
cp .env.example .env

# Frontend
cd ../frontend
cp .env.example .env
```
Make sure to fill in your `MONGO_URI`, `GROQ_API_KEY`, `EMBEDDING_API_KEY`, etc.

### Running the Backend

```bash
cd backend
go mod download
go run main.go
```
The API server will typically start on `http://localhost:8080`.

### Running the Frontend

```bash
cd frontend
npm install
npm run dev
```
The React development server will start on `http://localhost:5173`.

## Documentation

For a deeper dive into the system's architecture and design choices, please refer to our internal [Documentation](docs/DOCUMENTATION.md).

## License

All rights reserved.
