# F1 Data Dashboard 

A full-stack dashboard using FastF1 (Python) and React.js to visualize Formula 1 race data, telemetry, and strategy insights.

## Features
- Fastest lap analysis for the current 2025 F1 season
- Driver comparisons (lap deltas, sector times)
- Positional tracking of drivers throughout the race
- Tire strategy (coming soon!)

## Tech  & Architecture
- Flask (Python) for backend API
- React for frontend UI
- FastF1 used to extract F1 data 
- Data processing and transformation with Pandas & Matplotlib
- RESTful APIs connecting frontend and backend
- Explored caching strategies to reduce FastF1 latency


## Run Locally
```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py

# Frontend
cd frontend
npm install
npm start
