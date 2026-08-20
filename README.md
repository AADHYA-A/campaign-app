# Campaign App

**Live Website:** [https://campaign-bycorncha-aadhya-as-projects.vercel.app/)

## How to Run the Application

To run the full application, you need to open two separate terminal windows—one for the backend and one for the frontend. 

Since the app relies on a PostgreSQL database, you should first ensure that your database is running using Docker (if you are using the provided `docker-compose.yml`).

Here are the step-by-step commands:

### 1. Start the Database (Prerequisite)
If you aren't already running the PostgreSQL database, open a terminal in the root `campaign-app` folder and start it via Docker:
```powershell
# Navigate to the campaign-app folder
cd path\to\campaign-app
docker compose up -d
```
*(Note: If you don't have Docker, the app seems to also support falling back to a local PostgreSQL instance, but Docker is the easiest way.)*

### 2. Run the Backend API
Open your **first terminal window**, navigate to the `backend` folder, activate the virtual environment, and start the Uvicorn server:
```powershell
# Navigate to the backend folder
cd path\to\campaign-app\backend

# Start the FastAPI server using the existing virtual environment
venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
*The backend API will be available at http://127.0.0.1:8000*

### 3. Run the Frontend (Next.js)
Open your **second terminal window**, navigate to the `frontend` folder, install dependencies (if you haven't already), and start the Next.js development server:
```powershell
# Navigate to the frontend folder
cd path\to\campaign-app\frontend

# Install dependencies (only needed the first time)
npm install

# Start the Next.js development server
npm run dev
```
*The frontend web app will be available at http://localhost:3000*

Once both are running, open your web browser and navigate to `http://localhost:3000` to interact with the app.

---
