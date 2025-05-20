
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import Station3D from './Station3D';
import TrackSegment3D from './TrackSegment3D';
import Train3D from './Train3D';
import { HO_CHI_MINH_METRO_LINE_1_STATIONS as STATIONS, STATION_DISTANCE } from '@/data/metroStationsData';
import { Button } from '@/components/ui/button';

const SEGMENT_DURATION = 5000; // 5 seconds per segment
const UPDATE_INTERVAL = 50; // ms for useFrame updates

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

  useFrame((_state, delta) => {
    if (!isRunning || currentSegmentIndex >= STATIONS.length - 1) {
      return;
    }

    const now = Date.now();
    const elapsedTime = now - segmentStartTime;
    const fromStation = STATIONS[currentSegmentIndex];
    const toStation = STATIONS[currentSegmentIndex + 1];

    if (!fromStation || !toStation) {
        setIsRunning(false);
        return;
    }
    
    const fromVec = new THREE.Vector3(...fromStation.position);
    const toVec = new THREE.Vector3(...toStation.position);

    if (elapsedTime >= SEGMENT_DURATION) {
      setTrainPositionVec(toVec.clone());
      trainRef.current.position.copy(toVec);

      const nextSegmentIndex = currentSegmentIndex + 1;
      setCurrentSegmentIndex(nextSegmentIndex);
      setStatus(`Tàu đang ở Ga ${toStation.name}`);

      if (nextSegmentIndex >= STATIONS.length - 1) {
        setIsRunning(false);
        setStatus(`Tàu đã đến Ga ${toStation.name}`);
      } else {
        setSegmentStartTime(Date.now());
        setStatus(`Đang di chuyển tới Ga ${STATIONS[nextSegmentIndex + 1].name}`);
      }
    } else {
      const progress = elapsedTime / SEGMENT_DURATION;
      const newPos = new THREE.Vector3().lerpVectors(fromVec, toVec, progress);
      setTrainPositionVec(newPos.clone());
      if (trainRef.current) {
        trainRef.current.position.copy(newPos);
      }
    }
  });

  // Adjust initial camera position to view the whole line
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
            
            <mesh ref={trainRef} position={trainPositionVec}>
                <boxGeometry args={[0.8, 0.4, 0.4]} /> {/* Duplicated for ref access */}
                <meshStandardMaterial color="#1EAEDB" />
            </mesh>

            <OrbitControls 
              enableZoom={true} 
              enablePan={true} 
              target={[lineLength/2 - STATION_DISTANCE, 0, 0]} // Target center of the line
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

