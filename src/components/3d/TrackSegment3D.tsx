
import * as React from 'react';
import * as THREE from 'three';
import { TRACK_RADIUS } from '@/data/metroStationsData';

interface TrackSegment3DProps {
  startPosition: [number, number, number];
  endPosition: [number, number, number];
}

const TrackSegment3D: React.FC<TrackSegment3DProps> = ({ startPosition, endPosition }) => {
  const startVec = new THREE.Vector3(...startPosition);
  const endVec = new THREE.Vector3(...endPosition);
  const length = startVec.distanceTo(endVec);
  const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
  
  const orientation = new THREE.Matrix4();
  const offsetRotation = new THREE.Matrix4();
  orientation.lookAt(startVec, endVec, new THREE.Object3D().up);
  offsetRotation.makeRotationX(Math.PI / 2); // Align cylinder along the Z-axis by default
  orientation.multiply(offsetRotation);


  return (
    <mesh position={midPoint} rotationFromMatrix={orientation}>
      <cylinderGeometry args={[TRACK_RADIUS, TRACK_RADIUS, length, 16]} />
      <meshStandardMaterial color="#555555" />
    </mesh>
  );
};

export default TrackSegment3D;
