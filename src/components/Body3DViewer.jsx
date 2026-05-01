import { Suspense, useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';

const MODELS = {
  female: '/body-female.glb',
  male:   '/body-male.glb',
};

useGLTF.preload(MODELS.female);
useGLTF.preload(MODELS.male);

// Firestore stores plain {x,y,z} — convert to THREE.Vector3
function v3(o) {
  return new THREE.Vector3(o?.x ?? 0, o?.y ?? 0, o?.z ?? 0);
}

function makeOrientation(point, normal) {
  const helper = new THREE.Object3D();
  helper.position.copy(point);
  helper.lookAt(new THREE.Vector3().addVectors(point, normal));
  return helper.rotation.clone();
}

// ── Body model: loads GLB, recreates saved decals, read-only ─────────────────

function BodyModel({ gender, placement3d, texture }) {
  const { scene } = useGLTF(MODELS[gender]);

  const { cloned, groupScale, groupPos } = useMemo(() => {
    const c = scene.clone(true);
    const box = new THREE.Box3().setFromObject(c, true);
    const h = box.max.y - box.min.y;
    const s = h > 0.001 ? 2.2 / h : 1;
    const mid = box.getCenter(new THREE.Vector3()).multiplyScalar(s);
    return { cloned: c, groupScale: s, groupPos: [-mid.x, -mid.y, -mid.z] };
  }, [scene]);

  const groupRef   = useRef();
  const [geoms, setGeoms] = useState([]);
  const builtFor   = useRef(null); // tracks which placement3d we've built for

  // Build DecalGeometry on the first frame after model mounts.
  // useFrame ensures matrixWorld is up-to-date before we raycast.
  useFrame(() => {
    if (!groupRef.current || builtFor.current === placement3d) return;
    builtFor.current = placement3d;

    const decalList = placement3d?.decals;
    if (!decalList?.length) { setGeoms([]); return; }

    groupRef.current.updateMatrixWorld(true);

    // Collect all meshes inside the model group
    const meshes = [];
    groupRef.current.traverse((obj) => { if (obj.isMesh) meshes.push(obj); });

    const rc = new THREE.Raycaster();
    const built = [];

    for (const d of decalList) {
      const pt  = v3(d.point);
      const n   = v3(d.normal).normalize();
      const sz  = d.size ?? placement3d.decalSize ?? 0.18;

      // Shoot a ray from slightly outside the surface toward the saved point
      rc.set(pt.clone().addScaledVector(n, 0.2), n.clone().negate());
      const hits = rc.intersectObjects(meshes);
      if (!hits.length) continue;

      try {
        built.push(
          new DecalGeometry(
            hits[0].object,
            pt,
            makeOrientation(pt, n),
            new THREE.Vector3(sz, sz, sz * 0.4),
          ),
        );
      } catch { /* skip if geometry fails */ }
    }

    setGeoms(built);
  });

  return (
    <>
      <group ref={groupRef} scale={groupScale} position={groupPos}>
        <primitive object={cloned} />
      </group>

      {/* Decals at scene root — DecalGeometry outputs world-space vertices */}
      {texture && geoms.map((geom, i) => (
        <mesh key={i} geometry={geom} renderOrder={2}>
          <meshBasicMaterial
            map={texture}
            transparent
            depthTest
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-4}
            polygonOffsetUnits={-4}
          />
        </mesh>
      ))}
    </>
  );
}

// ── Scene ─────────────────────────────────────────────────────────────────────

function Scene({ gender, placement3d, texture }) {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[2, 4, 3]} intensity={1.3} />
      <directionalLight position={[-2, 1, -2]} intensity={0.35} />
      <Suspense fallback={null}>
        <BodyModel gender={gender} placement3d={placement3d} texture={texture} />
      </Suspense>
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={0.3}
        maxDistance={8}
        target={[0, 0, 0]}
      />
    </>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

export default function Body3DViewer({ tatSrc, placement3d }) {
  const gender  = placement3d?.gender ?? 'female';

  const [texture,  setTexture]  = useState(null);
  const [texState, setTexState] = useState('idle');
  const texRef = useRef(null);

  useEffect(() => {
    if (!tatSrc) { setTexture(null); setTexState('idle'); return; }
    setTexState('loading');
    let alive = true;
    new THREE.TextureLoader().load(
      tatSrc,
      (t) => {
        if (!alive) { t.dispose(); return; }
        t.colorSpace = THREE.SRGBColorSpace;
        if (texRef.current) texRef.current.dispose();
        texRef.current = t;
        setTexture(t);
        setTexState('ready');
      },
      undefined,
      (err) => {
        if (!alive) return;
        console.error('[Body3DViewer] Textur konnte nicht geladen werden:', err);
        setTexState('error');
      },
    );
    return () => { alive = false; };
  }, [tatSrc]);

  return (
    <div className="body3d-wrap">
      {texState === 'error' && (
        <p className="body3d-hint body3d-hint-error">
          Bild konnte nicht geladen werden — Firebase Storage CORS prüfen
        </p>
      )}
      {texState === 'loading' && (
        <p className="body3d-hint">Motiv wird geladen …</p>
      )}

      <Canvas
        className="body3d-canvas"
        camera={{ position: [0, 0, 3.2], fov: 55, near: 0.01, far: 100 }}
        gl={{ antialias: true, alpha: true }}
        style={{ cursor: 'grab' }}
      >
        <Scene
          gender={gender}
          placement3d={placement3d}
          texture={texture}
        />
      </Canvas>

      <p className="body3d-hint" style={{ textAlign: 'center' }}>
        Ziehen zum Drehen · Scrollen zum Zoomen
      </p>
    </div>
  );
}
