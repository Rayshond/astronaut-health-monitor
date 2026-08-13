# 🚀 Astronaut Health Monitor

A real-time health monitoring dashboard for ISS astronauts — built for the August Challenge.

## Stack
- **Backend**: Python (FastAPI + WebSocket) + C++ anomaly detection engine
- **Frontend**: React + Recharts
- **Data**: Synthetic ISS mission timeline (swappable for real data)

## Project Structure
```
astronaut-health-monitor/
├── backend/
│   ├── anomaly_engine/       # C++ anomaly detection (compiled)
│   │   ├── anomaly.cpp
│   │   ├── anomaly.h
│   │   └── Makefile
│   ├── api/
│   │   ├── main.py           # FastAPI app + WebSocket
│   │   └── alerts.py         # Alert definitions + remediation
│   ├── data/
│   │   └── generator.py      # Synthetic mission data generator
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/        # Dashboard UI components
    │   ├── hooks/             # WebSocket hook
    │   └── types/             # TypeScript types
    ├── package.json
    └── index.html
```

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
cd anomaly_engine && make && cd ..
uvicorn api.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173

## Metrics Monitored
| Metric | Normal Range |
|---|---|
| Heart Rate | 60–100 bpm |
| SpO2 | 95–100% |
| Respiratory Rate | 12–20 breaths/min |
| Systolic BP | 90–120 mmHg |
| Diastolic BP | 60–80 mmHg |
| Body Temperature | 97–99°F |
| Cabin CO2 | < 0.5% |
| Cabin O2 | 19.5–23.5% |
| Radiation Dose | < 1 mSv/day |
| Sleep Hours | 7–8 hrs |
| HRV (Stress) | > 40 ms (healthy) |
