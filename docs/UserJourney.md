# Vox - User Journey (MVP)

## Goal

Allow a user to send a professional email completely hands-free using natural voice commands.

---

## User Flow

1. User opens Vox.

2. User clicks **Start Listening**.

3. Vox begins listening for voice input.

4. User says:

   "Hey Vox, send an email to Jared saying we have completed the UI and it is ready for testing tomorrow."

5. Vox converts speech to text.

6. Vox extracts:
   - Recipient
   - Intent
   - Email content

7. Vox sends the extracted text to the AI.

8. AI generates:
   - Subject
   - Professional email body

9. Vox displays the generated email.

10. Vox reads the email aloud.

11. Vox asks:

    "Would you like me to send this email?"

12. User replies:
    - Yes
    - No

13. If Yes:
    - Gmail API sends the email.
    - Email is stored in the database.

14. Vox says:

    "Your email has been sent successfully."

15. User returns to the home screen.