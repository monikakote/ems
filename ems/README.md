# ⚡ Smart Employee Management System (MERN Stack)

A full-stack Employee Management System built with MongoDB, Express.js, React.js, and Node.js.

---

## 📁 Project Structure

```
ems/
├── backend/           # Node.js + Express API
│   ├── models/        # Mongoose schemas (Admin, Employee, Attendance, Leave, Task, Department)
│   ├── routes/        # REST API routes
│   ├── middleware/    # JWT auth middleware
│   ├── server.js      # Entry point
│   └── .env           # Environment variables
└── frontend/          # React.js app
    ├── src/
    │   ├── pages/     # Dashboard, Employees, Attendance, Leaves, Tasks, Departments
    │   ├── components/ # Sidebar
    │   ├── context/   # Auth context
    │   └── utils/     # Axios API config
    └── public/
```

---

## ⚙️ Setup Instructions

### 1. Configure the Database

Edit `backend/.env` and replace the credentials:

```env
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@ems.9mzrg0z.mongodb.net/?appName=ems
JWT_SECRET=ems_super_secret_jwt_key_2024
PORT=5000
```

### 2. Install & Run Backend

```bash
cd backend
npm install
npm run dev       # Development (nodemon)
# OR
npm start         # Production
```

Backend runs at: **http://localhost:5000**

### 3. Install & Run Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 🔑 First Time Setup

1. Open http://localhost:3000
2. Click **"Sign Up"** on the login page
3. Create your admin account
4. Start adding departments and employees!

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Admin signup |
| POST | /api/auth/login | Admin login |
| GET/POST | /api/employees | List / Add employees |
| PUT/DELETE | /api/employees/:id | Edit / Delete employee |
| GET | /api/employees/:id/performance | Employee performance data |
| GET | /api/employees/stats/dashboard | Dashboard stats |
| GET/POST | /api/departments | List / Create departments |
| GET | /api/attendance | Get attendance records |
| POST | /api/attendance/mark | Bulk mark attendance |
| GET | /api/attendance/summary/:id | Employee attendance summary |
| GET/POST | /api/leaves | List / Create leave requests |
| PUT | /api/leaves/:id/status | Approve / Reject leave |
| GET/POST | /api/tasks | List / Assign tasks |
| PUT | /api/tasks/:id | Update task |
| GET | /api/tasks/stats/performers | Top performers data |

---

## ✨ Features

- 🔐 JWT Authentication (Admin only)
- 👥 Employee CRUD with profile avatars
- 🏢 Department management with employee count
- 📅 Daily attendance marking (Present / Absent / Leave)
- 🌿 Leave request workflow (Approve / Reject)
- ✅ Task assignment & status tracking
- 📊 Dashboard with Recharts (Pie + Bar charts)
- 🏆 Performance leaderboard (AI-like scoring)
- ⚠️ Smart alerts for low attendance / performance
- 💰 Auto salary calculation based on attendance
- 🔍 Search & filter employees
- 📱 Responsive design
- 🎨 Dark theme with modern UI

---

## 🧠 AI Performance Logic

Employees are automatically rated based on:
- **Attendance %** (weight: 50%)
- **Task completion rate** (weight: 50%)

| Score | Badge |
|-------|-------|
| Attendance ≥ 85% AND Tasks ≥ 75% | ⭐ High Performer |
| Attendance < 60% OR Tasks < 40% | ⚠️ Needs Improvement |
| Otherwise | 📊 Average |

---

## 💰 Salary Calculation Formula

```
Salary per day = Monthly Salary / 30
Final Salary   = Salary per day × Days Present this month
```
