
import React from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Train3D from './Train3D';
import { HO_CHI_MINH_METRO_LINE_1_STATIONS as STATIONS, STATION_DISTANCE } from '@/data/metroStationsData'; // Assuming STATION_DISTANCE is needed, if not, remove

const SEGMENT_DURATION = 5000; // 5 seconds per segment

interface TrainAnimationProps {
  isRunning: boolean;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
  currentSegmentIndex: number;
  setCurrentSegmentIndex: React.Dispatch<React.SetStateAction<number>>;
  segmentStartTime: number;
  setSegmentStartTime: React.Dispatch<React.SetStateAction<number>>;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  trainRef: React.RefObject<THREE.Mesh>;
  trainPositionVec: THREE.Vector3;
  setTrainPositionVec: React.Dispatch<React.SetStateAction<THREE.Vector3>>;
}

const TrainAnimation: React.FC<TrainAnimationProps> = ({
  isRunning,
  setIsRunning,
  currentSegmentIndex,
  setCurrentSegmentIndex,
  segmentStartTime,
  setSegmentStartTime,
  setStatus,
  trainRef,
  trainPositionVec,
  setTrainPositionVec,
}) => {

  useFrame(() => {
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
      if (trainRef.current) {
        trainRef.current.position.copy(toVec);
      }

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

  return <Train3D ref={trainRef} position={trainPositionVec} />;
};

export default TrainAnimation;
