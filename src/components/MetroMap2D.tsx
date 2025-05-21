
import React, { useState, useEffect, useRef } from 'react';
import { HO_CHI_MINH_METRO_LINE_1_STATIONS as STATIONS, STATION_DISTANCE } from '@/data/metroStationsData';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Map, Route, Play, RotateCcw, TrainFront } from 'lucide-react';
import { useTrainMovementLogic } from '@/hooks/useTrainMovementLogic';

// Constants for 2D rendering
const TRACK_HEIGHT = 80; // Total height for the track area
const STATION_MARKER_SIZE = 12; // Size of the station dot
const TRAIN_MARKER_SIZE = 24; // Increased size of the train dot for better visibility
const PX_PER_MODEL_UNIT = 10; // Pixels per unit from station data positions

const MetroMap2D: React.FC = () => {
  const [trainXPosition, setTrainXPosition] = useState(STATIONS[0].position[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0); // Represents the station the train is AT or has just LEFT
  const [segmentStartTime, setSegmentStartTime] = useState(0);
  const [status, setStatus] = useState(`Tàu đang ở Ga ${STATIONS[0].name}`);
  const [selectedFromStation, setSelectedFromStation] = useState<number | undefined>(undefined);
  const [selectedToStation, setSelectedToStation] = useState<number | undefined>(undefined);

  useTrainMovementLogic({
    isRunning, setIsRunning,
    currentSegmentIndex, setCurrentSegmentIndex,
    segmentStartTime, setSegmentStartTime,
    setStatus,
    setTrainXPosition,
    selectedFromStation, selectedToStation,
    stations: STATIONS,
  });
  
  const handleStart = () => {
    if (isRunning) return;

    let actualStartSegmentIndex = currentSegmentIndex;
    let initialStatus = "";

    if (selectedFromStation !== undefined && selectedToStation !== undefined) {
      if (selectedFromStation === selectedToStation) {
        setStatus("Vui lòng chọn hai ga khác nhau");
        return;
      }
      if (selectedFromStation > selectedToStation) {
        setStatus("Ga xuất phát phải trước ga đến");
        return;
      }
      actualStartSegmentIndex = selectedFromStation;
      setCurrentSegmentIndex(selectedFromStation); // Set current segment to the selected start
      setTrainXPosition(STATIONS[selectedFromStation].position[0]); // Move train to start station
      initialStatus = `Đang di chuyển từ Ga ${STATIONS[selectedFromStation].name}`;
      if (STATIONS[selectedFromStation + 1]) {
        initialStatus += ` tới Ga ${STATIONS[selectedFromStation+1].name}`;
      }
    } else { // Normal start or resume
      if (currentSegmentIndex >= STATIONS.length - 1) { // At the end, reset to loop
        actualStartSegmentIndex = 0;
        setCurrentSegmentIndex(0);
        setTrainXPosition(STATIONS[0].position[0]);
        initialStatus = `Bắt đầu vòng mới. Đang di chuyển tới Ga ${STATIONS[1] ? STATIONS[1].name : STATIONS[0].name}`;
      } else {
         actualStartSegmentIndex = currentSegmentIndex;
         initialStatus = `Đang di chuyển tới Ga ${STATIONS[currentSegmentIndex + 1] ? STATIONS[currentSegmentIndex + 1].name : STATIONS[currentSegmentIndex].name }`;
      }
    }
    
    setSegmentStartTime(Date.now());
    setIsRunning(true);
    setStatus(initialStatus);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSelectedFromStation(undefined);
    setSelectedToStation(undefined);
    
    setCurrentSegmentIndex(0);
    setTrainXPosition(STATIONS[0].position[0]);
    setStatus(`Tàu đang ở Ga ${STATIONS[0].name}`);
    setSegmentStartTime(0); // Reset segment start time
  };

  // Calculate total width for the map based on station positions
  const minX = Math.min(...STATIONS.map(s => s.position[0]));
  const maxX = Math.max(...STATIONS.map(s => s.position[0]));
  const mapContentWidth = (maxX - minX) * PX_PER_MODEL_UNIT + (2 * STATION_MARKER_SIZE) + 100; // Add padding

  return (
    <div className="flex flex-col items-center p-4 md:p-8 space-y-4 bg-gray-800 shadow-lg rounded-lg w-full text-white">
      <h2 className="text-xl md:text-2xl font-semibold">Bản đồ Metro 2D - Tuyến 1 TP.HCM</h2>
      
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleStart} 
            disabled={isRunning}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Play size={16} />
            {selectedFromStation !== undefined && selectedToStation !== undefined 
              ? `Di chuyển` // Simpler text
              : "Bắt đầu"}
          </Button>
          
          <Button onClick={handleReset} variant="outline" className="flex items-center gap-2">
            <RotateCcw size={16} />
            Đặt lại
          </Button>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Route size={16} />
              <span>Chọn ga</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="text-gray-900 dark:text-white"> {/* Ensure text is visible in dark/light mode */}
            <SheetHeader>
              <SheetTitle>Chọn ga xuất phát và ga đến</SheetTitle>
              <SheetDescription>
                Chọn ga để mô phỏng di chuyển giữa hai ga.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ga xuất phát</label>
                <Select
                  value={selectedFromStation !== undefined ? selectedFromStation.toString() : ''}
                  onValueChange={(value) => {
                    const stationIdx = Number(value);
                    setSelectedFromStation(stationIdx);
                    // When "from" station is selected, reset train to that station
                    if (STATIONS[stationIdx]) {
                      setCurrentSegmentIndex(stationIdx);
                      setTrainXPosition(STATIONS[stationIdx].position[0]);
                      setStatus(`Sẵn sàng di chuyển từ Ga ${STATIONS[stationIdx].name}`);
                      setIsRunning(false);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ga xuất phát" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATIONS.map((station, index) => (
                      <SelectItem key={station.id} value={index.toString()}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Ga đến</label>
                <Select
                  value={selectedToStation !== undefined ? selectedToStation.toString() : ''}
                  onValueChange={(value) => setSelectedToStation(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ga đến" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATIONS.map((station, index) => (
                      <SelectItem key={station.id} value={index.toString()}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* 2D Map Area */}
      <div className="w-full h-[200px] bg-gray-700 rounded border border-gray-600 overflow-x-auto p-4">
        <div 
          className="relative h-full" 
          style={{ width: `${mapContentWidth}px`}}
        >
          {/* Track */}
          <div 
            className="absolute bg-gray-500"
            style={{
              left: `${(STATIONS[0].position[0] - minX) * PX_PER_MODEL_UNIT + STATION_MARKER_SIZE / 2}px`,
              right: `${(maxX - STATIONS[STATIONS.length - 1].position[0]) * PX_PER_MODEL_UNIT + STATION_MARKER_SIZE / 2}px`,
              width: `${(STATIONS[STATIONS.length-1].position[0] - STATIONS[0].position[0]) * PX_PER_MODEL_UNIT}px`,
              height: '4px',
              top: `${TRACK_HEIGHT / 2 - 2}px`,
            }}
          />

          {/* Stations */}
          {STATIONS.map((station) => (
            <div key={station.id} className="absolute"
              style={{
                left: `${(station.position[0] - minX) * PX_PER_MODEL_UNIT}px`,
                top: `${TRACK_HEIGHT / 2 - STATION_MARKER_SIZE / 2}px`,
              }}
            >
              <div 
                className="rounded-full"
                style={{
                  width: `${STATION_MARKER_SIZE}px`,
                  height: `${STATION_MARKER_SIZE}px`,
                  backgroundColor: station.color,
                  border: '2px solid white'
                }}
              />
              <div className="text-xs text-center whitespace-nowrap mt-1 absolute -translate-x-1/2 left-1/2" style={{ top: `${STATION_MARKER_SIZE}px`}}>
                {station.name}
              </div>
            </div>
          ))}

          {/* Train with Train Icon */}
          <div 
            className="absolute transition-all duration-100 ease-linear flex flex-col items-center justify-center"
            style={{
              left: `${(trainXPosition - minX) * PX_PER_MODEL_UNIT + STATION_MARKER_SIZE / 2 - TRAIN_MARKER_SIZE / 2}px`,
              top: `${TRACK_HEIGHT / 2 - TRAIN_MARKER_SIZE / 2 - 4}px`, // Adjusted to be more centered
              zIndex: 10,
            }}
            title="Tàu Metro"
          >
            {/* Train Icon */}
            <div className="bg-[#1EAEDB] p-1 rounded-md border-2 border-white shadow-lg">
              <TrainFront size={TRAIN_MARKER_SIZE} color="white" />
            </div>
            {/* Small train label */}
            <div className="text-xs font-bold text-white bg-blue-600 px-1 rounded mt-1">Tàu</div>
          </div>
        </div>
      </div>

      <p className="text-md p-2 bg-gray-700 rounded min-w-[280px] text-center shadow w-full md:w-auto">
        {status}
      </p>
    </div>
  );
};

export default MetroMap2D;
