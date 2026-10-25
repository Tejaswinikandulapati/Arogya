AROGYA WORKING WEB APP
======================

WHAT WORKS
- Patient appointment form with validation and booking ID
- Persistent appointment storage in data/appointments.json (survives server restart)
- Doctor desk: refresh, status updates (Pending / Approved / Rejected / Completed / Cancelled)
- Prevents booking the same doctor at the same date/time twice
- CSV export for appointments
- Rule-based symptom-to-specialty guidance with urgent warning keyword checks
- Lab value comparison against the range the user enters
- Google Maps hospital search
- Floating assistant for app navigation and general safety guidance
- Optional email notifications via SMTP
- Optional WhatsApp notifications via Meta WhatsApp Cloud API and an approved template

RUN ON WINDOWS
1. Install Node.js 18 or newer from https://nodejs.org/
2. Extract this ZIP to a folder.
3. Open that folder in Command Prompt / PowerShell.
4. Run: npm install
5. Copy .env.example to .env (optional; only needed for notifications).
6. Run: npm start
7. Open http://localhost:3000 in your browser.

RUN ON MAC / LINUX
Open Terminal in the extracted folder and run:
  npm install
  cp .env.example .env
  npm start
Then open http://localhost:3000

EMAIL SETUP (OPTIONAL)
For Gmail, use an App Password (not your normal password). Enable 2-Step Verification in your Google account, create an App Password, and put values in .env:
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=465
  SMTP_SECURE=true
  SMTP_USER=your-email
  SMTP_PASS=your-app-password
  EMAIL_FROM=your-email
The patient must provide an email address. Never paste passwords into chat or commit .env to a public repository.

WHATSAPP SETUP (OPTIONAL)
Configure Meta WhatsApp Cloud API:
  WHATSAPP_TOKEN=your-access-token
  WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
  WHATSAPP_TEMPLATE_NAME=your-approved-template-name
  WHATSAPP_TEMPLATE_LANGUAGE=en_US
The approved template must have five body parameters in this order:
patient name, booking ID, doctor name, appointment date/time, status.
The patient's phone must be in international format. Meta policies, opt-in requirements, template approval and messaging limits apply.

IMPORTANT LIMITATIONS
- This is a functional learning prototype, not production-ready clinical software.
- The doctor desk has NO login or role-based access control. Do not expose it publicly.
- The data file is suitable only for local demo use; it is not a production database.
- No real AI model is connected. Symptom guidance is rule-based and not diagnostic.
- No real clinic/doctor schedule is connected. Doctor names and specialties are sample data.
- The report checker only compares a number with the range you enter; it does not determine whether a result is medically normal.
- Before real patient use, add authentication, role authorization, encryption, secure database, audit logs, backups, consent/privacy controls, rate limiting, input validation, clinical review and applicable legal compliance.
- Never rely on this app for emergency decisions.
