"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Stars } from "@react-three/drei";
import * as THREE from "three";

function Crystal({ position, color, scale }: { position: [number, number, number], color: string, scale: number }) {
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        meshRef.current.rotation.x = Math.cos(t / 4) / 2;
        meshRef.current.rotation.y = Math.sin(t / 4) / 2;
        meshRef.current.rotation.z = Math.sin(t / 1.5) / 2;
        meshRef.current.position.y = position[1] + Math.sin(t / 1.5) / 2;
    });

    return (
        <mesh ref={meshRef} position={position} scale={scale}>
            <octahedronGeometry args={[1, 0]} />
            <MeshDistortMaterial
                color={color}
                envMapIntensity={0.75}
                clearcoat={1}
                clearcoatRoughness={0}
                metalness={0.6}
            />
        </mesh>
    );
}

function SceneLights() {
    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#00f0ff" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#7f00ff" />
            <spotLight
                position={[0, 15, 0]}
                angle={0.3}
                penumbra={1}
                intensity={2}
                castShadow
                shadow-mapSize={2048}
            />
        </>
    );
}

export default function ThreeDScene() {
    return (
        <div className="absolute inset-0 z-0 h-full w-full bg-black">
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                <SceneLights />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                {/* Main Elements */}
                <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
                    <Crystal position={[2, 0, -2]} color="#00f0ff" scale={1.5} />
                    <Crystal position={[-2.5, 1, -1]} color="#7f00ff" scale={1.2} />
                    <Crystal position={[0, -2, -4]} color="#39ff14" scale={0.8} />
                </Float>

                {/* Background Particles */}
                <Float speed={2} rotationIntensity={2} floatIntensity={1}>
                    <Crystal position={[5, 2, -10]} color="#f2a900" scale={0.5} />
                    <Crystal position={[-5, -2, -10]} color="#ff2a2a" scale={0.5} />
                </Float>
            </Canvas>
        </div>
    );
}
