import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const AnimatedLines = () => {
  const linesRef = useRef();

  useFrame(() => {
    if (linesRef.current) {
      linesRef.current.rotation.z += 0.001;
    }
  });

  return (
    <group ref={linesRef}>
      {[...Array(30)].map((_, i) => (
        <line key={i}>
          <geometry
            attach="geometry"
            vertices={new THREE.Float32BufferAttribute(
              [...Array(10)].flatMap(() => [
                Math.random() * 20 - 10,
                Math.random() * 20 - 10,
                Math.random() * 20 - 10,
              ]),
              3
            )}
          />
          <lineBasicMaterial attach="material" color={0xffffff} />
        </line>
      ))}
    </group>
  );
};

const AnimatedBackground = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 20] }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
      }}
    >
      <color attach="background" args={["#000"]} />
      <AnimatedLines />
    </Canvas>
  );
};

export default AnimatedBackground;
