"""
FastAPI backend — serves real-time health metrics via WebSocket.
HTTP endpoints for mission state and manual anomaly injection (demo mode).
"""

import asyncio
import json
import sys
import os
from typing import Set

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Add parent dir to path so we can import sibling packages
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data.generator import MissionSimulator, BASELINES, MISSION_PHASES, EVA_DAYS
from api.alerts import evaluate_metrics, THRESHOLDS

app = FastAPI(title="Astronaut Health Monitor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Global simulator instance ───────────────────────────────────────────────
simulator = MissionSimulator(start_day=0, tick_seconds=2.0)
connected_clients: Set[WebSocket] = set()


# ─── HTTP Endpoints ───────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "online", "service": "Astronaut Health Monitor"}


@app.get("/mission/state")
def mission_state():
    return {
        "mission_day":    simulator.mission_day,
        "phase":          _get_phase(simulator.mission_day),
        "is_eva_day":     simulator.mission_day in EVA_DAYS,
        "total_days":     200,
        "inject_anomaly": simulator.inject_anomaly,
    }


@app.get("/mission/phases")
def mission_phases():
    return [
        {"start": s, "end": e, "name": n}
        for s, e, n in MISSION_PHASES
    ]


@app.get("/metrics/thresholds")
def metric_thresholds():
    return THRESHOLDS


@app.get("/metrics/baselines")
def metric_baselines():
    return BASELINES


@app.post("/mission/set-day/{day}")
def set_mission_day(day: int):
    """Jump to a specific mission day (useful for demo)."""
    if 0 <= day <= 200:
        simulator.mission_day = day
        simulator._sub_tick = 0
        return {"mission_day": day}
    return JSONResponse(status_code=400, content={"error": "Day must be 0–200"})


@app.post("/demo/inject/{metric}")
def inject_anomaly(metric: str):
    """Force a metric into the danger zone for demo purposes."""
    if metric not in BASELINES:
        return JSONResponse(status_code=404, content={"error": f"Unknown metric: {metric}"})
    simulator.inject_anomaly = metric
    return {"injecting": metric}


@app.post("/demo/clear")
def clear_anomaly():
    """Clear injected anomaly."""
    simulator.inject_anomaly = None
    return {"status": "cleared"}


# ─── WebSocket ────────────────────────────────────────────────────────────────

@app.websocket("/ws/metrics")
async def websocket_metrics(websocket: WebSocket):
    await websocket.accept()
    connected_clients.add(websocket)
    try:
        while True:
            snapshot = simulator.tick()
            alerts   = evaluate_metrics(snapshot["metrics"], snapshot["timestamp"])

            payload = {
                **snapshot,
                "alerts": [
                    {
                        "id":          a.id,
                        "metric":      a.metric,
                        "severity":    a.severity,
                        "title":       a.title,
                        "description": a.description,
                        "actions":     a.actions,
                        "protocol":    a.protocol,
                        "value":       a.value,
                        "unit":        a.unit,
                        "timestamp":   a.timestamp,
                    }
                    for a in alerts
                ],
            }

            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(simulator.tick_seconds)

    except WebSocketDisconnect:
        connected_clients.discard(websocket)
    except Exception as e:
        connected_clients.discard(websocket)


def _get_phase(day: int) -> str:
    for start, end, name in MISSION_PHASES:
        if start <= day <= end:
            return name
    return "cruise"
