import React, { useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Train3D from './Train3D';
import { HO_CHI_MINH_METRO_LINE_1_STATIONS as STATIONS } from '@/data/metroStationsData';

const SEGMENT_DURATION = 5000; // 5 seconds per segment
const STATION_STOP_DURATION = 5000; // 5 seconds stop at each station

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
  selectedFromStation?: number;
  selectedToStation?: number;
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
  selectedFromStation,
  selectedToStation,
}) => {
  const [isStoppedAtStation, setIsStoppedAtStation] = useState(false);
  const [stationStopStartTime, setStationStopStartTime] = useState(0);
  
  // Reset train to initial position when selectedFromStation changes
  useEffect(() => {
    if (selectedFromStation !== undefined && STATIONS[selectedFromStation]) {
      const startStation = STATIONS[selectedFromStation];
      const startVec = new THREE.Vector3(...startStation.position);
      
      setCurrentSegmentIndex(selectedFromStation);
      setTrainPositionVec(startVec.clone());
      if (trainRef.current) {
        trainRef.current.position.copy(startVec);
      }
      setIsStoppedAtStation(false);
      setStatus(`Tàu đang ở Ga ${startStation.name}`);
      setIsRunning(false);
    }
  }, [selectedFromStation, setCurrentSegmentIndex, setTrainPositionVec, trainRef, setStatus, setIsRunning]);

  useFrame(() => {
    if (!isRunning) {
      return;
    }

    // Check if we need to respect specific station boundaries
    if (selectedFromStation !== undefined && 
        selectedToStation !== undefined && 
        currentSegmentIndex >= selectedToStation - 1) {
      // Stop at the target station
      setIsRunning(false);
      setStatus(`Tàu đã đến Ga ${STATIONS[selectedToStation].name}`);
      return;
    }

    // This guard handles the case where currentSegmentIndex might be invalid
    if (currentSegmentIndex >= STATIONS.length - 1 && STATIONS.length > 1) {
        // This state (at the last station, index-wise) should ideally be handled by the arrival logic below.
        // If we are already at the last station index, it means we are about to start a new loop.
        // The logic below will reset currentSegmentIndex to 0.
        // This condition might only be true for a single frame if STATIONS.length == 1, which is fine.
    }

    const now = Date.now();
    
    // If the train is stopped at a station, check if the stop duration has elapsed
    if (isStoppedAtStation) {
      const stationStopElapsedTime = now - stationStopStartTime;
      
      if (stationStopElapsedTime >= STATION_STOP_DURATION) {
        // Resume movement after station stop
        setIsStoppedAtStation(false);
        setSegmentStartTime(now);
        
        // If this is the last station, loop back to the first
        if (currentSegmentIndex >= STATIONS.length - 1) {
          // Loop back to the start
          const firstStation = STATIONS[0];
          const firstStationVec = new THREE.Vector3(...firstStation.position);
          
          setCurrentSegmentIndex(0);
          setTrainPositionVec(firstStationVec.clone());
          if (trainRef.current) {
            trainRef.current.position.copy(firstStationVec);
          }
          
          if (STATIONS.length > 1) {
            setStatus(`Vòng lại ${STATIONS[0].name}. Đang di chuyển tới Ga ${STATIONS[1].name}.`);
          }
        } else {
          // Move to the next segment
          setStatus(`Đang di chuyển tới Ga ${STATIONS[currentSegmentIndex + 1].name}`);
        }
      } else {
        // Still in station stop, just update remaining time in status
        const remainingTime = Math.ceil((STATION_STOP_DURATION - stationStopElapsedTime) / 1000);
        setStatus(`Tàu đang dừng tại Ga ${STATIONS[currentSegmentIndex].name}. Còn ${remainingTime}s`);
      }
      
      return; // Skip movement calculation while stopped at station
    }
    
    const elapsedTime = now - segmentStartTime;
    
    // Ensure there are at least two stations to form a segment
    if (STATIONS.length < 2) {
      if (STATIONS.length === 1) {
        setStatus(`Tàu đang ở Ga ${STATIONS[0].name}. Không có ga tiếp theo.`);
      } else {
        setStatus("Không có thông tin ga.");
      }
      setIsRunning(false);
      return;
    }

    const fromStation = STATIONS[currentSegmentIndex];
    const toStation = STATIONS[currentSegmentIndex + 1];

    if (!fromStation || !toStation) {
      console.error("Lỗi: Ga không tồn tại cho segment hiện tại.");
      setIsRunning(false);
      return;
    }
    
    const fromVec = new THREE.Vector3(...fromStation.position);
    const toVec = new THREE.Vector3(...toStation.position);

    if (elapsedTime >= SEGMENT_DURATION) {
      // Train has arrived at `toStation` - start the station stop timer
      setTrainPositionVec(toVec.clone());
      if (trainRef.current) {
        trainRef.current.position.copy(toVec);
      }

      const justArrivedAtStationIndex = currentSegmentIndex + 1;
      const justArrivedAtStation = STATIONS[justArrivedAtStationIndex];
      
      // Start the station stop
      setIsStoppedAtStation(true);
      setStationStopStartTime(now);
      setStatus(`Tàu đã đến Ga ${justArrivedAtStation.name}. Đang dừng đỗ (5s)`);
      setCurrentSegmentIndex(justArrivedAtStationIndex);
    } else {
      // In transit - interpolate position
      const progress = elapsedTime / SEGMENT_DURATION;
      const newPos = new THREE.Vector3().lerpVectors(fromVec, toVec, progress);
      setTrainPositionVec(newPos.clone());
      if (trainRef.current) {
        trainRef.current.position.copy(newPos);
      }
      // Status already set when segment starts
    }
  });

  return <Train3D ref={trainRef} position={trainPositionVec} />;
};

export default TrainAnimation;
