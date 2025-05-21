
import { useState, useEffect, useCallback } from 'react';
import { HO_CHI_MINH_METRO_LINE_1_STATIONS as STATIONS_DATA } from '@/data/metroStationsData'; // Assuming this is your station data

const SEGMENT_DURATION = 5000; // 5 seconds per segment
const STATION_STOP_DURATION = 5000; // 5 seconds stop at each station

interface UseTrainMovementLogicProps {
  isRunning: boolean;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
  currentSegmentIndex: number;
  setCurrentSegmentIndex: React.Dispatch<React.SetStateAction<number>>;
  segmentStartTime: number;
  setSegmentStartTime: React.Dispatch<React.SetStateAction<number>>;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  setTrainXPosition: React.Dispatch<React.SetStateAction<number>>; // For 2D X position
  selectedFromStation?: number;
  selectedToStation?: number;
  stations: typeof STATIONS_DATA; // Pass stations data
}

export const useTrainMovementLogic = ({
  isRunning,
  setIsRunning,
  currentSegmentIndex,
  setCurrentSegmentIndex,
  segmentStartTime,
  setSegmentStartTime,
  setStatus,
  setTrainXPosition,
  selectedFromStation,
  selectedToStation,
  stations,
}: UseTrainMovementLogicProps) => {
  const [isStoppedAtStation, setIsStoppedAtStation] = useState(false);
  const [stationStopStartTime, setStationStopStartTime] = useState(0);

  // Reset train to initial position when selectedFromStation changes
  useEffect(() => {
    if (selectedFromStation !== undefined && stations[selectedFromStation]) {
      const startStation = stations[selectedFromStation];
      // Assuming position[0] is the x-coordinate for 2D
      setTrainXPosition(startStation.position[0]);
      setCurrentSegmentIndex(selectedFromStation);
      setIsStoppedAtStation(false);
      setStatus(`Tàu đang ở Ga ${startStation.name}`);
      setIsRunning(false); 
    }
  }, [selectedFromStation, setCurrentSegmentIndex, setTrainXPosition, setStatus, setIsRunning, stations]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    let animationFrameId: number;

    const animate = () => {
      const now = Date.now();

      // Handle selected route completion
      if (
        selectedFromStation !== undefined &&
        selectedToStation !== undefined &&
        currentSegmentIndex >= selectedToStation // Train has arrived or passed the 'toStation' index
      ) {
        // If the train is at the target station (currentSegmentIndex === selectedToStation)
        // and is not already stopped, it means it just arrived.
        // The logic below for station stopping will handle the stop.
        // If it's beyond the target, ensure it stops.
        if (currentSegmentIndex === selectedToStation && !isStoppedAtStation) {
            // This case is handled by the arrival logic + station stop below
        } else if (currentSegmentIndex > selectedToStation) {
            // This case means it already passed, set it to selectedToStation
            setCurrentSegmentIndex(selectedToStation);
            setTrainXPosition(stations[selectedToStation].position[0]);
            setIsRunning(false);
            setStatus(`Tàu đã đến Ga ${stations[selectedToStation].name}`);
            animationFrameId = requestAnimationFrame(animate); // Continue animation for potential state updates
            return;
        }
        // If currentSegmentIndex === selectedToStation, let the stop logic handle it
      }


      if (isStoppedAtStation) {
        const stationStopElapsedTime = now - stationStopStartTime;
        if (stationStopElapsedTime >= STATION_STOP_DURATION) {
          setIsStoppedAtStation(false);
          setSegmentStartTime(now); // Reset segment start time for movement

          let nextSegmentIndex = currentSegmentIndex;
          
          // Check if this was the selectedToStation
           if (selectedToStation !== undefined && currentSegmentIndex === selectedToStation) {
            setIsRunning(false);
            setStatus(`Tàu đã đến Ga ${stations[selectedToStation].name} (Hoàn thành tuyến đã chọn)`);
            animationFrameId = requestAnimationFrame(animate);
            return;
          }


          // Loop back logic or move to next
          if (currentSegmentIndex >= stations.length - 1) { // At the last station
            if (selectedToStation !== undefined) { // If a specific route is selected, don't loop
                setIsRunning(false);
                setStatus(`Tàu đã đến Ga cuối ${stations[currentSegmentIndex].name}`);
            } else { // Loop
                nextSegmentIndex = 0;
                setCurrentSegmentIndex(0);
                setTrainXPosition(stations[0].position[0]);
                setStatus(`Vòng lại ${stations[0].name}. Đang di chuyển tới Ga ${stations[1] ? stations[1].name : stations[0].name}.`);
            }
          } else {
            // No change needed for currentSegmentIndex here, it's already at the station it stopped at.
            // The movement part will use currentSegmentIndex and currentSegmentIndex + 1
             setStatus(`Đang di chuyển tới Ga ${stations[currentSegmentIndex + 1].name}`);
          }
        } else {
          const remainingTime = Math.ceil((STATION_STOP_DURATION - stationStopElapsedTime) / 1000);
          setStatus(`Tàu đang dừng tại Ga ${stations[currentSegmentIndex].name}. Còn ${remainingTime}s`);
        }
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      // Movement logic
      if (currentSegmentIndex >= stations.length - 1 && (selectedToStation === undefined || currentSegmentIndex < selectedToStation)) {
         // This case means we are at the last station and should loop (if no specific end is set or end is not reached)
         // Or, if selectedToStation is defined and is the last station, this is handled by arrival logic.
         // This part is mostly for continuous looping scenario.
         // The stopping logic above should handle arrival at selectedToStation if it's the last one.
         // If isRunning is true and we are here, it means we should be moving or starting a loop.
         // The isStoppedAtStation block handles resuming after a stop.
         // If selectedToStation is not defined, and we are at the end, the stop logic would set up for looping.
         // This path should not be hit if isStoppedAtStation is true.
      }


      const elapsedTime = now - segmentStartTime;
      
      if (stations.length < 2) {
        setStatus(stations.length === 1 ? `Tàu đang ở Ga ${stations[0].name}. Không có ga tiếp theo.` : "Không có thông tin ga.");
        setIsRunning(false);
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      
      // Determine from and to stations for the current segment
      const fromStationIndex = currentSegmentIndex;
      const toStationIndex = currentSegmentIndex + 1;

      if (fromStationIndex >= stations.length || toStationIndex >= stations.length) {
        // This handles when the train is at the last station and about to loop or stop
        // If selectedToStation is not set, it should loop (handled by stop logic)
        // If selectedToStation is set and it's the last station, it should stop (handled by stop logic)
        // If we are here, it means we are at the last station and the next segment is invalid
        // Let the station stop logic handle looping or final destination.
        // If it is still running and not stopped, it means it finished a segment to the last station.
        if(!isStoppedAtStation) { // Should arrive at last station
            const lastStation = stations[fromStationIndex];
            setTrainXPosition(lastStation.position[0]);
            
            setIsStoppedAtStation(true);
            setStationStopStartTime(now);
            setStatus(`Tàu đã đến Ga ${lastStation.name}. Đang dừng đỗ (${STATION_STOP_DURATION / 1000}s)`);
            // currentSegmentIndex is already correct (last station index)
        }
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const fromStation = stations[fromStationIndex];
      const toStation = stations[toStationIndex];

      const fromX = fromStation.position[0];
      const toX = toStation.position[0];

      if (elapsedTime >= SEGMENT_DURATION) {
        // Arrived at toStation
        setTrainXPosition(toX);
        setCurrentSegmentIndex(toStationIndex); // Update current segment to the station just arrived at
        
        setIsStoppedAtStation(true);
        setStationStopStartTime(now);
        setStatus(`Tàu đã đến Ga ${toStation.name}. Đang dừng đỗ (${STATION_STOP_DURATION / 1000}s)`);

        if (selectedToStation !== undefined && toStationIndex === selectedToStation) {
            // Re-check here: if this is the destination, status is set, but isRunning should become false after stop.
            // The logic in isStoppedAtStation block will handle turning off isRunning.
        }

      } else {
        // In transit
        const progress = elapsedTime / SEGMENT_DURATION;
        const newX = fromX + (toX - fromX) * progress;
        setTrainXPosition(newX);
        // Status for "moving to" is set when resuming from a stop or at initial start.
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    isRunning, 
    isStoppedAtStation, 
    stationStopStartTime, 
    segmentStartTime, 
    currentSegmentIndex, 
    selectedFromStation, 
    selectedToStation, 
    stations,
    setIsRunning, 
    setCurrentSegmentIndex, 
    setSegmentStartTime, 
    setStatus, 
    setTrainXPosition, 
    setIsStoppedAtStation, 
    setStationStopStartTime
  ]);
};

