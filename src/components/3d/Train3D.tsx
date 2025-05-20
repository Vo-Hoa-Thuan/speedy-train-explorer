
import * as React from 'react';
import * as THREE from 'three';

interface Train3DProps {
  position: THREE.Vector3;
}

const Train3D = React.forwardRef<THREE.Mesh, Train3DProps>(({ position }, ref) => {
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[0.8, 0.4, 0.4]} />
      <meshStandardMaterial color="#1EAEDB" />
    </mesh>
  );
});

Train3D.displayName = 'Train3D';

export default Train3D;
