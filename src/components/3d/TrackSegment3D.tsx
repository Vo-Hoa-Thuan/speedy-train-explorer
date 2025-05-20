
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
  // The object faces along the Z-axis in object space. 
  // We want it to face from startVec to endVec.
  orientation.lookAt(startVec, endVec, new THREE.Object3D().up);
  // The cylinder is oriented along its Y-axis. We need to rotate it so its Y-axis aligns with the direction we looked at.
  // This typically means a 90-degree rotation around the X-axis.
  const offsetRotation = new THREE.Matrix4().makeRotationX(Math.PI / 2);
  orientation.multiply(offsetRotation);

  // Convert the orientation matrix to Euler rotation for the mesh
  const rotation = new THREE.Euler().setFromRotationMatrix(orientation);

  return (
    <mesh position={midPoint} rotation={rotation}>
      <cylinderGeometry args={[TRACK_RADIUS, TRACK_RADIUS, length, 16]} />
      <meshStandardMaterial color="#555555" />
    </mesh>
  );
};

export default TrackSegment3D;
