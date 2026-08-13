#pragma once
#include <string>
#include <vector>
#include <map>

struct MetricReading {
    std::string name;
    double      value;
};

struct AnomalyResult {
    std::string metric;
    std::string severity;   // "critical" | "warning" | "normal"
    double      value;
    double      z_score;    // how many std devs from mean
    std::string direction;  // "high" | "low"
};

// Baseline statistics per metric (mean, std_dev)
struct Baseline {
    double mean;
    double std_dev;
};

class AnomalyDetector {
public:
    AnomalyDetector();
    std::vector<AnomalyResult> analyze(const std::vector<MetricReading>& readings);

private:
    std::map<std::string, Baseline> baselines_;
    std::map<std::string, std::pair<double,double>> critical_bounds_;  // (lo, hi)
    std::map<std::string, std::pair<double,double>> warning_bounds_;

    AnomalyResult evaluateMetric(const MetricReading& reading);
};
