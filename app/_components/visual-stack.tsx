"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

import { cn } from "@/_lib/utils";

type PreviewCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

function PreviewCard({ title, description, children }: PreviewCardProps) {
  return (
    <div className="rounded-3xl border border-border bg-white/80 p-4 shadow-soft">
      <div className="space-y-1">
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-secondary/40">
        {children}
      </div>
    </div>
  );
}

function ThreePreview({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0x1f2933,
      roughness: 0.35,
      metalness: 0.3
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
    mainLight.position.set(2, 2, 3);
    scene.add(mainLight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();
    window.addEventListener("resize", resize);

    let frameId = 0;
    const animate = () => {
      mesh.rotation.x += 0.004;
      mesh.rotation.y += 0.006;
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className={cn("h-52 w-full", className)} />;
}

export function VisualStack() {
  return (
    <div className="grid gap-6">
      <PreviewCard
        title="Three.js"
        description="Rendu temps reel pour les visuels generatifs."
      >
        <ThreePreview />
      </PreviewCard>
    </div>
  );
}
