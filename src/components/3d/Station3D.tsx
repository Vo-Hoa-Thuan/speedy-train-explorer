
import * as React from 'react';
import { Html } from '@react-three/drei';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { StationData } from '@/data/metroStationsData';
import { STATION_RADIUS } from '@/data/metroStationsData';

interface Station3DProps {
  station: StationData;
}

const Station3D: React.FC<Station3DProps> = ({ station }) => {
  // Define a size for the interactive trigger area in pixels
  // This might need adjustment based on typical camera distance and station size in screen space
  const triggerSize = '60px'; // Example size, can be tuned

  return (
    <Tooltip>
      {/* The <group> positions the entire station assembly (visuals + trigger) */}
      <group position={station.position}>
        {/* 1. The visual 3D mesh of the station */}
        <mesh>
          <cylinderGeometry args={[STATION_RADIUS, STATION_RADIUS, 0.5, 32]} />
          <meshStandardMaterial color={station.color} />
          {/* Station name label, always visible, styled to not interfere with interactions */}
          <Html position={[0, STATION_RADIUS + 0.7, 0]} center>
            <div className="bg-transparent text-xs px-1 py-0.5 rounded text-white whitespace-nowrap select-none pointer-events-none">
              {station.name}
            </div>
          </Html>
        </mesh>

        {/* 2. The TooltipTrigger using an Html component for interaction */}
        {/* This Html component becomes the actual DOM element Radix interacts with via asChild */}
        <TooltipTrigger asChild>
          <Html
            center // Centers the Html content relative to this group's origin (which is the station center)
            position={[0, 0, 0]} // Position the trigger at the center of the station model
            style={{
              width: triggerSize,
              height: triggerSize,
              // backgroundColor: 'rgba(0, 255, 0, 0.05)', // Uncomment for debugging trigger area visibility
              cursor: 'pointer',
              pointerEvents: 'auto', // Crucial: Make sure this Html element captures pointer events
            }}
          >
            {/* This inner div ensures the Html component has content and respects the size.
                It doesn't need to be visible itself. TooltipTrigger will pass props to the <Html> component,
                which in turn renders a div that can accept these props. */}
            <div style={{ width: '100%', height: '100%' }} />
          </Html>
        </TooltipTrigger>
      </group>

      {/* 3. The TooltipContent, managed by Radix (usually portaled to the document body) */}
      <TooltipContent>
        <p className="font-semibold">{station.name}</p>
        {station.details && <p className="text-sm text-muted-foreground">{station.details}</p>}
        <p className="text-xs">Thời gian đến/đi: (sẽ cập nhật)</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default Station3D;
