import { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// ── Nav-Positionen im 3D-Raum (entsprechen den Dial-Winkeln) ─────────────────
// angle: -90 = oben, 54 = unten-rechts, usw. → in 3D-Koordinaten umrechnen
const NAV_TARGETS = {
  gallery:      new THREE.Vector3(-2.8,  1.2, 2),   // -90°  links oben
  about:        new THREE.Vector3( 1.8,  1.0, 2),   // -18°  rechts oben
  booking:      new THREE.Vector3( 2.2, -0.8, 2),   //  54°  rechts unten
  testimonials: new THREE.Vector3(-1.2, -1.4, 2),   // 126°  links unten
  socials:      new THREE.Vector3(-2.5, -0.2, 2),   // 198°  links
};

const DEFAULT_TARGET = new THREE.Vector3(0, 0, 4); // gerade aus (Besucher)

// ── 3D-Modell mit Look-At ─────────────────────────────────────────────────────
function HeadModel({ hoveredNav }) {
  const { scene } = useGLTF('/kleopatra-3d.glb');
  const headBoneRef  = useRef(null);
  const currentLook  = useRef(new THREE.Vector3(0, 0, 4));
  const targetLook   = useRef(new THREE.Vector3(0, 0, 4));
  const modelRef     = useRef();

  // Head-Bone beim ersten Laden finden
  useEffect(() => {
    scene.traverse((obj) => {
      const name = obj.name.toLowerCase();
      if (
        obj.isBone &&
        (name.includes('head') || name.includes('kopf') || name.includes('neck'))
      ) {
        // Bevorzuge "head" gegenüber "neck"
        if (!headBoneRef.current || name.includes('head')) {
          headBoneRef.current = obj;
        }
      }
    });
    if (!headBoneRef.current) {
      // Fallback: gesamtes Modell rotieren wenn kein Bone gefunden
      headBoneRef.current = modelRef.current;
    }
  }, [scene]);

  // Ziel aktualisieren wenn Hover-Zustand sich ändert
  useEffect(() => {
    const target = hoveredNav
      ? NAV_TARGETS[hoveredNav] ?? DEFAULT_TARGET
      : DEFAULT_TARGET;
    targetLook.current.copy(target);
  }, [hoveredNav]);

  // Smooth Look-At pro Frame
  useFrame(() => {
    if (!headBoneRef.current) return;
    // Sanftes Interpolieren zum Ziel (Trägheits-Effekt)
    currentLook.current.lerp(targetLook.current, 0.06);
    headBoneRef.current.lookAt(currentLook.current);
  });

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={1.8}
      position={[0, -1.6, 0]}
    />
  );
}

// ── Licht-Setup ───────────────────────────────────────────────────────────────
function Lighting() {
  return (
    <>
      {/* Goldenes Hauptlicht von vorne oben */}
      <directionalLight
        position={[1, 3, 3]}
        intensity={1.4}
        color="#f0c860"
        castShadow
      />
      {/* Weiches Fülllicht von links */}
      <directionalLight
        position={[-3, 1, 1]}
        intensity={0.4}
        color="#d4a537"
      />
      {/* Dunkles Gegenlicht für Tiefe */}
      <directionalLight
        position={[0, -2, -3]}
        intensity={0.2}
        color="#0a0806"
      />
      <ambientLight intensity={0.3} color="#f5ead4" />
    </>
  );
}

// ── Kamera-Kontrolle: leichter Parallax auf Mouse-Move ────────────────────────
function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame(() => {
    camera.position.x += (mouse.current.x * 0.3 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.current.y * 0.2 - camera.position.y + 1.2) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ── Haupt-Export ──────────────────────────────────────────────────────────────
export default function KleopatraHead3D({ hoveredNav }) {
  return (
    <Canvas
      camera={{ position: [0, 1.2, 4.5], fov: 38 }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
      gl={{ alpha: true, antialias: true }}
    >
      <Lighting />
      <CameraRig />
      <Suspense fallback={null}>
        <HeadModel hoveredNav={hoveredNav} />
        <ContactShadows
          position={[0, -1.65, 0]}
          opacity={0.35}
          scale={4}
          blur={2.5}
          color="#d4a537"
        />
        <Environment preset="sunset" />
      </Suspense>
    </Canvas>
  );
}

// GLB vorladen
useGLTF.preload('/kleopatra-3d.glb');
