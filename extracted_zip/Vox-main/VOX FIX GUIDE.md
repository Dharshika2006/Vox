# Vox — Bug Report & Fix Guide

Repo: https://github.com/Dharshika2006/Vox
Tested: cloned locally, installed both sides, ran the backend and frontend build.

---

## 1. Confirmed issues (in order of severity)

### Backend — won't boot as-is
| # | Issue | Fix |
|---|---|---|
| 1 | `backend/requirements.txt` is saved as **UTF-16**, not UTF-8. `pip install -r requirements.txt` fails to parse it. | Re-save the file as UTF-8. In VS Code: bottom-right encoding indicator → "Save with Encoding" → UTF-8. Or via terminal: `iconv -f UTF-16 -t UTF-8 requirements.txt -o requirements.txt` |
| 2 | `sqlalchemy` is imported in `app/database.py` but missing from `requirements.txt` | Add `sqlalchemy` to requirements |
| 3 | `python-multipart` is required by FastAPI for the file-upload endpoint (`/voice-command`) but missing from `requirements.txt` | Add `python-multipart` to requirements |
| 4 | `app/models.py` is completely empty | Needs the SQLAlchemy models the rest of the code assumes exist (see §3) |
| 5 | `app/api/routes.py` is completely empty | Either delete it or move routes out of `main.py` into it (see §3) |
| 6 | `app/services/gmail_service.py` imports `OAuthToken` from `app.models` (doesn't exist) and `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `FRONTEND_URL` from `app.config` (only `GROQ_API_KEY` is defined there). This file will crash on import. | Add the missing config vars + `OAuthToken` model, or leave the file unimported until Gmail OAuth is actually built |
| 7 | `app/schemas.py` defines `EmailRequest`/`EmailResponse` but `main.py` redefines its own `EmailRequest` instead of using it | Import from `schemas.py` instead of duplicating |

### Frontend — real logic bugs
| # | Issue | Fix |
|---|---|---|
| 8 | `Hero.tsx`: the silence-detection loop reads `recording` from a **stale closure** (`false`, captured before `setRecording(true)` applies), so `requestAnimationFrame(checkSilence)` never re-schedules itself — the loop dies after one frame. Auto-stop-on-silence never actually works continuously. | Use a `useRef<boolean>` for the recording flag instead of state inside the RAF loop, or re-read from the ref each frame |
| 9 | Clicking the mic button again while recording does `else { return; }` — there is **no manual stop**. Combined with #8, users can get stuck recording. | Implement `recorder.stop()` + `setRecording(false)` in the else branch |
| 10 | `EmailPreview.tsx` renders `<pre>{JSON.stringify(email, null, 2)}</pre>` — a raw debug dump shown above the actual To/Subject/Body fields, plus leftover `console.log`s | Remove the debug `<pre>` block and the `console.log` calls in `EmailPreview.tsx` and `Hero.tsx` |
| 11 | `components/screens/*` (7 files: Home/Listening/Processing/Draft/Confirm/Sending/Success) and `hooks/useSpeechRecognition.ts` are **fully unused dead code** — never imported anywhere | Either wire them into an actual multi-step flow (matches the README's stated MVP workflow) or delete them |
| 12 | No "Confirm & Send" step exists in the UI at all — the app can transcribe + draft an email but never sends it or saves it to history, despite steps 6–8 of the README's MVP workflow | Build a confirm screen that calls a new `/send-email` backend endpoint (needs gmail_service.py wired + fixed first) |

---

## 2. Quick backend fix (copy-paste)

```bash
cd backend
iconv -f UTF-16 -t UTF-8 requirements.txt -o requirements.txt
echo "sqlalchemy" >> requirements.txt
echo "python-multipart" >> requirements.txt
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # then fill in GROQ_API_KEY
uvicorn app.main:app --reload
```

After this, `http://127.0.0.1:8000/` and `/health` respond correctly, and `/generate-email` works with a real `GROQ_API_KEY`.

---

## 3. Recommended structural cleanup (not blocking, but worth doing)

**`app/models.py`** — add the SQLAlchemy model the README promises (history + OAuth):
```python
from sqlalchemy import Column, Integer, String, DateTime, func
from app.database import Base

class EmailHistory(Base):
    __tablename__ = "email_history"
    id = Column(Integer, primary_key=True, index=True)
    transcript = Column(String)
    recipient = Column(String)
    subject = Column(String)
    body = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class OAuthToken(Base):
    __tablename__ = "oauth_tokens"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    access_token = Column(String)
    refresh_token = Column(String)
    token_uri = Column(String)
    client_id = Column(String)
    client_secret = Column(String)
    scopes = Column(String)
```

**`app/config.py`** — add the vars `gmail_service.py` already expects:
```python
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
```
And add matching placeholders to `.env.example`.

**`app/api/routes.py`** — move `/generate-email` and `/voice-command` out of `main.py` into a proper `APIRouter`, and add `Base.metadata.create_all(bind=engine)` on startup so the `email_history` table actually gets created and used.

**Frontend**: delete `components/screens/*` and `useSpeechRecognition.ts` if you're not going to build the multi-step flow soon — dead code is worse than no code for a resume/portfolio project someone will review.

---

## 4. Antigravity agent task (paste this into Google Antigravity)

Antigravity (Google's free agentic IDE) defaults to **Gemini 3.5 Flash**, which is free with generous rate limits and fast — a good fit for mechanical fixes like these. Groq isn't a selectable model provider inside Antigravity itself (it supports Gemini, Claude, and GPT-OSS) — but that's fine, since Groq is already what *Vox's own backend* uses for its LLM calls, so nothing needs to change there.

**Setup:**
1. Open Antigravity → open the `Vox` folder as a Project.
2. In the Agent Manager, pick **Gemini 3.5 Flash** as the model (fast + free tier).
3. Set mode to "Agent-assisted" (recommended) rather than full autopilot, so you can review diffs before they're applied.
4. Paste the task below into the agent chat.

```
You are fixing a broken FastAPI + Next.js project called "Vox" (voice-to-email assistant).
Apply these fixes exactly, in this order, and run the app after each major step to confirm it works:

BACKEND (backend/):
1. Re-save backend/requirements.txt as UTF-8 (it's currently UTF-16 and breaks pip install).
2. Add missing dependencies to requirements.txt: sqlalchemy, python-multipart.
3. Populate backend/app/models.py with SQLAlchemy models: EmailHistory (id, transcript,
   recipient, subject, body, created_at) and OAuthToken (id, user_id, access_token,
   refresh_token, token_uri, client_id, client_secret, scopes), using Base from app/database.py.
4. Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FRONTEND_URL to backend/app/config.py
   (read from env vars, FRONTEND_URL defaulting to http://localhost:3000), and add matching
   placeholder keys to backend/.env.example.
5. Move the /generate-email and /voice-command routes out of app/main.py into
   backend/app/api/routes.py as an APIRouter, and include it in main.py. Use the
   EmailRequest/EmailResponse schemas from app/schemas.py instead of the duplicate
   defined inline in main.py.
6. On app startup, call Base.metadata.create_all(bind=engine) so tables get created.
7. After each successful /generate-email call, save the result to the EmailHistory table.
8. Verify the backend boots cleanly with `uvicorn app.main:app --reload` and that
   GET / and GET /health return 200.

FRONTEND (frontend/):
9. Fix the stale-closure bug in components/landing/Hero.tsx: the checkSilence()
   requestAnimationFrame loop reads `recording` from a stale closure and stops after
   one frame. Replace the `recording` state read inside checkSilence with a ref
   (e.g. isRecordingRef) that's updated synchronously when recording starts/stops.
10. Implement manual stop-recording: clicking the mic button while recording is active
    should call mediaRecorderRef.current.stop() and setRecording(false), instead of
    doing nothing.
11. Remove the debug <pre>{JSON.stringify(email, null, 2)}</pre> block and any
    console.log statements in components/landing/EmailPreview.tsx and Hero.tsx.
12. Delete the unused files: components/screens/*.tsx (all 7) and
    components/landing/hooks/useSpeechRecognition.ts — confirm nothing imports them
    before deleting.
13. Run `npx tsc --noEmit` and `npm run build` to confirm no errors after all changes.

After all steps, give me a summary of every file changed and a diff-style list of what was fixed.
```

---

## 5. Other recommendations

- **Security**: `.env` is correctly gitignored — good. Just make sure `.env.example` never contains a real key (it currently doesn't).
- **Testing**: there are no tests anywhere in the repo. At minimum, add a `pytest` smoke test for `/generate-email` (mock the Groq client) and a Playwright/Cypress test for the mic-record → transcript flow.
- **CI**: add a GitHub Actions workflow that runs `pip install -r requirements.txt`, `pytest`, `npm ci`, `npx tsc --noEmit`, and `npm run build` on every push — this would have caught bugs #1–#3 automatically.
- **README accuracy**: the README's "MVP Workflow" (steps 6–8: confirm, send via Gmail, save to history) isn't implemented yet. Either mark those as "planned" explicitly or build them — right now it reads as if the whole flow works end-to-end.
