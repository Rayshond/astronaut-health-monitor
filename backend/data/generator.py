"""
Synthetic ISS Mission Data Generator
Produces realistic health metrics that track mission phases.
Real metric baselines sourced from NASA/ESA astronaut health literature.
"""

import math
import random
import time
from datetime import datetime, timedelta
from typing import Optional

# ─── Mission Timeline ────────────────────────────────────────────────────────
# Each phase tuple: (start_day, end_day, phase_name)
MISSION_PHASES = [
    (0,   3,   "launch"),
    (4,   30,  "early_orbit"),
    (31,  150, "cruise"),
    (151, 170, "mid_mission"),
    (171, 180, "eva_intensive"),
    (181, 190, "recovery"),
    (191, 195, "reentry_prep"),
    (196, 200, "reentry"),
]

# EVA (spacewalk) days — high-stress events
EVA_DAYS = {12, 45, 78, 110, 155, 165, 172, 175, 178}

# ─── Metric Baselines (real NASA/ESA data) ───────────────────────────────────
BASELINES = {
    "heart_rate":        {"mean": 70,   "std": 8,    "unit": "bpm"},
    "spo2":              {"mean": 98.5, "std": 0.5,  "unit": "%"},
    "respiratory_rate":  {"mean": 15,   "std": 2,    "unit": "breaths/min"},
    "systolic_bp":       {"mean": 115,  "std": 8,    "unit": "mmHg"},
    "diastolic_bp":      {"mean": 75,   "std": 5,    "unit": "mmHg"},
    "body_temp":         {"mean": 98.2, "std": 0.3,  "unit": "°F"},
    "cabin_co2":         {"mean": 0.28, "std": 0.04, "unit": "%"},
    "cabin_o2":          {"mean": 21.0, "std": 0.3,  "unit": "%"},
    "radiation_dose":    {"mean": 0.3,  "std": 0.08, "unit": "mSv/day"},
    "sleep_hours":       {"mean": 7.5,  "std": 0.6,  "unit": "hrs"},
    "hrv":               {"mean": 55,   "std": 10,   "unit": "ms"},
}

# Phase multipliers: how each phase shifts metrics
# format: { metric: (mean_delta, std_multiplier) }
PHASE_EFFECTS = {
    "launch": {
        "heart_rate":       (25, 2.5),
        "systolic_bp":      (20, 2.0),
        "diastolic_bp":     (12, 1.8),
        "respiratory_rate": (5,  1.8),
        "body_temp":        (0.4, 1.5),
        "hrv":              (-20, 1.5),
    },
    "early_orbit": {
        "heart_rate":       (8,  1.4),
        "systolic_bp":      (5,  1.2),
        "cabin_co2":        (0.05, 1.2),
        "sleep_hours":      (-1.0, 1.5),
        "hrv":              (-10, 1.3),
    },
    "cruise": {},  # normal baseline
    "mid_mission": {
        "sleep_hours":      (-0.5, 1.2),
        "hrv":              (-5, 1.1),
        "radiation_dose":   (0.05, 1.1),
    },
    "eva_intensive": {
        "heart_rate":       (15, 2.0),
        "spo2":             (-1.0, 1.5),
        "respiratory_rate": (4, 1.6),
        "body_temp":        (0.6, 1.4),
        "hrv":              (-15, 1.8),
        "cabin_co2":        (0.08, 1.3),
    },
    "recovery": {
        "sleep_hours":      (-0.8, 1.3),
        "hrv":              (-8, 1.2),
    },
    "reentry_prep": {
        "heart_rate":       (10, 1.5),
        "systolic_bp":      (8, 1.3),
        "hrv":              (-10, 1.4),
    },
    "reentry": {
        "heart_rate":       (30, 3.0),
        "systolic_bp":      (25, 2.5),
        "diastolic_bp":     (15, 2.0),
        "respiratory_rate": (6, 2.0),
        "body_temp":        (0.5, 1.5),
        "hrv":              (-25, 2.0),
        "spo2":             (-1.5, 1.8),
    },
}

EVA_EFFECTS = {
    "heart_rate":       (40, 3.0),
    "spo2":             (-2.0, 2.0),
    "respiratory_rate": (8,   2.5),
    "body_temp":        (1.0, 2.0),
    "systolic_bp":      (20,  2.0),
    "hrv":              (-20, 2.0),
    "cabin_co2":        (0.15, 1.8),
}


def get_phase(mission_day: int) -> str:
    for start, end, name in MISSION_PHASES:
        if start <= mission_day <= end:
            return name
    return "cruise"


def generate_metric(metric: str, mission_day: int, inject_anomaly: Optional[str] = None) -> float:
    baseline = BASELINES[metric]
    mean = baseline["mean"]
    std  = baseline["std"]

    phase = get_phase(mission_day)
    effects = PHASE_EFFECTS.get(phase, {})

    if metric in effects:
        delta, std_mul = effects[metric]
        mean += delta
        std  *= std_mul

    # EVA day boost
    if mission_day in EVA_DAYS and metric in EVA_EFFECTS:
        delta, std_mul = EVA_EFFECTS[metric]
        mean += delta
        std  *= std_mul

    # Slow circadian drift over mission (fatigue accumulation)
    if mission_day > 30:
        drift = math.sin(mission_day / 14) * std * 0.3
        mean += drift

    value = random.gauss(mean, std)

    # Clamp to physiologically plausible values
    clamps = {
        "heart_rate":        (30,  220),
        "spo2":              (70,  100),
        "respiratory_rate":  (6,   40),
        "systolic_bp":       (70,  200),
        "diastolic_bp":      (40,  130),
        "body_temp":         (95,  105),
        "cabin_co2":         (0.0, 5.0),
        "cabin_o2":          (15,  25),
        "radiation_dose":    (0.0, 10),
        "sleep_hours":       (0,   12),
        "hrv":               (5,   150),
    }
    lo, hi = clamps.get(metric, (-999, 999))
    value = max(lo, min(hi, value))

    # Inject deliberate anomaly for demo/testing
    if inject_anomaly == metric:
        value = _inject_anomaly(metric, value)

    return round(value, 2)


def _inject_anomaly(metric: str, current: float) -> float:
    """Push a metric into the danger zone."""
    anomaly_values = {
        "heart_rate":        random.uniform(130, 160),
        "spo2":              random.uniform(88, 92),
        "respiratory_rate":  random.uniform(25, 35),
        "systolic_bp":       random.uniform(160, 185),
        "diastolic_bp":      random.uniform(100, 115),
        "body_temp":         random.uniform(100.5, 103),
        "cabin_co2":         random.uniform(1.0, 2.5),
        "cabin_o2":          random.uniform(16.0, 18.5),
        "radiation_dose":    random.uniform(2.5, 4.0),
        "sleep_hours":       random.uniform(3.0, 4.5),
        "hrv":               random.uniform(10, 20),
    }
    return round(anomaly_values.get(metric, current), 2)


def generate_snapshot(mission_day: int, inject_anomaly: Optional[str] = None) -> dict:
    """Generate a full set of health metrics for a given mission day."""
    snapshot = {
        "timestamp":    datetime.utcnow().isoformat() + "Z",
        "mission_day":  mission_day,
        "phase":        get_phase(mission_day),
        "is_eva_day":   mission_day in EVA_DAYS,
        "metrics": {
            metric: {
                "value": generate_metric(metric, mission_day, inject_anomaly),
                "unit":  BASELINES[metric]["unit"],
            }
            for metric in BASELINES
        }
    }
    return snapshot


# ─── Streaming generator (used by FastAPI) ───────────────────────────────────
class MissionSimulator:
    """Simulates a live mission, advancing time and streaming snapshots."""

    def __init__(self, start_day: int = 0, tick_seconds: float = 2.0):
        self.mission_day   = start_day
        self.tick_seconds  = tick_seconds
        self._sub_tick     = 0          # ticks per day
        self._ticks_per_day = 30        # 30 ticks = 1 simulated day
        self.inject_anomaly: Optional[str] = None

    def tick(self) -> dict:
        snapshot = generate_snapshot(self.mission_day, self.inject_anomaly)
        self._sub_tick += 1
        if self._sub_tick >= self._ticks_per_day:
            self._sub_tick = 0
            self.mission_day = min(self.mission_day + 1, 200)
        return snapshot


# ─── CLI test ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    sim = MissionSimulator(start_day=172)  # EVA-intensive phase
    for _ in range(5):
        snap = sim.tick()
        print(f"Day {snap['mission_day']} [{snap['phase']}]")
        for k, v in snap["metrics"].items():
            print(f"  {k:20s}: {v['value']} {v['unit']}")
        print()
