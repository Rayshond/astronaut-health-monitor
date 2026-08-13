#include "anomaly.h"
#include <cmath>
#include <limits>

static const double INF = std::numeric_limits<double>::infinity();

AnomalyDetector::AnomalyDetector() {
    // Baselines: {mean, std_dev} — sourced from NASA/ESA astronaut health data
    baselines_ = {
        {"heart_rate",       {70.0,  8.0}},
        {"spo2",             {98.5,  0.5}},
        {"respiratory_rate", {15.0,  2.0}},
        {"systolic_bp",      {115.0, 8.0}},
        {"diastolic_bp",     {75.0,  5.0}},
        {"body_temp",        {98.2,  0.3}},
        {"cabin_co2",        {0.28,  0.04}},
        {"cabin_o2",         {21.0,  0.3}},
        {"radiation_dose",   {0.3,   0.08}},
        {"sleep_hours",      {7.5,   0.6}},
        {"hrv",              {55.0,  10.0}},
    };

    // Critical bounds: values outside these are CRITICAL alerts
    critical_bounds_ = {
        {"heart_rate",       {45.0,  130.0}},
        {"spo2",             {90.0,  INF}},
        {"respiratory_rate", {8.0,   28.0}},
        {"systolic_bp",      {80.0,  155.0}},
        {"diastolic_bp",     {50.0,  95.0}},
        {"body_temp",        {96.0,  101.0}},
        {"cabin_co2",        {-INF,  1.0}},
        {"cabin_o2",         {18.5,  24.5}},
        {"radiation_dose",   {-INF,  2.0}},
        {"sleep_hours",      {5.0,   INF}},
        {"hrv",              {20.0,  INF}},
    };

    // Warning bounds
    warning_bounds_ = {
        {"heart_rate",       {55.0,  110.0}},
        {"spo2",             {94.0,  INF}},
        {"respiratory_rate", {10.0,  22.0}},
        {"systolic_bp",      {90.0,  135.0}},
        {"diastolic_bp",     {55.0,  88.0}},
        {"body_temp",        {97.0,  99.5}},
        {"cabin_co2",        {-INF,  0.7}},
        {"cabin_o2",         {19.5,  23.5}},
        {"radiation_dose",   {-INF,  1.0}},
        {"sleep_hours",      {6.0,   INF}},
        {"hrv",              {30.0,  INF}},
    };
}

AnomalyResult AnomalyDetector::evaluateMetric(const MetricReading& reading) {
    AnomalyResult result;
    result.metric    = reading.name;
    result.value     = reading.value;
    result.severity  = "normal";
    result.direction = "normal";
    result.z_score   = 0.0;

    auto bIt = baselines_.find(reading.name);
    if (bIt == baselines_.end()) return result;

    const Baseline& b = bIt->second;
    double z = (reading.value - b.mean) / b.std_dev;
    result.z_score = z;
    result.direction = (z >= 0) ? "high" : "low";

    // Check critical bounds first
    auto cIt = critical_bounds_.find(reading.name);
    if (cIt != critical_bounds_.end()) {
        double lo = cIt->second.first;
        double hi = cIt->second.second;
        if (reading.value < lo || reading.value > hi) {
            result.severity = "critical";
            return result;
        }
    }

    // Check warning bounds
    auto wIt = warning_bounds_.find(reading.name);
    if (wIt != warning_bounds_.end()) {
        double lo = wIt->second.first;
        double hi = wIt->second.second;
        if (reading.value < lo || reading.value > hi) {
            result.severity = "warning";
            return result;
        }
    }

    return result;
}

std::vector<AnomalyResult> AnomalyDetector::analyze(const std::vector<MetricReading>& readings) {
    std::vector<AnomalyResult> results;
    for (const auto& r : readings) {
        results.push_back(evaluateMetric(r));
    }
    return results;
}
