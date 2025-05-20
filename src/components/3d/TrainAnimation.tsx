
import React from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Train3D from './Train3D';
import { HO_CHI_MINH_METRO_LINE_1_STATIONS as STATIONS } from '@/data/metroStationsData';

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
  setIsRunning, // setIsRunning might not be used if loop is truly infinite from start
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
    if (!isRunning) { // If not running, do nothing.
        return;
    }
    // This guard handles the case where currentSegmentIndex might be invalid for a segment (e.g. at last station, or < 2 stations)
    if (currentSegmentIndex >= STATIONS.length - 1 && STATIONS.length > 1) { 
        // This state (at the last station, index-wise) should ideally be handled by the arrival logic below.
        // If we are already at the last station index, it means we are about to start a new loop.
        // The logic below will reset currentSegmentIndex to 0.
        // This condition might only be true for a single frame if STATIONS.length == 1, which is fine.
    }


    const now = Date.now();
    const elapsedTime = now - segmentStartTime;
    
    // Ensure there are at least two stations to form a segment
    if (STATIONS.length < 2) {
        if (STATIONS.length === 1) {
            setStatus(`Tàu đang ở Ga ${STATIONS[0].name}. Không có ga tiếp theo.`);
        } else {
            setStatus("Không có thông tin ga.");
        }
        setIsRunning(false); // Stop if not enough stations
        return;
    }

    const fromStation = STATIONS[currentSegmentIndex];
    // toStation is the station the train is currently moving towards.
    // currentSegmentIndex ranges from 0 to STATIONS.length - 2.
    // So, currentSegmentIndex + 1 ranges from 1 to STATIONS.length - 1.
    const toStation = STATIONS[currentSegmentIndex + 1];

    if (!fromStation || !toStation) {
        // This should not happen if STATIONS.length >= 2 and currentSegmentIndex is managed correctly.
        console.error("Lỗi: Ga không tồn tại cho segment hiện tại.");
        setIsRunning(false);
        return;
    }
    
    const fromVec = new THREE.Vector3(...fromStation.position);
    const toVec = new THREE.Vector3(...toStation.position);

    if (elapsedTime >= SEGMENT_DURATION) {
      // Train has arrived at `toStation`
      setTrainPositionVec(toVec.clone());
      if (trainRef.current) {
        trainRef.current.position.copy(toVec);
      }

      const justArrivedAtStationIndex = currentSegmentIndex + 1;
      const justArrivedAtStation = STATIONS[justArrivedAtStationIndex];
      setStatus(`Tàu đang ở Ga ${justArrivedAtStation.name}`);

      if (justArrivedAtStationIndex >= STATIONS.length - 1) { // Arrived at the LAST station
        // Loop back to the start
        const firstStation = STATIONS[0];
        const firstStationVec = new THREE.Vector3(...firstStation.position);
        
        setCurrentSegmentIndex(0);
        setSegmentStartTime(Date.now());
        setTrainPositionVec(firstStationVec.clone()); // Set logical position for next frame's calculation
        if (trainRef.current) {
          trainRef.current.position.copy(firstStationVec); // Visually move train to start
        }
        
        if (STATIONS.length > 1) { // Should always be true here due to earlier check
            setStatus(`Vòng lại ${STATIONS[0].name}. Đang di chuyển tới Ga ${STATIONS[1].name}.`);
        }
        // isRunning remains true for infinite loop

      } else { // Arrived at an intermediate station, move to the next segment
        setCurrentSegmentIndex(justArrivedAtStationIndex);
        setSegmentStartTime(Date.now());
        // Status for moving to the next station
        setStatus(`Đang di chuyển tới Ga ${STATIONS[justArrivedAtStationIndex + 1].name}`);
      }
    } else {
      // In transit - interpolate position
      const progress = elapsedTime / SEGMENT_DURATION;
      const newPos = new THREE.Vector3().lerpVectors(fromVec, toVec, progress);
      setTrainPositionVec(newPos.clone());
      if (trainRef.current) {
        trainRef.current.position.copy(newPos);
      }
      // Status indicating "Đang di chuyển tới Ga Y" is set when the segment starts.
    }
  });

  return <Train3D ref={trainRef} position={trainPositionVec} />;
};

export default TrainAnimation;

