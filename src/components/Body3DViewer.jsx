import { Suspense, useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';

const MODELS = {
  female: '/body-female.glb',
  male:   '/body-male.glb',
};

useGLTF.preload(MODELS.female);
useGLTF.preload(MODELS.male);

function makeOrientation(point, worldNormal) {
  const helper = new THREE.Object3D();
  helper.position.copy(point);
  helper.lookAt(new THREE.Vector3().addVectors(point, worldNormal));
  return helper.rotation.clone();
}

// ── Decal ─────────────────────────────────────────────────────────────────────

function TattooDecal({ mesh, point, normal, size, texture }) {
  const geom = useMemo(() => {
    if (!mesh || !point || !normal) return null;
    try {
      return new DecalGeometry(
        mesh,
        point,
        makeOrientation(point, normal),
        new THREE.Vector3(size, size, size * 0.4),
      );
    } catch { return null; }
  }, [mesh, point, normal, size]);

  if (!geom || !texture) return null;
  return (
    <mesh geometry={geom} renderOrder={2}>
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
  );
}

// ── Body model ────────────────────────────────────────────────────────────────

function BodyModel({ gender, onPlace, canPlace }) {
  const { scene } = useGLTF(MODELS[gender]);

  // Clone + normalize to ~2.2 units tall, centered at origin
  const { cloned, groupPos, groupScale } = useMemo(() => {
    const c = scene.clone(true);
    const box = new THREE.Box3().setFromObject(c, true);
    const h = box.max.y - box.min.y;
    const s = h > 0.001 ? 2.2 / h : 1;
    const mid = box.getCenter(new THREE.Vector3()).multiplyScalar(s);
    return { cloned: c, groupScale: s, groupPos: [-mid.x, -mid.y, -mid.z] };
  }, [scene]);

  const handlePointerDown = useCallback(
    (e) => {
      e.stopPropagation();
      if (!canPlace || !e.face || !(e.object instanceof THREE.Mesh)) return;
      const mesh = e.object;
      const nm = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
      const wn = e.face.normal.clone().applyMatrix3(nm).normalize();
      onPlace({ mesh, point: e.point.clone(), normal: wn });
    },
    [canPlace, onPlace],
  );

  return (
    <group scale={groupScale} position={groupPos}>
      <primitive object={cloned} onPointerDown={handlePointerDown} />
    </group>
  );
}

// ── Three scene ───────────────────────────────────────────────────────────────

function Scene({ gender, decals, texture, onPlace }) {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[2, 4, 3]} intensity={1.3} castShadow={false} />
      <directionalLight position={[-2, 1, -2]} intensity={0.35} />
      <Suspense fallback={null}>
        <BodyModel gender={gender} onPlace={onPlace} canPlace={!!texture} />
      </Suspense>
      {/* Decals live at scene root — DecalGeometry outputs world-space vertices */}
      {texture && decals.map((d, i) => (
        <TattooDecal key={i} {...d} texture={texture} />
      ))}
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

// 'idle' | 'loading' | 'ready' | 'error'
const TEX_HINTS = {
  idle:    'Wähle oben ein Motiv aus — dann hier auf den Körper klicken',
  loading: 'Motiv wird geladen …',
  ready:   'Klick auf den Körper um das Motiv zu platzieren · Ziehen zum Drehen',
  error:   'Bild konnte nicht geladen werden → Firebase Storage CORS konfigurieren',
};

export default function Body3DViewer({ tatSrc }) {
  const [gender,    setGender]    = useState('female');
  const [decals,    setDecals]    = useState([]);
  const [texture,   setTexture]   = useState(null);
  const [texState,  setTexState]  = useState('idle');
  const [decalSize, setDecalSize] = useState(0.18);
  const texRef    = useRef(null);
  const sizeRef   = useRef(decalSize);
  sizeRef.current = decalSize;

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
        console.error('[Body3DViewer] Textur konnte nicht geladen werden (CORS?):', err);
        setTexState('error');
      },
    );
    return () => { alive = false; };
  }, [tatSrc]);

  const changeGender = (g) => { setGender(g); setDecals([]); };
  const handlePlace  = useCallback(
    (d) => setDecals((p) => [...p, { ...d, size: sizeRef.current }]),
    [],
  );

  return (
    <div className="body3d-wrap">
      <div className="body3d-controls">
        <div className="body3d-toggle">
          <button
            className={`body3d-btn${gender === 'female' ? ' active' : ''}`}
            onClick={() => changeGender('female')}
          >Frau</button>
          <button
            className={`body3d-btn${gender === 'male' ? ' active' : ''}`}
            onClick={() => changeGender('male')}
          >Mann</button>
        </div>

        <label className="body3d-size-lbl">
          <span>Größe</span>
          <input
            type="range" min={0.05} max={0.4} step={0.01}
            value={decalSize}
            onChange={(e) => setDecalSize(Number(e.target.value))}
          />
        </label>

        {decals.length > 0 && (
          <button className="body3d-clear" onClick={() => setDecals([])}>
            × löschen
          </button>
        )}
      </div>

      <p className={`body3d-hint${texState === 'error' ? ' body3d-hint-error' : ''}`}>
        {TEX_HINTS[texState]}
      </p>

      <Canvas
        className="body3d-canvas"
        camera={{ position: [0, 0, 3.2], fov: 55, near: 0.01, far: 100 }}
        gl={{ antialias: true, alpha: true }}
        style={{ cursor: texState === 'ready' ? 'crosshair' : 'grab' }}
      >
        <Scene
          gender={gender}
          decals={decals}
          texture={texture}
          onPlace={handlePlace}
        />
      </Canvas>
    </div>
  );
}
