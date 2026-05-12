"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Stage, PerspectiveCamera } from "@react-three/drei";

const Model = ({ url }: { url: string }) => {
  const { scene } = useGLTF(url);
  // Scale down and center model
  return <primitive object={scene} scale={0.8} position={[0, 0, 0]} />;
};

const RobotModel = () => {
  return (
    <div className="w-full h-[400px] md:h-[750px] cursor-grab active:cursor-grabbing">
      <Canvas shadows dpr={[1, 2]}>
        {/* Position camera higher and further back to see the ground shadow clearly */}
        <PerspectiveCamera makeDefault position={[0, 2, 7]} fov={35} />
        <Suspense fallback={
          <mesh>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color="#A0CBCA" wireframe />
          </mesh>
        }>
          <Stage environment="city" intensity={0.6} shadows="contact">
            <Model url="/assets/care_plus_robot_3d.glb" />
          </Stage>
          <OrbitControls 
            enableZoom={false} 
            autoRotate 
            autoRotateSpeed={2} 
            makeDefault 
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default RobotModel;
