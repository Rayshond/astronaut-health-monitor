/**
 * CLI wrapper for the anomaly detection engine.
 * Reads JSON from stdin, writes JSON results to stdout.
 * 
 * Input format:
 *   {"metrics": {"heart_rate": {"value": 145, "unit": "bpm"}, ...}}
 * 
 * Output format:
 *   {"results": [{"metric": "heart_rate", "severity": "critical", ...}]}
 */

#include "anomaly.h"
#include <iostream>
#include <string>
#include <sstream>

// Minimal JSON parser — avoids external dependencies
// Parses the specific input format we produce from Python

std::string extractStringValue(const std::string& json, const std::string& key) {
    std::string search = "\"" + key + "\"";
    size_t pos = json.find(search);
    if (pos == std::string::npos) return "";
    pos = json.find(":", pos + search.size());
    if (pos == std::string::npos) return "";
    size_t start = json.find("\"", pos + 1);
    if (start == std::string::npos) return "";
    size_t end = json.find("\"", start + 1);
    if (end == std::string::npos) return "";
    return json.substr(start + 1, end - start - 1);
}

double extractNumberValue(const std::string& json, const std::string& key) {
    std::string search = "\"" + key + "\"";
    size_t pos = json.find(search);
    if (pos == std::string::npos) return 0.0;
    pos = json.find(":", pos + search.size());
    if (pos == std::string::npos) return 0.0;
    size_t start = pos + 1;
    while (start < json.size() && (json[start] == ' ' || json[start] == '\t')) start++;
    size_t end = start;
    while (end < json.size() && (std::isdigit(json[end]) || json[end] == '.' || json[end] == '-')) end++;
    if (start == end) return 0.0;
    return std::stod(json.substr(start, end - start));
}

// Parse metrics block — find each known metric and its value
std::vector<MetricReading> parseMetrics(const std::string& json) {
    std::vector<MetricReading> readings;
    const std::vector<std::string> known_metrics = {
        "heart_rate", "spo2", "respiratory_rate", "systolic_bp", "diastolic_bp",
        "body_temp", "cabin_co2", "cabin_o2", "radiation_dose", "sleep_hours", "hrv"
    };

    for (const auto& metric : known_metrics) {
        // Find the metric block: "heart_rate": { "value": X, ... }
        std::string search = "\"" + metric + "\"";
        size_t pos = json.find(search);
        if (pos == std::string::npos) continue;

        // Find the opening brace of this metric's object
        size_t brace = json.find("{", pos + search.size());
        if (brace == std::string::npos) continue;

        // Find the closing brace
        size_t close = json.find("}", brace);
        if (close == std::string::npos) continue;

        std::string block = json.substr(brace, close - brace + 1);
        double value = extractNumberValue(block, "value");

        readings.push_back({metric, value});
    }

    return readings;
}

std::string toJson(const std::vector<AnomalyResult>& results) {
    std::ostringstream oss;
    oss << "{\"results\":[";
    for (size_t i = 0; i < results.size(); i++) {
        const auto& r = results[i];
        if (i > 0) oss << ",";
        oss << "{"
            << "\"metric\":\"" << r.metric << "\","
            << "\"severity\":\"" << r.severity << "\","
            << "\"value\":" << r.value << ","
            << "\"z_score\":" << r.z_score << ","
            << "\"direction\":\"" << r.direction << "\""
            << "}";
    }
    oss << "]}";
    return oss.str();
}

int main() {
    std::string input, line;
    while (std::getline(std::cin, line)) {
        input += line;
    }

    std::vector<MetricReading> readings = parseMetrics(input);

    AnomalyDetector detector;
    std::vector<AnomalyResult> results = detector.analyze(readings);

    std::cout << toJson(results) << std::endl;
    return 0;
}
