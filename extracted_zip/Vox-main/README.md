# Vox - AI Voice Assistant for Email Management

Vox is an intelligent, voice-first email management system designed to streamline your communication. By combining advanced Voice Activity Detection (VAD), natural language processing, and seamless Gmail integration, Vox allows you to draft, edit, and send emails effortlessly using only your voice.

## Overview

Traditional email clients require constant typing and screen interaction. Vox reimagines this process by introducing a highly responsive conversational interface. Simply speak your thoughts, and Vox will translate them into professional, ready-to-send emails. The system manages the entire lifecycle of an email—from initial intent recognition to contact resolution, drafting, reviewing, and sending.

This project was built from the ground up to prioritize speed, accuracy, and user experience. It leverages modern web technologies on the frontend and a robust, scalable architecture on the backend.

## Key Features

- **Conversational Interface:** Interact with the assistant naturally. Vox understands context and can handle multi-turn conversations.
- **On-Device Voice Activity Detection:** Utilizes advanced browser-based VAD (Silero) to precisely detect when you start and stop speaking, ensuring a fluid experience without awkward pauses or the need for push-to-talk buttons.
- **Intelligent Contact Resolution:** Automatically searches your contact list based on spoken names. If multiple matches are found, the assistant will ask for clarification.
- **AI-Powered Drafting and Rewriting:** Generates professional email drafts from casual spoken prompts. You can instruct the assistant to rewrite, formalize, or adjust the tone of the draft with a single click.
- **Gmail Integration:** Connects securely to your Google account using OAuth2 to send emails directly from your address.
- **Dynamic State Machine:** The backend employs a sophisticated state machine to track conversation progress, pending intents, and required clarifications.
- **Modern User Interface:** A sleek, responsive dashboard built with Next.js, featuring real-time visual feedback, contact management, and detailed email history.

## Technical Architecture

Vox is divided into two primary components: a high-performance backend and a modern frontend application.

### Backend Structure

Built with Python and FastAPI, the backend handles API routing, state management, and integrations with external services.

- **Framework:** FastAPI for high-performance, asynchronous API endpoints.
- **Database:** SQLite with SQLAlchemy ORM for managing users, contacts, email history, and conversation states.
- **AI Integration:** Utilizes advanced LLMs (via Groq and LiteLLM) for intent classification, contact extraction, and natural language generation.
- **Email Service:** Integrates with the Gmail API for authenticating users and sending emails.
- **Dependency Injection:** Services and repositories are decoupled and injected into routers, ensuring maintainable and testable code.

### Frontend Structure

The frontend is a single-page application built to provide a seamless, app-like experience.

- **Framework:** Next.js and React.
- **Styling:** Tailwind CSS for rapid, responsive UI development.
- **Audio Processing:** Uses the browser's MediaRecorder API alongside `@ricky0123/vad-web` for real-time voice activity detection.
- **State Management:** Custom React hooks manage API interactions, audio streams, and conversation state synchronization with the backend.

## Getting Started

Follow these instructions to set up the project locally for development and testing.

### Prerequisites

- Node.js (v18 or higher)
- Python (3.12 or higher recommended)
- A Google Cloud Console account with the Gmail API enabled (for OAuth credentials)
- API keys for your preferred LLM provider (e.g., Groq, OpenAI)

### Backend Setup

1. Navigate to the backend directory.
2. Create a virtual environment and activate it.
3. Install the required Python dependencies listed in the requirements file.
4. Copy the environment variables template to a `.env` file and populate it with your database URL, API keys, and Google OAuth credentials.
5. Initialize the database schema.
6. Start the FastAPI development server using Uvicorn. The API will typically run on localhost port 8000.

### Frontend Setup

1. Navigate to the frontend directory.
2. Install the necessary Node.js dependencies.
3. Ensure the environment variables point to your local backend API.
4. Start the Next.js development server. The application will be accessible on localhost port 3000.

## Usage Guide

1. **Authentication:** Log in using your Google account to grant Vox permission to send emails on your behalf.
2. **Dashboard:** Upon logging in, you will be directed to the main dashboard.
3. **Voice Interaction:** Click the microphone icon to begin. Speak your request (e.g., "Send an email to John about the upcoming project deadline").
4. **Clarification:** If the contact is ambiguous or missing an email address, Vox will prompt you verbally and visually.
5. **Review and Send:** Once the draft is generated, you can review it on the screen. You can ask Vox to modify it or manually edit the text. Click "Send" or say "Yes" when prompted to dispatch the email.

## Design Philosophy

The design of Vox emphasizes clarity and focus. The interface is intentionally minimalist, highlighting the conversation and the drafted content rather than overwhelming the user with complex menus. The visual language uses high contrast and subtle animations to provide feedback without distraction.

## Security and Privacy

Vox requires access to your Google account to send emails. Authentication is handled securely via OAuth2, meaning the application never sees or stores your Google password. Your conversation history and drafts are stored securely in the local database and are only accessible to your authenticated session.

## Author

Developed by Dharshika. 

This project represents a complete, production-ready implementation of an AI voice assistant, demonstrating advanced full-stack development, API integration, and natural language processing capabilities.