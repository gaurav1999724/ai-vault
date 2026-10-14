"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

function Sculpture() {
  const group = useRef<Group>(null);
  useFrame((state) => {
    const node = group.current;
    if (!node) return;
    const targetY = state.pointer.x * 0.55;
    const targetX = state.pointer.y * 0.28;
    node.rotation.y += (targetY - node.rotation.y) * 0.05;
    node.rotation.x += (targetX - node.rotation.x) * 0.05;
    node.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.08;
  });
  return (
    <group ref={group}>
      <mesh>
        <torusKnotGeometry args={[1, 0.28, 180, 24]} />
        <meshPhysicalMaterial color="#12141b" metalness={0.94} roughness={0.18} clearcoat={0.7} clearcoatRoughness={0.25} />
      </mesh>
      <mesh position={[1.35, 0.55, 0.15]}>
        <icosahedronGeometry args={[0.26, 0]} />
        <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={0.45} metalness={0.3} roughness={0.35} />
      </mesh>
      <mesh position={[-1.15, -0.62, 0.35]} rotation={[0.5, 0.2, 0.4]}>
        <torusGeometry args={[0.42, 0.04, 16, 80]} />
        <meshStandardMaterial color="#5DE4FF" emissive="#5DE4FF" emissiveIntensity={0.35} metalness={0.6} roughness={0.25} />
      </mesh>
    </group>
  );
}

export function InteractiveHeroScene() {
  return (
    <div className="h-full w-full" data-cursor="3d">
      <Canvas
        camera={{ position: [0, 0, 4.3], fov: 34 }}
        dpr={[1, 1.4]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.18} />
        <spotLight position={[4, 4, 4]} intensity={50} color="#8B5CF6" angle={0.5} penumbra={0.8} />
        <spotLight position={[-4, -1, 3]} intensity={36} color="#5DE4FF" angle={0.55} penumbra={1} />
        <directionalLight position={[0, 2, 3]} intensity={1.1} color="#f4f4f5" />
        <Sculpture />
      </Canvas>
    </div>
  );
}
