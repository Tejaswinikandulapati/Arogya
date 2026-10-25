Arogya – AI-Assisted Healthcare Web Application

Arogya is a healthcare web application prototype designed to support patient appointment booking and help healthcare staff manage appointment requests through a simple web interface.

The project demonstrates practical web development, AI-assisted problem-solving, and prompt engineering using ChatGPT and Claude.

Features

- Patient Appointment Booking: Patients can submit appointment requests through a form.
- Form Validation: Validates appointment details before submission.
- Booking ID: Generates an identifier for appointment tracking.
- Persistent Storage: Stores appointment data in a JSON file.
- Doctor Dashboard: Enables staff to review appointment requests and update their status.
- Appointment Status Management: Supports Pending, Approved, and Rejected statuses.
- Data Persistence: Appointment records are designed to remain available after the application restarts.

Technology Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js and Express.js
- Data Storage: JSON file-based storage
- AI Tools: ChatGPT and Claude
- Development Environment: Visual Studio Code
- Version Control: Git and GitHub

How AI Was Used

ChatGPT and Claude were used to assist with project planning, prompt development, code generation, refinement, troubleshooting, and documentation.

Prompts were refined iteratively to improve the structure, functionality, and clarity of the application.

Getting Started

Prerequisites

- Node.js and npm installed
- Git (optional, for version control)

Installation

1. Clone or download this repository.

2. Open the project folder in Visual Studio Code.

3. Open a terminal in the project directory.

4. Install dependencies:
   
   npm install

5. Configure environment variables using the provided ".env.example" file if required by the application.

6. Start the application using the start command defined in "package.json".
   
   npm start

7. Open the local URL displayed in the terminal.

Note: The start command and environment configuration depend on the project's actual setup. Check "package.json" and "server.js" if any command needs adjustment.

Project Structure

Arogya-Working-Features-App/
├── data/
├── server.js
├── package.json
├── package-lock.json
├── .env.example
└── README.md

Additional frontend files and folders may be present depending on the implementation.

Important Notes

- This is a prototype intended for demonstration and assessment purposes.
- It is not a substitute for professional medical advice, diagnosis, or treatment.
- The application should be security-tested before real-world deployment.
- JSON file storage is suitable for a small demonstration but may require a database for production use.
- Do not upload passwords, API keys, private patient information, or the actual ".env" file to GitHub.

Future Improvements

- Database integration
- User authentication and role-based access
- Improved patient and doctor dashboards
- Secure deployment and automated testing
- Additional accessibility and usability improvements

Author

Developed as a practical project for the AI Growth & Automation Associate – AI Skills & Prompt Engineering Assessment.

License

This project is intended for educational and assessment purposes.
