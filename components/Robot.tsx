'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createStudio } from '@/lib/robot-model';
import { gazeFromPointer, smoothTracking } from '@/lib/robot-motion';

export default function Robot() {
  const host = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const reduceRef = useRef(reduce);
  useEffect(() => { reduceRef.current = reduce; }, [reduce]);

  useEffect(() => {
    if (!host.current) return;
    const container = host.current;
    setReady(false);

    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch { return; }

    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.domElement.style.opacity = '0';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const environment = createStudio(renderer);
    scene.environment = environment.texture;

    const key = new THREE.DirectionalLight(0xfff5e6, 1.5);
    key.position.set(-3, 5, 4);
    scene.add(key, new THREE.HemisphereLight(0xffffff, 0x666a73, 1.2));

    const fill = new THREE.PointLight(0xffffff, 0.7, 20, 2);
    fill.position.set(3, 2.5, 3);
    scene.add(fill);

    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 30);
    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / Math.max(height, 1);
      camera.position.set(0, 2.65, Math.max(7.6, 6.1 / camera.aspect));
      camera.lookAt(0, 2.2, 0);
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    const pointer = { x: 0, y: 0, active: false };
    const hero = container.closest('.hero');
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || reduceRef.current) return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      const heroBounds = hero?.getBoundingClientRect();
      pointer.active = !!heroBounds && heroBounds.bottom > 100 && event.clientY < heroBounds.bottom;
    };
    const resetGaze = () => { pointer.active = false; };
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('blur', resetGaze);
    window.addEventListener('scroll', resetGaze, { passive: true });
    document.documentElement.addEventListener('pointerleave', resetGaze);

    let visible = true;
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    intersection.observe(container);

    const loader = new GLTFLoader();
    let robot: THREE.Group | null = null;
    let mixer: THREE.AnimationMixer | null = null;
    let headNode: THREE.Object3D | null = null;
    let torsoNode: THREE.Object3D | null = null;
    let rootNode: THREE.Group | null = null;

    loader.load(
      '/robot.glb',
      (gltf) => {
        rootNode = gltf.scene;
        robot = rootNode;
        robot.scale.setScalar(1.7);
        robot.position.y = -1.5;
        robot.rotation.y = -0.4;

        const foundHead = rootNode.getObjectByName('Head') ?? rootNode.getObjectByName('mixamorigHead') ?? rootNode.children.find((child) => child.name.toLowerCase().includes('head')) ?? rootNode;
        headNode = foundHead;
        torsoNode = rootNode.getObjectByName('Spine') ?? rootNode.getObjectByName('mixamorigSpine') ?? rootNode.children.find((child) => child.name.toLowerCase().includes('spine')) ?? rootNode;

        robot.traverse((child) => {
          if ('isMesh' in child && child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(robot);
        mixer = new THREE.AnimationMixer(robot);
        gltf.animations.forEach((clip) => {
          mixer?.clipAction(clip).play();
        });
      },
      undefined,
      () => {
        // Ignore failed load: the stage stays empty rather than crashing the page.
      }
    );

    const projectedEyes = new THREE.Vector3();
    let frame = 0;
    let previous = 0;
    let contextAvailable = true;
    let presented = false;

    function render(now: number) {
      frame = requestAnimationFrame(render);
      const delta = Math.min((now - previous) / 1000, 0.05);
      previous = now;

      if (!visible || document.hidden || !contextAvailable) return;

      if (mixer) mixer.update(delta);

      let targetYaw = 0;
      let targetPitch = 0;
      if (robot && pointer.active && !reduceRef.current) {
        robot.updateMatrixWorld(true);
        projectedEyes.set(0, 1.35, 0.55);
        if (headNode) {
          const headWorld = new THREE.Vector3();
          headNode.getWorldPosition(headWorld);
          projectedEyes.copy(headWorld).add(new THREE.Vector3(0, 0.45, 0.2));
        }
        projectedEyes.project(camera);
        const bounds = container.getBoundingClientRect();
        const eyeX = bounds.left + (projectedEyes.x + 1) * bounds.width / 2;
        const eyeY = bounds.top + (1 - projectedEyes.y) * bounds.height / 2;
        const gaze = gazeFromPointer(pointer.x, pointer.y, eyeX, eyeY, Math.max(bounds.width * 1.05, 420));
        targetYaw = gaze.yaw;
        targetPitch = gaze.pitch;
      }

      const bodyYaw = THREE.MathUtils.clamp(targetYaw * 0.22, -0.2, 0.2);
      const bodyPitch = THREE.MathUtils.clamp(-targetPitch * 0.18, -0.12, 0.12);

      if (rootNode) {
        rootNode.rotation.y = smoothTracking(rootNode.rotation.y, -0.4, delta);
      }
      if (torsoNode) {
        torsoNode.rotation.y = smoothTracking(torsoNode.rotation.y, bodyYaw, delta);
        torsoNode.rotation.x = smoothTracking(torsoNode.rotation.x, bodyPitch, delta);
      }
      if (headNode) {
        headNode.rotation.y = smoothTracking(headNode.rotation.y, targetYaw, delta);
        headNode.rotation.x = smoothTracking(headNode.rotation.x, targetPitch, delta);
      }

      renderer.render(scene, camera);
      if (!presented) {
        renderer.domElement.style.opacity = '1';
        presented = true;
        setReady(true);
      }
    }

    frame = requestAnimationFrame(render);

    const lost = (event: Event) => {
      event.preventDefault();
      contextAvailable = false;
      renderer.domElement.style.opacity = '0';
      setReady(false);
    };
    const restored = () => {
      contextAvailable = true;
      presented = false;
      resize();
    };

    renderer.domElement.addEventListener('webglcontextlost', lost);
    renderer.domElement.addEventListener('webglcontextrestored', restored);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('blur', resetGaze);
      window.removeEventListener('scroll', resetGaze);
      document.documentElement.removeEventListener('pointerleave', resetGaze);
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      renderer.domElement.removeEventListener('webglcontextrestored', restored);
      if (mixer) mixer.stopAllAction();
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="robot-visual">
    <div className="robot-backdrop" aria-hidden="true" />
    <div className="robot-stage" ref={host} data-ready={ready} role="group" tabIndex={-1}
      aria-label="Interactive robot. Move your cursor to make the head and torso track with you.">
    </div>
  </div>;
}
