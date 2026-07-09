# Weekly Report Generator & Team Dashboard

## Setup Instructions

Follow these steps to run the project locally.

---

## 1. Prerequisites

Install the following:

- Node.js
- MySQL Server
- MySQL Workbench
- Git

---

## 2. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_LINK
cd weekly_report_generator
```

---

## 3. Database Setup

Open MySQL Workbench and run:

```sql
CREATE DATABASE weekly_report_db;
```

---

## 4. Backend Setup

Go to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` folder:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=weekly_report_db

JWT_SECRET=weekly_report_secret_key
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

Run backend:

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

---

## 5. Frontend Setup

Open a new terminal and go to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run frontend:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## 6. Run the Full Project

Use two terminals:

### Terminal 1

```bash
cd backend
npm run dev
```

### Terminal 2

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

---

## 7. Initial Admin Setup

First, register a user from the frontend.

Then update that user role to `ADMIN` in MySQL:

```sql
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'admin@example.com';
```

Login again using that admin account.

---

## 8. User Roles

### Team Member

- Create weekly reports
- Save reports as draft
- Submit reports
- View assigned projects

### Manager

- View submitted reports
- Manage projects
- Assign team members
- View dashboard analytics
- Use AI assistant

### Admin

- All manager features
- Manage user roles
- Activate/deactivate users
- Delete projects

---

## 9. Important Notes

- Do not push `.env` to GitHub.
- Do not push `node_modules` to GitHub.
- Make sure MySQL is running before starting backend.
- AI assistant requires a valid Gemini API key.
- If Gemini API key is not added, the main system will still run but AI features may not work.
