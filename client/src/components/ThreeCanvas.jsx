import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export const ThreeCanvas = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create the canvas element
    const canvas = document.createElement("canvas");
    canvas.className = "webgl";
    containerRef.current.appendChild(canvas);

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 10);
    scene.add(camera);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1);
    fillLight.position.set(-5, 0, -5);
    scene.add(fillLight);

    // Load Model
    let robotModel = null;
    const loader = new GLTFLoader();

    loader.load(
      "/care_plus_robot_3d.glb",
      (gltf) => {
        robotModel = gltf.scene;
        const box = new THREE.Box3().setFromObject(robotModel);
        const size = box.getSize(new THREE.Vector3()).length();
        const center = box.getCenter(new THREE.Vector3());

        robotModel.position.x += robotModel.position.x - center.x;
        robotModel.position.y += robotModel.position.y - center.y;
        robotModel.position.z += robotModel.position.z - center.z;

        const targetSize = 6;
        const scale = targetSize / size;
        robotModel.scale.set(scale, scale, scale);

        robotModel.position.y = -5;
        robotModel.rotation.y = Math.PI;

        scene.add(robotModel);

        import("gsap").then(({ default: gsap }) => {
          gsap.to(robotModel.position, { duration: 2, y: 0, ease: "power3.out" });
          gsap.to(robotModel.rotation, { duration: 2.5, y: 0, ease: "power3.out" });
        });
      },
      undefined,
      (error) => {
        console.error("Error loading the 3D model:", error);
      }
    );

    // Interaction Variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const handleMouseMove = (event) => {
      mouseX = event.clientX - windowHalfX;
      mouseY = event.clientY - windowHalfY;
    };
    document.addEventListener("mousemove", handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener("resize", handleResize);

    // Render loop
    const clock = new THREE.Clock();
    let animationId = null;

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      if (robotModel) {
        robotModel.position.y = Math.sin(elapsedTime * 2) * 0.1;
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;
        robotModel.rotation.y += 0.05 * (targetX - robotModel.rotation.y);
        robotModel.rotation.x += 0.05 * (targetY - robotModel.rotation.x);
      }

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(tick);
    };

    tick();

    // Clean up
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      renderer.dispose();
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, []);

  return <div ref={containerRef} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: -1, pointerEvents: "none" }} />;
};
