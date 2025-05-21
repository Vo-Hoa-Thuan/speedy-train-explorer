
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import Station3D from './Station3D';
import TrackSegment3D from './TrackSegment3D';
import TrainAnimation from './TrainAnimation';
import { HO_CHI_MINH_METRO_LINE_1_STATIONS as STATIONS, STATION_DISTANCE } from '@/data/metroStationsData';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Map, Route } from 'lucide-react';

const MetroMap3D: React.FC = () => {
  const [trainPositionVec, setTrainPositionVec] = useState(new THREE.Vector3(...STATIONS[0].position));
  const [isRunning, setIsRunning] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [segmentStartTime, setSegmentStartTime] = useState(0);
  const [status, setStatus] = useState(`Tàu đang ở Ga ${STATIONS[0].name}`);
  const [selectedFromStation, setSelectedFromStation] = useState<number | undefined>(undefined);
  const [selectedToStation, setSelectedToStation] = useState<number | undefined>(undefined);

  const trainRef = useRef<THREE.Mesh>(null!);

  const handleStart = () => {
    if (isRunning) return;
    
    // If both stations are selected, start from the fromStation
    if (selectedFromStation !== undefined && selectedToStation !== undefined) {
      if (selectedFromStation === selectedToStation) {
        setStatus("Vui lòng chọn hai ga khác nhau");
        return;
      }
      
      // Ensure stations are in the correct order
      if (selectedFromStation > selectedToStation) {
        setStatus("Ga xuất phát phải trước ga đến");
        return;
      }
      
      setCurrentSegmentIndex(selectedFromStation);
      setSegmentStartTime(Date.now());
      setIsRunning(true);
      setStatus(`Đang di chuyển từ Ga ${STATIONS[selectedFromStation].name} tới Ga ${STATIONS[selectedFromStation + 1].name}`);
    } else if (currentSegmentIndex >= STATIONS.length - 1) {
      // Reset to beginning if at end of line
      const firstStationPos = new THREE.Vector3(...STATIONS[0].position);
      setCurrentSegmentIndex(0);
      setTrainPositionVec(firstStationPos);
      if (trainRef.current) {
        trainRef.current.position.copy(firstStationPos);
      }
      setSegmentStartTime(Date.now());
      setIsRunning(true);
      setStatus(`Đang di chuyển tới Ga ${STATIONS[1].name}`);
    } else {
      // Regular start without station selection
      setSegmentStartTime(Date.now());
      setIsRunning(true);
      setStatus(`Đang di chuyển tới Ga ${STATIONS[currentSegmentIndex + 1].name}`);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setSelectedFromStation(undefined);
    setSelectedToStation(undefined);
    
    // Reset train to first station
    const firstStationPos = new THREE.Vector3(...STATIONS[0].position);
    setCurrentSegmentIndex(0);
    setTrainPositionVec(firstStationPos);
    if (trainRef.current) {
      trainRef.current.position.copy(firstStationPos);
    }
    setStatus(`Tàu đang ở Ga ${STATIONS[0].name}`);
  };

  const lineLength = STATIONS.length * STATION_DISTANCE;
  const cameraPosition: [number, number, number] = [lineLength / 2, lineLength / 4, lineLength / 2.5];

  return (
    <div className="flex flex-col items-center p-4 md:p-8 space-y-4 bg-gray-800 shadow-lg rounded-lg w-full h-[600px]">
      <h2 className="text-xl md:text-2xl font-semibold text-white">Bản đồ Metro 3D - Tuyến 1 TP.HCM</h2>
      
      <div className="w-full flex justify-end">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Route size={16} />
              <span>Chọn ga</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Chọn ga xuất phát và ga đến</SheetTitle>
              <SheetDescription>
                Chọn ga xuất phát và ga đến để xem mô phỏng di chuyển giữa hai ga
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ga xuất phát</label>
                <Select
                  value={selectedFromStation !== undefined ? selectedFromStation.toString() : ''}
                  onValueChange={(value) => setSelectedFromStation(Number(value))}
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
            <div className="mt-6">
              <Button onClick={handleReset} variant="secondary" className="w-full">Đặt lại</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="w-full h-[calc(100%-180px)] rounded border border-gray-700">
        <Canvas camera={{ position: cameraPosition, fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
            <Environment preset="city" />

            {STATIONS.map((station) => (
              <Station3D key={station.id} station={station} />
            ))}

            {STATIONS.slice(0, -1).map((station, index) => (
              <TrackSegment3D
                key={`track-${station.id}`}
                startPosition={station.position}
                endPosition={STATIONS[index + 1].position}
              />
            ))}
            
            <TrainAnimation
              isRunning={isRunning}
              setIsRunning={setIsRunning}
              currentSegmentIndex={currentSegmentIndex}
              setCurrentSegmentIndex={setCurrentSegmentIndex}
              segmentStartTime={segmentStartTime}
              setSegmentStartTime={setSegmentStartTime}
              setStatus={setStatus}
              trainRef={trainRef}
              trainPositionVec={trainPositionVec}
              setTrainPositionVec={setTrainPositionVec}
              selectedFromStation={selectedFromStation}
              selectedToStation={selectedToStation}
            />

            <OrbitControls 
              enableZoom={true} 
              enablePan={true} 
              target={[lineLength/2 - STATION_DISTANCE, 0, 0]}
            />
          </Suspense>
        </Canvas>
      </div>
      <div className="flex flex-col items-center space-y-2 text-white w-full">
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleStart} 
            disabled={isRunning}
            variant="secondary"
          >
            {selectedFromStation !== undefined && selectedToStation !== undefined 
              ? `Di chuyển từ ${STATIONS[selectedFromStation].name} đến ${STATIONS[selectedToStation].name}`
              : "Bắt đầu di chuyển"}
          </Button>
          
          <Button onClick={handleReset} variant="outline">
            Đặt lại
          </Button>
        </div>
        <p className="text-md p-2 bg-gray-700 rounded min-w-[280px] text-center shadow w-full md:w-auto">
          {status}
        </p>
      </div>
    </div>
  );
};

export default MetroMap3D;
