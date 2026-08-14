"""
Alert definitions and immediate remediation protocols.
Each alert maps an out-of-range metric to:
  - severity (critical / warning)
  - plain-English description
  - immediate action steps (what to do RIGHT NOW)
  - protocol reference (NASA/ESA standard)
"""

from dataclasses import dataclass, field
from typing import List, Literal

Severity = Literal["critical", "warning"]


@dataclass
class Alert:
    id: str
    metric: str
    severity: Severity
    title: str
    description: str
    actions: List[str]
    protocol: str
    value: float = 0.0
    unit: str = ""
    timestamp: str = ""


# ─── Thresholds ──────────────────────────────────────────────────────────────
# Physiologically accurate per metric.
# "warning" = caution zone — card color shifts, NO alert panel entry
# "critical" = danger zone — alert panel fires with DANGER label
# None means no bound in that direction for that level
THRESHOLDS = {
    # 0 bpm = death. >220 bpm = lethal arrhythmia territory.
    "heart_rate": {
        "warning":  (50,   120),
        "critical": (40,   150),
    },
    # Below 90% SpO2 = hypoxia. 100% is max possible.
    "spo2": {
        "warning":  (93,  None),
        "critical": (88,  None),
    },
    # <4 breaths/min = respiratory arrest. >35 = severe distress.
    "respiratory_rate": {
        "warning":  (8,   25),
        "critical": (4,   35),
    },
    # Systolic: <70 = shock. >180 = hypertensive crisis / stroke risk.
    "systolic_bp": {
        "warning":  (85,  145),
        "critical": (70,  180),
    },
    # Diastolic: <40 = shock. >110 = hypertensive emergency.
    "diastolic_bp": {
        "warning":  (50,  95),
        "critical": (40,  110),
    },
    # <95F = hypothermia. >103F = dangerous fever / heat stroke.
    "body_temp": {
        "warning":  (96.5, 100.4),
        "critical": (95.0, 103.0),
    },
    # ISS normal ~0.3%. >1.5% = headaches/cognitive impairment. >3% = toxic.
    "cabin_co2": {
        "warning":  (None, 1.0),
        "critical": (None, 1.5),
    },
    # <16% = hypoxia. >25% = fire/explosion risk. 0% = unsurvivable.
    "cabin_o2": {
        "warning":  (18.5, 24.0),
        "critical": (16.0, 25.5),
    },
    # >2 mSv/day = elevated cancer risk. >5 = acute radiation syndrome risk.
    "radiation_dose": {
        "warning":  (None, 2.0),
        "critical": (None, 5.0),
    },
    # <4 hrs sustained = severe cognitive impairment / mission risk.
    "sleep_hours": {
        "warning":  (5.5,  None),
        "critical": (4.0,  None),
    },
    # HRV <15ms = severe stress / autonomic collapse risk.
    "hrv": {
        "warning":  (25,  None),
        "critical": (15,  None),
    },
}


# ─── Remediation Protocols ───────────────────────────────────────────────────
REMEDIATION = {
    "heart_rate": {
        "high_critical": Alert(
            id="HR-HC",
            metric="heart_rate",
            severity="critical",
            title="Tachycardia — Critical",
            description="Heart rate exceeds 130 bpm. Possible cardiac stress, dehydration, or arrhythmia.",
            actions=[
                "Stop all physical activity immediately.",
                "Administer 500 mL oral rehydration solution if conscious.",
                "Attach ECG leads and transmit to flight surgeon.",
                "Initiate Emergency Medical Protocol EMP-03.",
                "Prepare defibrillator — standby only.",
            ],
            protocol="NASA EMP-03 / ISS Medical Checklist 4.2",
        ),
        "high_warning": Alert(
            id="HR-HW",
            metric="heart_rate",
            severity="warning",
            title="Elevated Heart Rate",
            description="Heart rate above 110 bpm. Monitor closely; may indicate physical exertion or early dehydration.",
            actions=[
                "Reduce physical activity for 10 minutes.",
                "Drink 250 mL water.",
                "Re-evaluate in 5 minutes.",
                "Notify flight surgeon if not resolving.",
            ],
            protocol="ISS Medical Checklist 4.1",
        ),
        "low_warning": Alert(
            id="HR-LW",
            metric="heart_rate",
            severity="warning",
            title="Low Heart Rate",
            description="Heart rate below 55 bpm. Could indicate vasovagal response or bradycardia.",
            actions=[
                "Lie flat and elevate legs 30°.",
                "Check blood pressure immediately.",
                "Administer atropine 0.5 mg IV if symptomatic (chest pain/dizziness).",
                "Alert flight surgeon.",
            ],
            protocol="ISS Medical Checklist 4.3",
        ),
        "low_critical": Alert(
            id="HR-LC",
            metric="heart_rate",
            severity="critical",
            title="Bradycardia — Critical",
            description="Heart rate below 45 bpm. Potential cardiac arrest risk.",
            actions=[
                "Activate emergency medical alarm.",
                "Begin cardiac monitoring on all leads.",
                "Administer atropine 1 mg IV immediately.",
                "Prepare for CPR if unresponsive.",
                "Contact MCC for emergency landing evaluation.",
            ],
            protocol="NASA EMP-01 / ISS Medical Checklist 4.4",
        ),
    },

    "spo2": {
        "low_warning": Alert(
            id="SPO2-W",
            metric="spo2",
            severity="warning",
            title="Low Blood Oxygen",
            description="SpO2 dropped below 94%. Early sign of hypoxia or equipment issue.",
            actions=[
                "Check pulse oximeter placement and re-read.",
                "Switch to supplemental O2 mask at 2 L/min.",
                "Check cabin O2 levels immediately.",
                "Reduce physical activity.",
                "Notify flight surgeon.",
            ],
            protocol="ISS Life Support Checklist LS-07",
        ),
        "low_critical": Alert(
            id="SPO2-C",
            metric="spo2",
            severity="critical",
            title="Hypoxia — Critical",
            description="SpO2 below 90%. Immediate risk of hypoxic injury. Act now.",
            actions=[
                "Don emergency O2 mask immediately — 10 L/min non-rebreather.",
                "Activate cabin emergency O2 system.",
                "Declare medical emergency to MCC.",
                "Check crew for confusion, cyanosis, or loss of consciousness.",
                "Initiate Emergency Medical Protocol EMP-06.",
            ],
            protocol="NASA EMP-06 / ISS Medical Checklist 6.1",
        ),
    },

    "respiratory_rate": {
        "high_warning": Alert(
            id="RR-HW",
            metric="respiratory_rate",
            severity="warning",
            title="Elevated Respiratory Rate",
            description="Breathing rate above 22/min. May indicate anxiety, pain, or early respiratory distress.",
            actions=[
                "Guide crew through slow breathing: 4s inhale, 6s exhale.",
                "Check for chest pain or shortness of breath.",
                "Measure SpO2 immediately.",
                "Notify flight surgeon if rate exceeds 25/min.",
            ],
            protocol="ISS Medical Checklist 5.2",
        ),
        "high_critical": Alert(
            id="RR-HC",
            metric="respiratory_rate",
            severity="critical",
            title="Respiratory Distress — Critical",
            description="Breathing rate above 28/min. Possible respiratory failure or severe distress.",
            actions=[
                "Administer supplemental O2 immediately.",
                "Check for airway obstruction.",
                "Administer bronchodilator (albuterol inhaler) if wheezing.",
                "Prepare for assisted ventilation.",
                "Declare medical emergency — contact MCC.",
            ],
            protocol="NASA EMP-05 / ISS Medical Checklist 5.4",
        ),
    },

    "systolic_bp": {
        "high_warning": Alert(
            id="SBP-HW",
            metric="systolic_bp",
            severity="warning",
            title="Elevated Blood Pressure",
            description="Systolic BP above 135 mmHg. Monitor for signs of hypertensive episode.",
            actions=[
                "Restrict physical activity for 30 minutes.",
                "Administer lisinopril 10 mg if prescribed.",
                "Reduce sodium intake.",
                "Re-check in 15 minutes.",
                "Notify flight surgeon if > 150 mmHg.",
            ],
            protocol="ISS Medical Checklist 4.7",
        ),
        "high_critical": Alert(
            id="SBP-HC",
            metric="systolic_bp",
            severity="critical",
            title="Hypertensive Crisis",
            description="Systolic BP above 155 mmHg. Risk of stroke or cardiac event.",
            actions=[
                "Immediate rest — do not exert.",
                "Administer labetalol 20 mg IV slowly.",
                "Monitor for headache, vision changes, confusion.",
                "Continuous BP monitoring every 5 minutes.",
                "Declare medical emergency — contact MCC immediately.",
            ],
            protocol="NASA EMP-08 / ISS Medical Checklist 4.8",
        ),
    },

    "body_temp": {
        "high_warning": Alert(
            id="TEMP-HW",
            metric="body_temp",
            severity="warning",
            title="Low-Grade Fever",
            description="Body temperature above 99.5°F. Possible infection or heat stress.",
            actions=[
                "Administer acetaminophen 650 mg.",
                "Increase fluid intake to 2 L/day.",
                "Monitor for infection symptoms (cough, pain, rash).",
                "Draw blood sample for WBC count.",
                "Notify flight surgeon.",
            ],
            protocol="ISS Medical Checklist 7.1",
        ),
        "high_critical": Alert(
            id="TEMP-HC",
            metric="body_temp",
            severity="critical",
            title="High Fever — Critical",
            description="Body temperature above 101°F. Risk of systemic infection or heat stroke.",
            actions=[
                "Apply cooling packs to neck, armpits, groin.",
                "Administer ibuprofen 400 mg IV if available.",
                "Start broad-spectrum antibiotic (ciprofloxacin 400 mg IV).",
                "Continuous temperature monitoring every 10 minutes.",
                "Declare medical emergency — assess evacuation options.",
            ],
            protocol="NASA EMP-07 / ISS Medical Checklist 7.3",
        ),
    },

    "cabin_co2": {
        "high_warning": Alert(
            id="CO2-W",
            metric="cabin_co2",
            severity="warning",
            title="Elevated Cabin CO₂",
            description="CO₂ above 0.7%. Crew may experience headaches and fatigue.",
            actions=[
                "Activate backup CO₂ scrubber (CDRA backup unit).",
                "Increase cabin air circulation.",
                "Check lithium hydroxide canister status.",
                "Reduce crew activity level.",
                "Notify MCC for CDRA diagnostic.",
            ],
            protocol="ISS Life Support Checklist LS-12",
        ),
        "high_critical": Alert(
            id="CO2-C",
            metric="cabin_co2",
            severity="critical",
            title="CO₂ Levels Dangerous",
            description="CO₂ above 1.0%. Immediate cognitive impairment and headache. Act now.",
            actions=[
                "All crew don emergency O2 masks immediately.",
                "Emergency-activate all CO₂ scrubbers.",
                "Open emergency LiOH canisters (3 canisters).",
                "Isolate affected module if possible.",
                "Declare emergency — contact MCC for emergency egress assessment.",
            ],
            protocol="NASA EMP-12 / ISS Life Support Checklist LS-13",
        ),
    },

    "cabin_o2": {
        "low_warning": Alert(
            id="O2-LW",
            metric="cabin_o2",
            severity="warning",
            title="Low Cabin Oxygen",
            description="Cabin O₂ below 19.5%. Risk of hypoxia if levels continue to drop.",
            actions=[
                "Activate O₂ generation system (OGS) to boost levels.",
                "Check for leaks — listen for hissing, check pressure gauges.",
                "Reduce crew metabolic load (rest).",
                "Monitor SpO2 of all crew members.",
                "Notify MCC.",
            ],
            protocol="ISS Life Support Checklist LS-04",
        ),
        "low_critical": Alert(
            id="O2-LC",
            metric="cabin_o2",
            severity="critical",
            title="Cabin Oxygen Critical",
            description="Cabin O₂ below 18.5%. Hypoxia risk imminent for all crew.",
            actions=[
                "All crew don emergency O2 masks immediately.",
                "Release O2 from high-pressure storage (open valve O2-HP-01).",
                "Seal off and isolate leaking module.",
                "Declare cabin emergency — contact MCC.",
                "Prepare Soyuz for emergency evacuation.",
            ],
            protocol="NASA EMP-11 / ISS Life Support Checklist LS-05",
        ),
    },

    "radiation_dose": {
        "high_warning": Alert(
            id="RAD-W",
            metric="radiation_dose",
            severity="warning",
            title="Elevated Radiation Dose",
            description="Radiation dose above 1 mSv/day. Check for solar particle event.",
            actions=[
                "Check space weather report from MCC.",
                "Move crew to shielded module (Service Module central post).",
                "Cancel any planned EVA.",
                "Monitor total accumulated dose.",
            ],
            protocol="NASA Radiation Control Protocol RCP-02",
        ),
        "high_critical": Alert(
            id="RAD-C",
            metric="radiation_dose",
            severity="critical",
            title="Solar Radiation Event",
            description="Radiation dose above 2 mSv/day. Solar particle event likely. Seek shelter.",
            actions=[
                "Immediately move all crew to radiation shelter (SM aft).",
                "Cancel all EVAs — do not open hatches.",
                "Take potassium iodide 130 mg if thyroid protection needed.",
                "Continuous radiation monitoring.",
                "Contact MCC — evaluate emergency re-entry.",
            ],
            protocol="NASA EMP-14 / Radiation Control Protocol RCP-04",
        ),
    },

    "hrv": {
        "low_warning": Alert(
            id="HRV-W",
            metric="hrv",
            severity="warning",
            title="High Stress Detected",
            description="Heart Rate Variability below 30 ms indicates elevated autonomic stress.",
            actions=[
                "Schedule 20-minute rest period.",
                "Guide crew through 4-7-8 breathing exercise.",
                "Review sleep schedule — ensure 7+ hours.",
                "Reduce workload for next 4 hours.",
                "Notify flight surgeon if persists > 2 hours.",
            ],
            protocol="ISS Crew Health Checklist CH-09",
        ),
        "low_critical": Alert(
            id="HRV-C",
            metric="hrv",
            severity="critical",
            title="Critical Stress — Autonomic Dysregulation",
            description="HRV below 20 ms. Severe physiological stress or cardiac autonomic dysfunction.",
            actions=[
                "Immediate mandatory rest — suspend all tasks.",
                "Full cardiac evaluation (ECG, BP, SpO2).",
                "Administer anxiolytic if approved by flight surgeon.",
                "Notify MCC and flight surgeon immediately.",
                "Consider 24-hour medical observation.",
            ],
            protocol="NASA EMP-09 / ISS Crew Health Checklist CH-10",
        ),
    },

    "sleep_hours": {
        "low_warning": Alert(
            id="SLP-W",
            metric="sleep_hours",
            severity="warning",
            title="Insufficient Sleep",
            description="Less than 6 hours sleep recorded. Cognitive performance may be impaired.",
            actions=[
                "Schedule mandatory 8-hour sleep period next cycle.",
                "Restrict non-essential tasks.",
                "Consider melatonin 0.5 mg 30 min before sleep.",
                "Avoid caffeine after 14:00 UTC.",
                "Notify flight surgeon if pattern continues 3+ days.",
            ],
            protocol="ISS Crew Health Checklist CH-14",
        ),
        "low_critical": Alert(
            id="SLP-C",
            metric="sleep_hours",
            severity="critical",
            title="Severe Sleep Deprivation",
            description="Less than 5 hours sleep. High risk of cognitive failure and mission error.",
            actions=[
                "Mandatory sleep — reassign critical tasks to other crew.",
                "Administer zolpidem 5 mg if unable to sleep naturally.",
                "Do not perform EVA or critical operations in next 12 hours.",
                "Notify MCC for task reallocation.",
                "Flight surgeon consultation required.",
            ],
            protocol="NASA Crew Health Protocol CHP-06",
        ),
    },
}


def evaluate_metrics(metrics: dict, timestamp: str) -> List[Alert]:
    """
    Compare a metrics snapshot against thresholds.
    Returns a list of triggered alerts with populated value/unit/timestamp.
    """
    alerts: List[Alert] = []

    for metric, data in metrics.items():
        value = data["value"]
        unit  = data["unit"]
        thresholds = THRESHOLDS.get(metric)
        if not thresholds:
            continue

        alert = _pick_alert(metric, value, thresholds)
        if alert:
            import copy
            a = copy.copy(alert)
            a.value     = value
            a.unit      = unit
            a.timestamp = timestamp
            alerts.append(a)

    return alerts


def _pick_alert(metric: str, value: float, thresholds: dict):
    """Pick the most severe applicable alert for a metric value."""
    remediation = REMEDIATION.get(metric, {})

    crit_lo, crit_hi = thresholds["critical"]
    warn_lo, warn_hi = thresholds["warning"]

    # Check critical first
    if crit_hi is not None and value > crit_hi:
        return remediation.get("high_critical")
    if crit_lo is not None and value < crit_lo:
        return remediation.get("low_critical")

    # Then warning
    if warn_hi is not None and value > warn_hi:
        return remediation.get("high_warning")
    if warn_lo is not None and value < warn_lo:
        return remediation.get("low_warning")

    return None
