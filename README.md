<div align="center">

# 🎙️ Vox

**AI Voice Assistant for Email Management**

Draft, edit, and send emails effortlessly using only your voice.

</div>

---

## Overview

Traditional email clients require constant typing and screen interaction. Vox reimagines this process with a highly responsive, voice-first conversational interface. Simply speak your thoughts, and Vox translates them into professional, ready-to-send emails — managing the entire lifecycle from intent recognition to contact resolution, drafting, review, and sending.

Built from the ground up to prioritize speed, accuracy, and a premium user experience, Vox pairs an ultra-lightweight frontend with a robust, scalable backend.

## Table of Contents

- [Key Features](#key-features)
- [Technical Architecture](#technical-architecture)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Security and Privacy](#security-and-privacy)
- [Author](#author)

## Key Features

| Feature | Description |
|---|---|
| **Conversational Interface** | Interact naturally — Vox understands context and handles multi-turn conversations effortlessly. |
| **Native Voice Activity Detection** | Uses the browser's native Web Audio API (`AnalyserNode`) to precisely detect speech start/stop — no external dependencies, no WebAssembly binaries, blazing-fast load times. |
| **Intelligent Contact Resolution** | Automatically searches your contact list by spoken name and asks for clarification when multiple matches are found. |
| **AI-Powered Drafting & Formatting** | Generates professional, perfectly formatted HTML emails from casual spoken prompts, responsive across desktop and mobile clients. |
| **Gmail Integration** | Connects securely via OAuth2 to send emails directly from your Google account. |
| **Dynamic State Machine** | Tracks conversation progress, pending intents, and required clarifications on the backend. |
| **Premium UI** | A sleek, responsive Next.js + Tailwind dashboard with real-time ambient audio visualization and a dedicated Learn section. |

## Technical Architecture

Vox consists of two primary components: a high-performance backend and a modern frontend application.

### Backend

Built with **Python** and **FastAPI**, handling API routing, state management, and third-party integrations.

- **Framework:** FastAPI for high-performance, asynchronous API endpoints
- **Database:** SQLite with SQLAlchemy ORM for users, contacts, email history, and conversation state
- **AI Integration:** LLMs via Groq and LiteLLM for intent classification, contact extraction, and natural language generation
- **Email Service:** Gmail API integration for authentication and sending multipart (HTML/plain text) emails
- **Architecture:** Dependency injection keeps services and repositories decoupled, maintainable, and testable

### Frontend

A single-page application built for a seamless, app-like experience.

- **Framework:** Next.js and React
- **Styling:** Tailwind CSS v4 with custom theme variables for rapid, responsive UI development
- **Audio Processing:** Native `MediaRecorder` API and `AudioContext` (`AnalyserNode`) for ultra-efficient, real-time voice activity detection
- **State Management:** Custom React hooks manage API interactions, smart authentication routing, audio streams, and conversation state sync

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

> Don't have Git set up? You can also download the repository as a ZIP from GitHub (**Code → Download ZIP**) and extract it locally.

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

## Security and Privacy

Vox requires access to your Google account to send emails. Authentication is handled securely via OAuth2 — the application never sees or stores your Google password. Conversation history and drafts are stored securely in the local database and are accessible only to your authenticated session.

## Author

Developed by **Dharshika**.
