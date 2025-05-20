
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import Station3D from './Station3D';
import TrackSegment3D from './TrackSegment3D';
import TrainAnimation from './TrainAnimation'; // Import the new component
import { HO_CHI_MINH_METRO_LINE_1_STATIONS as STATIONS, STATION_DISTANCE } from '@/data/metroStationsData';
import { Button } from '@/components/ui/button';

// SEGMENT_DURATION and UPDATE_INTERVAL are now managed within TrainAnimation or not needed globally here
// const SEGMENT_DURATION = 5000; 
// const UPDATE_INTERVAL = 50;

const MetroMap3D: React.FC = () => {
  const [trainPositionVec, setTrainPositionVec] = useState(new THREE.Vector3(...STATIONS[0].position));
  const [isRunning, setIsRunning] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [segmentStartTime, setSegmentStartTime] = useState(0);
  const [status, setStatus] = useState(`Tàu đang ở Ga ${STATIONS[0].name}`);

  const trainRef = useRef<THREE.Mesh>(null!);

  const handleStart = () => {
    if (isRunning || currentSegmentIndex >= STATIONS.length - 1) return;
    setIsRunning(true);
    setSegmentStartTime(Date.now());
    setStatus(`Đang di chuyển tới Ga ${STATIONS[currentSegmentIndex + 1].name}`);
  };

  // useFrame logic is now moved to TrainAnimation component

  const lineLength = STATIONS.length * STATION_DISTANCE;
  const cameraPosition: [number, number, number] = [lineLength / 2, lineLength / 4, lineLength / 2.5];

  return (
    <div className="flex flex-col items-center p-4 md:p-8 space-y-4 bg-gray-800 shadow-lg rounded-lg w-full h-[600px]">
      <h2 className="text-xl md:text-2xl font-semibold text-white">Bản đồ Metro 3D - Tuyến 1 TP.HCM</h2>
      <div className="w-full h-[calc(100%-120px)] rounded border border-gray-700">
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
            
            {/* Train rendering and animation logic is now handled by TrainAnimation */}
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
            />

            <OrbitControls 
              enableZoom={true} 
              enablePan={true} 
              target={[lineLength/2 - STATION_DISTANCE, 0, 0]}
            />
          </Suspense>
        </Canvas>
      </div>
      <div className="flex flex-col items-center space-y-2 text-white">
        <Button 
          onClick={handleStart} 
          disabled={isRunning || currentSegmentIndex >= STATIONS.length - 1}
          variant="secondary"
        >
          {currentSegmentIndex >= STATIONS.length - 1 ? "Đã đến đích" : "Bắt đầu di chuyển"}
        </Button>
        <p className="text-md p-2 bg-gray-700 rounded min-w-[280px] text-center shadow">
          {status}
        </p>
      </div>
    </div>
  );
};

export default MetroMap3D;
