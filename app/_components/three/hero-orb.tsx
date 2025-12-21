"use client";

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";

export interface HeroOrbRef {
  setScale: (scale: number) => void;
  setOpacity: (opacity: number) => void;
}

interface HeroOrbProps {
  className?: string;
}

export const HeroOrb = forwardRef<HeroOrbRef, HeroOrbProps>(({ className }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetMouseRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const opacityRef = useRef(1);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const [isReady, setIsReady] = useState(false);

  useImperativeHandle(ref, () => ({
    setScale: (scale: number) => {
      scaleRef.current = scale;
    },
    setOpacity: (opacity: number) => {
      opacityRef.current = opacity;
    },
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Sphère lisse haute résolution
    const geometry = new THREE.SphereGeometry(1.5, 256, 256);

    // Shader amélioré avec texture procédurale riche
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uColor1: { value: new THREE.Color(0xd4af37) }, // Or riche
        uColor2: { value: new THREE.Color(0xb8860b) }, // Or foncé
        uColor3: { value: new THREE.Color(0xffd700) }, // Or brillant
        uOpacity: { value: 1.0 },
      },
      vertexShader: `
        uniform float uTime;
        uniform vec2 uMouse;

        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying float vNoise;

        // Simplex 3D Noise
        vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);

          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);

          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;

          i = mod(i, 289.0);
          vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));

          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;

          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);

          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);

          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);

          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));

          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);

          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;

          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vUv = uv;

          // Multiple layers of noise for organic displacement
          float noise1 = snoise(position * 2.0 + uTime * 0.15);
          float noise2 = snoise(position * 4.0 - uTime * 0.1) * 0.5;
          float noise3 = snoise(position * 8.0 + uTime * 0.2) * 0.25;

          float totalNoise = noise1 + noise2 + noise3;
          vNoise = totalNoise;

          // Displacement pour surface organique
          float displacement = totalNoise * 0.08;
          vec3 newPosition = position + normal * displacement;

          vWorldPosition = (modelMatrix * vec4(newPosition, 1.0)).xyz;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform float uOpacity;

        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying float vNoise;

        // Noise pour texture
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise2D(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);

          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));

          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;

          for(int i = 0; i < 6; i++) {
            value += amplitude * noise2D(p * frequency);
            amplitude *= 0.5;
            frequency *= 2.0;
          }
          return value;
        }

        void main() {
          vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
          vec3 normal = normalize(vNormal);

          // Fresnel - bords lumineux
          float fresnel = pow(1.0 - max(dot(viewDirection, normal), 0.0), 4.0);

          // Texture procédurale - grain métallique
          vec2 texCoord = vUv * 15.0 + uTime * 0.05;
          float grain = fbm(texCoord);
          float grain2 = fbm(texCoord * 2.0 + 100.0);

          // Lignes de lumière qui bougent
          float lightLines = sin(vUv.x * 30.0 + uTime * 0.5) * 0.5 + 0.5;
          lightLines *= sin(vUv.y * 20.0 - uTime * 0.3) * 0.5 + 0.5;

          // Gradient de base
          float gradient = (vPosition.y + 1.5) / 3.0;
          gradient = smoothstep(0.0, 1.0, gradient);

          // Mix des couleurs avec noise
          vec3 baseColor = mix(uColor2, uColor1, gradient + vNoise * 0.3);
          baseColor = mix(baseColor, uColor3, grain * 0.3);

          // Reflets spéculaires simulés
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float specular = pow(max(dot(reflect(-lightDir, normal), viewDirection), 0.0), 32.0);

          // Reflet secondaire
          vec3 lightDir2 = normalize(vec3(-0.5, 0.5, 0.8));
          float specular2 = pow(max(dot(reflect(-lightDir2, normal), viewDirection), 0.0), 16.0);

          // Combine tout
          vec3 finalColor = baseColor;

          // Ajoute les highlights
          finalColor += uColor3 * specular * 0.8;
          finalColor += uColor1 * specular2 * 0.4;

          // Fresnel glow
          finalColor = mix(finalColor, uColor3, fresnel * 0.6);

          // Grain subtil pour texture métallique
          finalColor *= 0.9 + grain2 * 0.2;

          // Light lines subtiles
          finalColor += uColor3 * lightLines * 0.1 * fresnel;

          // Alpha avec fresnel pour bords doux
          float alpha = uOpacity * (0.85 + fresnel * 0.15);

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.FrontSide,
    });

    materialRef.current = material;

    const mesh = new THREE.Mesh(geometry, material);
    meshRef.current = mesh;
    scene.add(mesh);

    // Mouse handler
    const handleMouseMove = (e: MouseEvent) => {
      targetMouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05;

      material.uniforms.uTime.value = elapsed;
      material.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);
      material.uniforms.uOpacity.value = opacityRef.current;

      mesh.scale.setScalar(scaleRef.current);

      // Rotation lente + influence souris
      mesh.rotation.x = elapsed * 0.03 + mouseRef.current.y * 0.15;
      mesh.rotation.y = elapsed * 0.05 + mouseRef.current.x * 0.15;

      renderer.render(scene, camera);
    };

    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    setTimeout(() => {
      setIsReady(true);
      animate();
    }, 100);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      geometry.dispose();
      material.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        opacity: isReady ? 1 : 0,
        transition: "opacity 1s ease-out",
      }}
    />
  );
});

HeroOrb.displayName = "HeroOrb";

export default HeroOrb;
