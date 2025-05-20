
import * as React from 'react';
import { Html } from '@react-three/drei';
// THREE is not explicitly used here for Vector3, station.position is an array which is fine for R3F
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { StationData } from '@/data/metroStationsData';
import { STATION_RADIUS } from '@/data/metroStationsData';

interface Station3DProps {
  station: StationData;
}

const Station3D: React.FC<Station3DProps> = ({ station }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <group position={station.position}> {/* Apply position to the group */}
          <mesh> {/* Mesh is now at local [0,0,0] relative to the group */}
            <cylinderGeometry args={[STATION_RADIUS, STATION_RADIUS, 0.5, 32]} />
            <meshStandardMaterial color={station.color} />
            <Html position={[0, STATION_RADIUS + 0.5, 0]} center>
              <div className="bg-white/80 text-xs px-1 py-0.5 rounded shadow text-black whitespace-nowrap">
                {station.name}
              </div>
            </Html>
          </mesh>
        </group>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-semibold">{station.name}</p>
        {station.details && <p className="text-sm text-muted-foreground">{station.details}</p>}
        <p className="text-xs">Thời gian đến/đi: (sẽ cập nhật)</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default Station3D;
