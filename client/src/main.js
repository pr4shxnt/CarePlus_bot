import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import gsap from "gsap";
import { createIcons, Smartphone, Bot, Monitor, ShieldCheck, Timer } from "lucide";

import { HomeView } from "./views/Home.js";
import { RegistrationView } from "./views/Registration.js";
import { DownloadView } from "./views/Download.js";

// 1. Scene Setup
const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();

// 2. Camera setup
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0, 10);
scene.add(camera);

// 3. Renderer setup
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// 4. Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 1);
fillLight.position.set(-5, 0, -5);
scene.add(fillLight);

// 5. Load GLB Model
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

    gsap.to(robotModel.position, { duration: 2, y: 0, ease: "power3.out" });
    gsap.to(robotModel.rotation, { duration: 2.5, y: 0, ease: "power3.out" });
  },
  undefined,
  (error) => {
    console.error("Error loading the 3D model:", error);
  },
);

// 6. Interaction Variables
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener("mousemove", (event) => {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
});

// 7. Render Loop
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  previousTime = elapsedTime;

  if (robotModel) {
    robotModel.position.y = Math.sin(elapsedTime * 2) * 0.1;
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;
    robotModel.rotation.y += 0.05 * (targetX - robotModel.rotation.y);
    robotModel.rotation.x += 0.05 * (targetY - robotModel.rotation.x);
  }

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();

// Resize handler
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// 8. Routing Logic
const routes = {
    "/": HomeView,
    "/registration": RegistrationView,
    "/download": DownloadView
};

const navigateTo = (url) => {
    history.pushState(null, null, url);
    router();
};

const router = async () => {
    const path = window.location.pathname;
    const view = routes[path] || routes["/"];
    
    // Toggle 3D Canvas visibility
    const canvas = document.querySelector("canvas.webgl");
    if (canvas) {
        if (path === "/" || path === "") {
            canvas.style.display = "block";
        } else {
            canvas.style.display = "none";
        }
    }

    const routerView = document.getElementById("router-view");
    if (routerView) {
        routerView.innerHTML = view();
        window.scrollTo(0, 0);
        initViewInteractions();
    }
};

const initViewInteractions = () => {
    // Initialize Lucide Icons
    createIcons({
        icons: {
            Smartphone,
            Bot,
            Monitor,
            ShieldCheck,
            Timer
        }
    });

    // Intersection Observer for scroll animations
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('spec-item')) {
                    gsap.from(entry.target, { x: -50, opacity: 0, duration: 0.8, ease: "power2.out" });
                } else if (entry.target.classList.contains('testimonial-card')) {
                    gsap.from(entry.target, { y: 50, opacity: 0, duration: 1, ease: "power3.out" });
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.spec-item, .testimonial-card').forEach(el => observer.observe(el));

    // Form Submission logic
    const regForm = document.getElementById("registration-form");
    if (regForm) {
        regForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const formData = new FormData(regForm);
            console.log("Registration Data:", Object.fromEntries(formData.entries()));
            alert("Thank you for registering! Your CarePlus profile is being created.");
            regForm.reset();
        });
    }
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        const link = e.target.closest("[data-link]");
        if (link) {
            e.preventDefault();
            navigateTo(link.getAttribute("href"));
        }
    });

    const launchBtn = document.getElementById("launch-btn");
    if (launchBtn) {
        launchBtn.addEventListener("click", () => {
            navigateTo("/registration");
        });
    }

    router();
});
