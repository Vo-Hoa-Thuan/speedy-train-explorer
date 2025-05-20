
import * as React from 'react';
import { Html } from '@react-three/drei';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import type { StationData } from '@/data/metroStationsData';
import { STATION_RADIUS } from '@/data/metroStationsData';

interface Station3DProps {
  station: StationData;
}

const Station3D: React.FC<Station3DProps> = ({ station }) => {
  // Define a size for the interactive trigger area in pixels
  const triggerSize = '60px'; 

  return (
    <group position={station.position}>
      {/* The visual representation of the station */}
      <mesh>
        <cylinderGeometry args={[STATION_RADIUS, STATION_RADIUS, 0.5, 32]} />
        <meshStandardMaterial color={station.color} />
      </mesh>
      
      {/* Station name label */}
      <Html position={[0, STATION_RADIUS + 0.7, 0]} center>
        <div className="bg-transparent text-xs px-1 py-0.5 rounded text-white whitespace-nowrap select-none">
          {station.name}
        </div>
      </Html>
      
      {/* Hover card for station details, separated from the 3D elements */}
      <Html position={[0, 0, 0]} center>
        <HoverCard openDelay={100} closeDelay={300}>
          <HoverCardTrigger asChild>
            <div 
              style={{
                width: triggerSize,
                height: triggerSize,
                cursor: 'pointer',
              }}
            />
          </HoverCardTrigger>
          <HoverCardContent className="w-64">
            <div className="space-y-2">
              <h4 className="font-semibold">{station.name}</h4>
              {station.details && <p className="text-sm text-muted-foreground">{station.details}</p>}
              <p className="text-xs">Thời gian đến/đi: (sẽ cập nhật)</p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </Html>
    </group>
  );
};

export default Station3D;
