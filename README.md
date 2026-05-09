# FreelanceHub v2
### B.Tech CSE Final Year Project | Ranvir Singh | GZSCCET, MRSPTU

A full-stack freelancing platform (Fiverr-clone) built with React + Django.

---

## Run Locally (2 terminals)

### Terminal 1 — Backend
```bash
cd backend
venv311\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations api
python manage.py migrate
python seed.py
python manage.py runserver
```

### Terminal 2 — Frontend
```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:5173

### Demo logins
| Username | Password | Role |
|----------|----------|------|
| ranvir | demo1234 | Seller |
| priya | demo1234 | Seller |
| alex | demo1234 | Buyer |
| james | demo1234 | Buyer |
| admin | admin1234 | Admin |

---

## Deploy to the Internet

### Step 1 — Push to GitHub
1. Create a new repository on github.com (name it `freelancehub`)
2. Open VS Code terminal in the `freelancehub-v2` folder:
```bash
git init
git add .
git commit -m "FreelanceHub v2 - B.Tech Final Year Project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/freelancehub.git
git push -u origin main
```

### Step 2 — Deploy Backend on Railway
1. Go to railway.app → Login with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `freelancehub` repo
4. Click "Add Service" → select the `backend` folder
5. Railway auto-detects Django and deploys it
6. Add these environment variables in Railway dashboard:
   ```
   SECRET_KEY = any-long-random-string-here
   DEBUG = False
   ALLOWED_HOSTS = your-app.railway.app
   CORS_ALLOWED_ORIGINS = https://your-app.vercel.app
   ```
7. Copy your Railway URL (looks like: https://freelancehub-backend.railway.app)

### Step 3 — Deploy Frontend on Vercel
1. Go to vercel.com → Login with GitHub
2. Click "New Project" → Import your `freelancehub` repo
3. Set Root Directory to `frontend`
4. Add Environment Variable:
   ```
   VITE_API_URL = https://your-railway-url.railway.app
   ```
5. Click Deploy
6. Your site is live at https://freelancehub.vercel.app 🎉

### Step 4 — Seed production database
After Railway deploys, open Railway's terminal and run:
```bash
python seed.py
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React + Vite | Fast, component-based UI |
| Styling | Plain CSS | Full control, no dependencies |
| Routing | React Router | Single-page navigation |
| HTTP | Axios | Clean API calls with JWT headers |
| Backend | Django + DRF | Python, fast development, built-in admin |
| Auth | JWT (Simple JWT) | Stateless, works with React |
| Database | SQLite (local) / PostgreSQL (prod) | Easy switch |
| Deployment | Vercel + Railway | Free, GitHub-connected |

## Project Modules
1. User Authentication — Register, Login, JWT tokens, Role-based access
2. Gig Management — Browse, search, filter, create service listings
3. Order System — Place orders, track status, buyer/seller workflow
4. Admin Panel — Custom dashboard showing users, gigs, orders, revenue
