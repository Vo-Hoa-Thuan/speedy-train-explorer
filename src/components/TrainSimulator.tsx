
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Circle } from 'lucide-react'; // Thay TrainFront bằng Circle

const STATIONS = [
  { name: 'A', position: 0, color: 'bg-red-500' },
  { name: 'B', position: 200, color: 'bg-yellow-500' },
  { name: 'C', position: 400, color: 'bg-green-500' },
];
const SEGMENT_DURATION = 5000; // 5 giây (ms)
const UPDATE_INTERVAL = 100;  // 100 ms
const TRACK_OFFSET_X = 25; // px, padding bên trái cho đường ray
const MOVING_DOT_SIZE = 20; // px, kích thước chấm xanh di chuyển
const STATION_DOT_SIZE_CLASS = "w-3 h-3"; // Tailwind class for 12px

const TrainSimulator: React.FC = () => {
  const [trainPosition, setTrainPosition] = useState(STATIONS[0].position);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStationIndex, setCurrentStationIndex] = useState(0); // Index của ga tàu vừa rời đi hoặc đang ở
  const [segmentStartTime, setSegmentStartTime] = useState(0);
  const [status, setStatus] = useState(`Tàu đang ở Ga ${STATIONS[0].name}`);

  const handleStart = useCallback(() => {
    if (isRunning || currentStationIndex >= STATIONS.length - 1) {
      // Đã chạy hoặc đã đến ga cuối
      return;
    }
    setIsRunning(true);
    setSegmentStartTime(Date.now());
    setStatus(`Đang di chuyển tới Ga ${STATIONS[currentStationIndex + 1].name}`);
  }, [isRunning, currentStationIndex]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const intervalId = setInterval(() => {
      const now = Date.now();
      const elapsedTime = now - segmentStartTime;
      
      const fromStation = STATIONS[currentStationIndex];
      const toStation = STATIONS[currentStationIndex + 1];

      if (!toStation) {
        setIsRunning(false); 
        return;
      }

      if (elapsedTime >= SEGMENT_DURATION) {
        setTrainPosition(toStation.position);
        const nextStationIndex = currentStationIndex + 1;
        setCurrentStationIndex(nextStationIndex);
        setStatus(`Tàu đang ở Ga ${toStation.name}`);

        if (nextStationIndex >= STATIONS.length - 1) {
          setIsRunning(false);
          setStatus(`Tàu đã đến Ga ${toStation.name}`);
        } else {
          setSegmentStartTime(Date.now()); 
          setStatus(`Đang di chuyển tới Ga ${STATIONS[nextStationIndex + 1].name}`);
        }
      } else {
        const progress = elapsedTime / SEGMENT_DURATION;
        const newPosition = fromStation.position + progress * (toStation.position - fromStation.position);
        setTrainPosition(newPosition);
      }
    }, UPDATE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isRunning, segmentStartTime, currentStationIndex]);

  return (
    <div className="flex flex-col items-center p-4 md:p-8 space-y-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-700">Mô phỏng tàu chạy</h2>

      {/* Đường ray và các ga */}
      <div className="relative w-[450px] h-16 bg-gray-200 rounded flex items-center px-[calc(TRACK_OFFSET_X-STATION_DOT_SIZE_CLASS_WIDTH/2)]"> {/* Note: STATION_DOT_SIZE_CLASS_WIDTH is not defined, assuming it's for centering logic */}
        {/* Đường ray */}
        <div 
          className="absolute top-1/2 w-[400px] h-1 bg-gray-400 transform -translate-y-1/2"
          style={{ left: `${TRACK_OFFSET_X}px`}}
        />
        
        {STATIONS.map((station) => (
          <div
            key={station.name}
            className={`absolute top-1/2 ${STATION_DOT_SIZE_CLASS} rounded-full ${station.color} transform -translate-x-1/2 -translate-y-1/2 shadow-md`}
            style={{ left: `${station.position + TRACK_OFFSET_X}px` }}
          >
            <span className="absolute -top-6 text-xs md:text-sm font-medium text-gray-600 whitespace-nowrap">{`Ga ${station.name}`}</span>
          </div>
        ))}

        {/* Tàu (chấm xanh) */}
        <div
          className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 transition-all duration-100 ease-linear"
          style={{ left: `${trainPosition + TRACK_OFFSET_X}px` }}
        >
          <Circle size={MOVING_DOT_SIZE} fill="#1EAEDB" color="#1EAEDB" strokeWidth={0} />
        </div>
      </div>

      {/* Điều khiển và trạng thái */}
      <div className="flex flex-col items-center space-y-4">
        <Button 
          onClick={handleStart} 
          disabled={isRunning || currentStationIndex >= STATIONS.length - 1}
          className="px-6 py-2 text-base"
        >
          {currentStationIndex >= STATIONS.length - 1 ? "Đã đến đích" : "Bắt đầu"}
        </Button>
        <p className="text-md md:text-lg font-medium p-3 bg-gray-100 rounded min-w-[280px] text-center text-gray-700 shadow">
          {status}
        </p>
      </div>
    </div>
  );
};

export default TrainSimulator;
