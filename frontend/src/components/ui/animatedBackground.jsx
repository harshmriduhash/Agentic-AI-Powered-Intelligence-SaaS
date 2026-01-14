/* eslint-disable no-unused-vars */
import { Suspense, useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Animated particles component using BufferGeometry
function AnimatedParticles({ count = 200 }) { // Reduced count for stability
  const mesh = useRef();
  const particles = useRef([]);

  // Initialize particles
  useMemo(() => {
    particles.current = [];
    for (let i = 0; i < count; i++) {
      particles.current.push({
        time: Math.random() * 100,
        factor: 20 + Math.random() * 100,
        speed: 0.01 + Math.random() / 200,
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        z: Math.random() * 200 - 100,
      });
    }
  }, [count]);

  // Create geometry and material
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      color: '#8b5cf6',
      size: 0.6,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      depthWrite: false,
    });
  }, []);

  useFrame(() => {
    if (!mesh.current) return;
    
    const positions = mesh.current.geometry.attributes.position.array;
    
    // Optimize: Update fewer particles per frame if needed, but for 500 it's fine
    particles.current.forEach((particle, i) => {
      const t = particle.time += particle.speed;
      const index = i * 3;
      
      positions[index] = particle.x + Math.cos((t / 10) * particle.factor) + (Math.sin(t * 1) * particle.factor) / 10;
      positions[index + 1] = particle.y + Math.sin((t / 10) * particle.factor) + (Math.cos(t * 2) * particle.factor) / 10;
      positions[index + 2] = particle.z + Math.cos((t / 10) * particle.factor) + (Math.sin(t * 3) * particle.factor) / 10;
    });
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return <points ref={mesh} geometry={geometry} material={material} />;
}

// Floating geometric shapes
function FloatingShapes() {
  const shapes = useRef([]);

  useFrame((state) => {
    shapes.current.forEach((shape, i) => {
      if (shape) {
        // Slow down animations
        shape.rotation.x += 0.005 * (i % 2 === 0 ? 1 : -1);
        shape.rotation.y += 0.005 * (i % 3 === 0 ? 1 : -1);
        shape.position.y = Math.sin(state.clock.elapsedTime * 0.5 + i) * 2;
        shape.position.x = Math.cos(state.clock.elapsedTime * 0.25 + i) * 3;
      }
    });
  });

  return (
    <>
      {[...Array(6)].map((_, i) => ( // Reduced shape count
        <mesh
          key={i}
          ref={(el) => (shapes.current[i] = el)}
          position={[
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 30,
          ]}
          scale={Math.random() * 2 + 1}
        >
          {i % 3 === 0 ? (
            <octahedronGeometry args={[1]} />
          ) : i % 3 === 1 ? (
            <tetrahedronGeometry args={[1]} />
          ) : (
            <icosahedronGeometry args={[1]} />
          )}
          <meshStandardMaterial
            color={i % 2 === 0 ? '#8b5cf6' : '#6366f1'}
            transparent
            opacity={0.5}
            metalness={0.9}
            roughness={0.1}
            emissive={i % 2 === 0 ? '#4c1d95' : '#312e81'}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </>
  );
}

// Mouse tracking hook
function useMousePosition() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const { viewport } = useThree();

  useEffect(() => {
    let ticking = false;
    const handleMouseMove = (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const x = (e.clientX / window.innerWidth) * 2 - 1;
          const y = -(e.clientY / window.innerHeight) * 2 + 1;
          setMouse({ 
            x: x * viewport.width / 2, 
            y: y * viewport.height / 2 
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [viewport]);

  return mouse;
}

// Rotating ring component that follows mouse
function RotatingRing() {
  const groupRef = useRef();
  const mainRingRef = useRef();
  const innerRingRef = useRef();
  const outerRingRef = useRef();
  const mouse = useMousePosition();
  const targetPosition = useRef(new THREE.Vector3(0, 0, -15));

  useFrame((state) => {
    if (groupRef.current) {
      // Smoothly follow mouse
      targetPosition.current.x += (mouse.x * 0.3 - targetPosition.current.x) * 0.1;
      targetPosition.current.y += (mouse.y * 0.3 - targetPosition.current.y) * 0.1;
      
      groupRef.current.position.copy(targetPosition.current);
      
      // Rotate and animate the group
      groupRef.current.rotation.z += 0.01;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      groupRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.3) * 0.2;
      
      // Scale based on mouse distance from center
      const distance = Math.sqrt(mouse.x ** 2 + mouse.y ** 2);
      const scale = 1 + (distance * 0.1);
      groupRef.current.scale.setScalar(scale);
      
      // Individual ring rotations
      if (mainRingRef.current) {
        mainRingRef.current.rotation.z += 0.005;
      }
      if (innerRingRef.current) {
        innerRingRef.current.rotation.z -= 0.008;
      }
      if (outerRingRef.current) {
        outerRingRef.current.rotation.z += 0.003;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main ring */}
      <mesh ref={mainRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[12, 0.8, 16, 50]} /> {/* Reduced segments */}
        <meshStandardMaterial
          color="#6366f1"
          transparent
          opacity={0.6}
          metalness={0.95}
          roughness={0.05}
          emissive="#312e81"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Inner ring */}
      <mesh ref={innerRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[8, 0.4, 16, 50]} /> {/* Reduced segments */}
        <meshStandardMaterial
          color="#8b5cf6"
          transparent
          opacity={0.4}
          metalness={0.95}
          roughness={0.05}
          emissive="#4c1d95"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Outer glow ring */}
      <mesh ref={outerRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[16, 0.3, 16, 50]} /> {/* Reduced segments */}
        <meshStandardMaterial
          color="#a78bfa"
          transparent
          opacity={0.2}
          metalness={1}
          roughness={0}
        />
      </mesh>
    </group>
  );
}

// Main animated background component
export function AnimatedBackground({ intensity = 0.5 }) {
  const particleCount = Math.floor(500 * intensity); // Reduced base count
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 via-indigo-950 to-violet-950" />
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/30 to-violet-900/20 animate-pulse" 
           style={{ animationDuration: '8s' }} />
      
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 30], fov: 75 }}
          style={{ background: 'transparent' }}
          gl={{ alpha: true, antialias: false, powerPreference: 'default', failIfMajorPerformanceCaveat: true }} // Disable antialias for perf
          dpr={[1, 1.5]} // Cap DPR
          onCreated={({ gl }) => {
            gl.domElement.addEventListener("webglcontextlost", (event) => {
              event.preventDefault();
              console.log("WebGL context lost. Restarting...");
            }, false);
            gl.domElement.addEventListener("webglcontextrestored", () => {
              console.log("WebGL context restored.");
            }, false);
          }}
        >
          <ambientLight intensity={0.3 * intensity} />
          <pointLight position={[10, 10, 10]} intensity={1.2 * intensity} color="#6366f1" />
          <pointLight position={[-10, -10, -10]} intensity={0.8 * intensity} color="#8b5cf6" />
          <pointLight position={[0, 10, -10]} intensity={0.6 * intensity} color="#a78bfa" />
          
          <AnimatedParticles count={particleCount} />
          <FloatingShapes />
          <RotatingRing />
        </Canvas>
      </Suspense>
      
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-10" 
           style={{
             backgroundImage: `radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                              radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)`
           }} />
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent/50 to-black/30 pointer-events-none" />
    </div>
  );
}

