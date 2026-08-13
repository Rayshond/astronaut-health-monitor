CXX      = g++
CXXFLAGS = -std=c++17 -O2 -Wall
TARGET   = anomaly_detector
SRCS     = main.cpp anomaly.cpp

$(TARGET): $(SRCS) anomaly.h
	$(CXX) $(CXXFLAGS) -o $(TARGET) $(SRCS)

clean:
	rm -f $(TARGET)

.PHONY: clean
