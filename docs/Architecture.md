# Vox - System Architecture

## Overview

Vox follows a client-server architecture.

The browser handles voice input and output, while the backend manages AI processing, email delivery, and data storage.

---

## Components

### Frontend (Next.js)

Responsibilities:

- Display the user interface
- Start and stop voice listening
- Display generated email
- Read email aloud
- Send requests to the backend

---

### Web Speech API

Responsibilities:

- Convert speech into text

Input:

User voice

Output:

Text transcript

---

### FastAPI Backend

Responsibilities:

- Receive transcript
- Call the AI model
- Return generated email
- Handle Gmail integration
- Save email history

---

### Groq API (Llama 3.3)

Responsibilities:

- Understand user intent
- Generate subject
- Generate professional email

---

### Gmail API

Responsibilities:

- Authenticate user
- Send email

---

### SQLite Database

Responsibilities:

- Store email history
- Store timestamps
- Store recipients
- Store generated subject