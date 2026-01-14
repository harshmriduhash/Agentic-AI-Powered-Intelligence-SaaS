import { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Galaxy() {
  const points = useMemo(() => {
    const p = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
      const distance = Math.random() * 20;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      const y = (Math.random() - 0.5) * 5;
      p[i * 3] = x;
      p[i * 3 + 1] = y;
      p[i * 3 + 2] = z;
    }
    return p;
  }, []);

  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.05} 
        color="#88ccff" 
        transparent 
        opacity={0.4} 
        sizeAttenuation 
      />
    </points>
  );
}

function Planet({ position, size, color, speed }) {
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.y = state.clock.getElapsedTime() * speed;
    ref.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * speed) * 0.5;
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.2} />
    </mesh>
  );
}

function Alien({ position, speed }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    ref.current.position.y = position[1] + Math.sin(t) * 0.8;
    ref.current.position.x = position[0] + Math.cos(t * 0.5) * 1.5;
    ref.current.rotation.z = Math.sin(t) * 0.2;
  });

  return (
    <group ref={ref} position={position}>
      {/* Body */}
      <mesh>
        <capsuleGeometry args={[0.2, 0.4, 4, 16]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.1, 0.3, 0.15]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="black" />
      </mesh>
      <mesh position={[0.1, 0.3, 0.15]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="black" />
      </mesh>
      {/* Antennas */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.2]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#00ffcc" />
      </mesh>
    </group>
  );
}

function CuteBot() {
  const groupRef = useRef();
  const leftHandRef = useRef();
  const rightHandRef = useRef();
  const headRef = useRef();
  const antennaLRef = useRef();
  const antennaRRef = useRef();
  const newsFeedRef = useRef();
  
  const mouseRef = useRef({ x: 0, y: 0 });
  const mouseSmoothing = useRef(new THREE.Vector2());

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const { x, y } = mouseRef.current;

    mouseSmoothing.current.x = THREE.MathUtils.lerp(mouseSmoothing.current.x, x, 0.05);
    mouseSmoothing.current.y = THREE.MathUtils.lerp(mouseSmoothing.current.y, y, 0.05);

    if (groupRef.current) {
      // Extended range movement
      groupRef.current.position.x = mouseSmoothing.current.x * 6; // Increased from 3
      groupRef.current.position.y = (mouseSmoothing.current.y * 4) + Math.sin(t * 1.5) * 0.1; // Increased from 2
      
      groupRef.current.rotation.y = mouseSmoothing.current.x * 0.5;
      groupRef.current.rotation.x = -mouseSmoothing.current.y * 0.4;
    }

    if (rightHandRef.current) {
      rightHandRef.current.rotation.z = Math.sin(t * 3) * 0.4 + 1.2;
      rightHandRef.current.rotation.x = Math.cos(t * 2) * 0.2;
    }

    if (newsFeedRef.current) {
      newsFeedRef.current.position.y = 0.2 + Math.sin(t * 2) * 0.05;
      newsFeedRef.current.rotation.z = Math.sin(t * 1) * 0.1;
      newsFeedRef.current.rotation.y = 0.4 + Math.cos(t * 0.5) * 0.2;
    }

    if (antennaLRef.current) antennaLRef.current.rotation.z = Math.sin(t * 15) * 0.2;
    if (antennaRRef.current) antennaRRef.current.rotation.z = Math.cos(t * 15) * 0.2;
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, -0.4, 0]}>
        <sphereGeometry args={[0.5, 64, 64]} />
        <meshStandardMaterial color="#ffffff" metalness={0.4} roughness={0.05} />
      </mesh>
      
      <mesh position={[0, -0.4, 0.46]}>
        <planeGeometry args={[0.3, 0.18]} />
        <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={4} />
      </mesh>

      <group position={[0, 0.35, 0]} ref={headRef}>
        <mesh>
          <sphereGeometry args={[0.65, 64, 64]} />
          <meshStandardMaterial color="#ffffff" metalness={0.4} roughness={0.05} />
        </mesh>

        <group position={[0, 0, 0.52]}>
          <group position={[-0.3, 0.08, 0]}>
            <mesh><circleGeometry args={[0.24, 64]} /><meshBasicMaterial color="#00ffcc" /></mesh>
            <mesh position={[0, 0, -0.01]}><circleGeometry args={[0.28, 64]} /><meshBasicMaterial color="#000000" /></mesh>
            <mesh position={[0, 0, 0.01]}><circleGeometry args={[0.2, 64]} /><meshBasicMaterial color="#000000" /></mesh>
            <mesh position={[0.08, 0.08, 0.02]}><sphereGeometry args={[0.04, 16, 16]} /><meshBasicMaterial color="#ffffff" /></mesh>
          </group>
          <group position={[0.3, 0.08, 0]}>
            <mesh><circleGeometry args={[0.24, 64]} /><meshBasicMaterial color="#00ffcc" /></mesh>
            <mesh position={[0, 0, -0.01]}><circleGeometry args={[0.28, 64]} /><meshBasicMaterial color="#000000" /></mesh>
            <mesh position={[0, 0, 0.01]}><circleGeometry args={[0.2, 64]} /><meshBasicMaterial color="#000000" /></mesh>
            <mesh position={[0.08, 0.08, 0.02]}><sphereGeometry args={[0.04, 16, 16]} /><meshBasicMaterial color="#ffffff" /></mesh>
          </group>
        </group>

        <mesh position={[0, -0.25, 0.6]} rotation={[0, 0, Math.PI]}>
          <ringGeometry args={[0.08, 0.1, 32, 1, 0, Math.PI]} />
          <meshBasicMaterial color="#000000" side={THREE.DoubleSide} />
        </mesh>

        <group position={[-0.45, 0.45, 0]} ref={antennaLRef}>
          <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.012, 0.015, 0.3]} /><meshStandardMaterial color="#222222" /></mesh>
          <mesh position={[0, 0.25, 0]}><sphereGeometry args={[0.06, 32, 32]} /><meshStandardMaterial color="#222222" /></mesh>
        </group>
        <group position={[0.45, 0.45, 0]} ref={antennaRRef}>
          <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.012, 0.015, 0.3]} /><meshStandardMaterial color="#222222" /></mesh>
          <mesh position={[0, 0.25, 0]}><sphereGeometry args={[0.06, 32, 32]} /><meshStandardMaterial color="#222222" /></mesh>
        </group>
      </group>

      <group position={[-0.7, -0.2, 0]} ref={leftHandRef}>
        <mesh><sphereGeometry args={[0.16, 32, 32]} /><meshStandardMaterial color="#ffffff" metalness={0.4} /></mesh>
        <group ref={newsFeedRef} position={[-0.7, 0.4, 0.4]}>
          <mesh><boxGeometry args={[0.8, 1.0, 0.06]} /><meshStandardMaterial color="#0f172a" metalness={1} roughness={0.1} /></mesh>
          <mesh position={[0, 0, 0.05]}><planeGeometry args={[0.6, 0.8]} /><meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={3} /></mesh>
        </group>
      </group>

      <group position={[0.7, -0.2, 0]} ref={rightHandRef}>
        <mesh><sphereGeometry args={[0.16, 32, 32]} /><meshStandardMaterial color="#ffffff" metalness={0.4} /></mesh>
      </group>

      <mesh position={[-0.3, -1.0, 0]}><sphereGeometry args={[0.2, 32, 32]} /><meshStandardMaterial color="#ffffff" metalness={0.4} /></mesh>
      <mesh position={[0.3, -1.0, 0]}><sphereGeometry args={[0.2, 32, 32]} /><meshStandardMaterial color="#ffffff" metalness={0.4} /></mesh>

      <pointLight position={[0, 0, 1]} color="#00ffcc" intensity={10} distance={5} decay={2} />
      <pointLight position={[0, 0.5, 0.8]} color="#ffffff" intensity={5} distance={5} />
    </group>
  );
}

export function BotBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0a0c10]">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4ade80" />
        
        <Suspense fallback={null}>
          <Galaxy />
          <Planet position={[-8, 4, -10]} size={2} color="#3b82f6" speed={0.2} />
          <Planet position={[10, -5, -12]} size={3.5} color="#f59e0b" speed={0.1} />
          
          <Alien position={[-4, -2, -5]} speed={1} />
          <Alien position={[5, 3, -8]} speed={0.7} />
          <Alien position={[-6, 1, -15]} speed={0.5} />

          <group position={[2.5, 0, 0]}>
            <CuteBot />
          </group>
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0c10]/50 pointer-events-none" />
    </div>
  );
}
