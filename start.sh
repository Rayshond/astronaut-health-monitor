#!/bin/bash
# Start the Astronaut Health Monitor
# Run from the project root directory

set -e

echo "🚀 Astronaut Health Monitor — Starting up..."
echo ""

# ── Build C++ anomaly engine ──────────────────────────────────────────────────
echo "⚙️  Building C++ anomaly engine..."
cd backend/anomaly_engine
make -s
cd ../..
echo "✅ C++ engine built"
echo ""

# ── Install Python deps ───────────────────────────────────────────────────────
echo "📦 Installing Python dependencies..."
pip3 install -q -r backend/requirements.txt
echo "✅ Python deps ready"
echo ""

# ── Install frontend deps ─────────────────────────────────────────────────────
echo "📦 Installing frontend dependencies..."
cd frontend
npm install --silent
cd ..
echo "✅ Frontend deps ready"
echo ""

# ── Launch ────────────────────────────────────────────────────────────────────
echo "🌐 Starting backend on http://localhost:8000"
echo "🌐 Starting frontend on http://localhost:5173"
echo ""
echo "Open http://localhost:5173 in your browser"
echo ""

# Start backend in background
cd backend
uvicorn api.main:app --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Start frontend
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Trap Ctrl+C to kill both
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo ''; echo '👋 Shutdown complete'" INT

echo "Press Ctrl+C to stop"
wait
