
import * as React from 'react';
import { Html } from '@react-three/drei';
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
        <mesh position={station.position}>
          <cylinderGeometry args={[STATION_RADIUS, STATION_RADIUS, 0.5, 32]} />
          <meshStandardMaterial color={station.color} />
          <Html position={[0, STATION_RADIUS + 0.5, 0]} center>
            <div className="bg-white/80 text-xs px-1 py-0.5 rounded shadow text-black whitespace-nowrap">
              {station.name}
            </div>
          </Html>
        </mesh>
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
