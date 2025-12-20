"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    // No fog for this sharp tech look, or very subtle
    // scene.fog = new THREE.FogExp2(0x0b0b0c, 0.001);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 8;
    camera.position.y = 2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Limit pixel ratio for performance on mobile
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pixelRatio);
    
    container.appendChild(renderer.domElement);

    // Simplify geometry for mobile if needed, but 40x40 is okay.
    const isMobile = window.innerWidth < 768;
    const segments = isMobile ? 20 : 40;
    
    // Create a wireframe plane
    const geometry = new THREE.PlaneGeometry(20, 20, segments, segments); // Width, Height, SegmentsX, SegmentsY
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xC8A96A, // Champagne Gold
      wireframe: true,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });

    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2.5; // Tilt it
    scene.add(plane);

    // Initial positions for wave animation
    const originalPositions = new Float32Array(geometry.attributes.position.array);
    
    // Mouse interaction
    const mouse = new THREE.Vector2();
    const targetMouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouseMove);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth mouse follow
      mouse.x += (targetMouse.x - mouse.x) * 0.05;
      mouse.y += (targetMouse.y - mouse.y) * 0.05;

      const positions = geometry.attributes.position.array;

      for (let i = 0; i < positions.length; i += 3) {
        // x, y, z are current vertex coordinates (remember plane is rotated, so Z is up/down relative to plane normal)
        // But since we use PlaneGeometry, Z is initially 0.
        
        const x = originalPositions[i];
        // const y = originalPositions[i + 1]; 
        
        // Create wave effect based on X and Time
        const waveX = 0.5 * Math.sin(x * 0.5 + time * 0.5);
        const waveY = 0.5 * Math.cos(originalPositions[i+1] * 0.5 + time * 0.3);
        
        // Mouse influence
        const dist = Math.sqrt(Math.pow(x - mouse.x * 10, 2) + Math.pow(originalPositions[i+1] - mouse.y * 10, 2));
        const mouseEffect = Math.max(0, 5 - dist) * 0.3 * Math.sin(time * 2);

        // Update Z (which is vertical because of rotation)
        // @ts-ignore
        positions[i + 2] = originalPositions[i + 2] + waveX + waveY + mouseEffect;
      }
      geometry.attributes.position.needsUpdate = true;

      // Gentle rotation of the whole plane
      plane.rotation.z = time * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      container.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-0 pointer-events-none"
    />
  );
}