
import * as React from 'react';
import * as THREE from 'three';

interface Train3DProps {
  position: THREE.Vector3;
}

const Train3D: React.FC<Train3DProps> = ({ position }) => {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.8, 0.4, 0.4]} />
      <meshStandardMaterial color="#1EAEDB" />
    </mesh>
  );
};

export default Train3D;
