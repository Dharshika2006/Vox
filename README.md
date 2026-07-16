<div align="center">

# 🎙️ Vox

**AI Voice Assistant for Email Management**

Draft, edit, and send emails effortlessly using only your voice.

</div>

---

## Overview

Vox is an intelligent, voice-first email management system designed to streamline your communication. By combining native Web Audio processing, natural language understanding, and seamless Gmail integration, Vox allows you to draft, edit, and send emails effortlessly using only your voice.

Traditional email clients require constant typing and screen interaction. Vox reimagines this process with a highly responsive, voice-first conversational interface. Simply speak your thoughts, and Vox translates them into professional, ready-to-send emails — managing the entire lifecycle from intent recognition to contact resolution, drafting, review, and sending.

This project was built from the ground up to prioritize speed, accuracy, and premium user experience. It leverages an ultra-lightweight frontend architecture and a robust, scalable backend.

## Key Features

- **Conversational Interface:** Interact with the assistant naturally. Vox understands context and can handle multi-turn conversations effortlessly.
- **Native Voice Activity Detection:** Utilizes the browser's native Web Audio API (`AnalyserNode`) to precisely detect when you start and stop speaking. This provides a fluid, push-to-talk-free experience with zero external dependencies, no bulky WebAssembly binaries, and blazing fast load times.
- **Intelligent Contact Resolution:** Automatically searches your contact list based on spoken names. If multiple matches are found, the assistant will ask for clarification.
- **AI-Powered Drafting and Formatting:** Generates professional email drafts from casual spoken prompts. Emails are constructed as perfectly formatted HTML, ensuring edge-to-edge responsiveness on both desktop and mobile email clients.
- **Gmail Integration:** Connects securely to your Google account using OAuth2 to send emails directly from your address.
- **Dynamic State Machine:** The backend employs a sophisticated state machine to track conversation progress, pending intents, and required clarifications.
- **Premium User Interface:** A sleek, responsive dashboard built with Next.js and Tailwind CSS. It features real-time visual audio feedback (dynamic ambient shader), seamless navigation, and a dedicated Learn section.

## Technical Architecture

Vox consists of two primary components: a high-performance backend and a modern frontend application.

### Backend

Built with **Python** and **FastAPI**, handling API routing, state management, and third-party integrations.

- **Framework:** FastAPI for high-performance, asynchronous API endpoints.
- **Database:** SQLite with SQLAlchemy ORM for managing users, contacts, email history, and conversation states.
- **AI Integration:** Utilizes advanced LLMs (via Groq and LiteLLM) for intent classification, contact extraction, and natural language generation.
- **Email Service:** Integrates with the Gmail API for authenticating users and sending multipart (HTML/Plain Text) emails.
- **Dependency Injection:** Services and repositories are decoupled and injected into routers, ensuring maintainable and testable code.

### Frontend

A single-page application built for a seamless, app-like experience.

- **Framework:** Next.js and React.
- **Styling:** Tailwind CSS (v4) for rapid, responsive UI development with custom theme variables.
- **Audio Processing:** Uses the browser's native `MediaRecorder` API and `AudioContext` (`AnalyserNode`) for ultra-efficient, real-time voice activity detection without external plugins.
- **State Management:** Custom React hooks manage API interactions, smart authentication routing, audio streams, and conversation state synchronization with the backend.

## Getting Started

### Prerequisites

- Node.js v18 or higher
- Python 3.12 or higher (recommended)
- A Google Cloud Console account with the Gmail API enabled (for OAuth credentials)
- An API key for your preferred LLM provider (e.g., Groq, OpenAI)

### Clone the Repository

```bash
git clone https://github.com/<your-username>/vox.git
cd vox
```

Don't have Git set up? You can also download the repository as a ZIP from GitHub (Code → Download ZIP) and extract it locally.

### Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env          # then populate with your DB URL, API keys, and OAuth credentials

# Initialize the database
# (run your project's DB init/migration command here)

# Start the API server
uvicorn main:app --reload     # runs on http://localhost:8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables to point to your local backend API

# Start the development server
npm run dev                   # runs on http://localhost:3000
```

## Usage Guide

1. **Authenticate** — Log in with your Google account to grant Vox permission to send emails on your behalf. Authenticated users are routed directly to their dashboard.
2. **Open the Dashboard** — Land on the main dashboard after logging in.
3. **Speak Your Request** — Click the microphone icon and speak naturally, e.g. *"Send an email to John about the upcoming project deadline."*
4. **Clarify if Needed** — If a contact is ambiguous or missing an email address, Vox will prompt you verbally and visually.
5. **Review and Send** — Review the generated draft, cleanly structured into paragraphs, then click **Send** or say *"Yes"* to dispatch the email.

## Design Philosophy

The design of Vox emphasizes clarity, focus, and a premium aesthetic. The interface is intentionally minimalist, highlighting the conversation and the drafted content rather than overwhelming the user with complex menus. The visual language uses high contrast, dynamic ambient shaders, and subtle micro-animations to provide feedback without distraction.

## Security and Privacy

Vox requires access to your Google account to send emails. Authentication is handled securely via OAuth2 — the application never sees or stores your Google password. Conversation history and drafts are stored securely in the local database and are accessible only to your authenticated session.

## Author

Developed by **Dharshika**.

This project represents a complete, production-ready implementation of an AI voice assistant, demonstrating advanced full-stack development, seamless UI/UX design, API integration, and natural language processing capabilities.
