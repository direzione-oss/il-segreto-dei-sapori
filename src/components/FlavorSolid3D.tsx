import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Box,
  Compass,
  Eye,
  Maximize2,
  Minimize2,
  Orbit,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { DishSimulationResult, MOUTHFEEL_META, TASTE_META } from '../types/flavor';

interface FlavorSolid3DProps {
  simulation: DishSimulationResult;
  recipeName?: string;
}

export type SolidMode = 'all' | 'taste' | 'mouthfeel';

interface VertexDef {
  key: string;
  label: string;
  shortLabel: string;
  category: 'taste' | 'mouthfeel';
  color: string;
  dir: [number, number, number];
}

// 11 Assi Sensoriali distribuiti sulla sfera 3D
const AXES_11: VertexDef[] = [
  // 0: Apex superiore: Dolcezza (sweet)
  {
    key: 'sweet',
    label: TASTE_META.sweet.label,
    shortLabel: TASTE_META.sweet.short,
    category: 'taste',
    color: TASTE_META.sweet.color,
    dir: [0, 1, 0.1],
  },
  // Anello superiore (4 Gusti Primari, y = +0.35)
  // 1: Umami (destra-fronte)
  {
    key: 'umami',
    label: TASTE_META.umami.label,
    shortLabel: TASTE_META.umami.short,
    category: 'taste',
    color: TASTE_META.umami.color,
    dir: [0.85, 0.35, 0.38],
  },
  // 2: Sapidità (destra-retro)
  {
    key: 'salty',
    label: TASTE_META.salty.label,
    shortLabel: TASTE_META.salty.short,
    category: 'taste',
    color: TASTE_META.salty.color,
    dir: [0.55, 0.35, -0.75],
  },
  // 3: Acidità (sinistra-retro)
  {
    key: 'sour',
    label: TASTE_META.sour.label,
    shortLabel: TASTE_META.sour.short,
    category: 'taste',
    color: TASTE_META.sour.color,
    dir: [-0.55, 0.35, -0.75],
  },
  // 4: Amarezza (sinistra-fronte)
  {
    key: 'bitter',
    label: TASTE_META.bitter.label,
    shortLabel: TASTE_META.bitter.short,
    category: 'taste',
    color: TASTE_META.bitter.color,
    dir: [-0.85, 0.35, 0.38],
  },

  // Anello inferiore (5 attributi Mouthfeel, y = -0.35)
  // 5: Grassezza (fronte)
  {
    key: 'richness',
    label: MOUTHFEEL_META.richness.label,
    shortLabel: MOUTHFEEL_META.richness.short,
    category: 'mouthfeel',
    color: MOUTHFEEL_META.richness.color,
    dir: [0, -0.35, 0.93],
  },
  // 6: Cremosità (destra-fronte)
  {
    key: 'creaminess',
    label: MOUTHFEEL_META.creaminess.label,
    shortLabel: MOUTHFEEL_META.creaminess.short,
    category: 'mouthfeel',
    color: MOUTHFEEL_META.creaminess.color,
    dir: [0.88, -0.35, 0.32],
  },
  // 7: Succosità (destra-retro)
  {
    key: 'juiciness',
    label: MOUTHFEEL_META.juiciness.label,
    shortLabel: MOUTHFEEL_META.juiciness.short,
    category: 'mouthfeel',
    color: MOUTHFEEL_META.juiciness.color,
    dir: [0.55, -0.35, -0.75],
  },
  // 8: Croccantezza (sinistra-retro)
  {
    key: 'crunchiness',
    label: MOUTHFEEL_META.crunchiness.label,
    shortLabel: MOUTHFEEL_META.crunchiness.short,
    category: 'mouthfeel',
    color: MOUTHFEEL_META.crunchiness.color,
    dir: [-0.55, -0.35, -0.75],
  },
  // 9: Pungenza (sinistra-fronte)
  {
    key: 'pungency',
    label: MOUTHFEEL_META.pungency.label,
    shortLabel: MOUTHFEEL_META.pungency.short,
    category: 'mouthfeel',
    color: MOUTHFEEL_META.pungency.color,
    dir: [-0.88, -0.35, 0.32],
  },

  // 10: Apex inferiore: Astringenza (y = -1)
  {
    key: 'astringency',
    label: MOUTHFEEL_META.astringency.label,
    shortLabel: MOUTHFEEL_META.astringency.short,
    category: 'mouthfeel',
    color: MOUTHFEEL_META.astringency.color,
    dir: [0, -1, -0.1],
  },
];

// Triangolazione chiusa del poliedro 11D (18 facce)
const FACES_11: [number, number, number][] = [
  // Calotta Superiore (connessa al vertice 0: Dolce)
  [0, 1, 2],
  [0, 2, 3],
  [0, 3, 4],
  [0, 4, 1],

  // Cintura Equatoriale (tra anello superiore 1..4 e anello inferiore 5..9)
  [1, 5, 6],
  [1, 6, 2],
  [2, 6, 7],
  [2, 7, 3],
  [3, 7, 8],
  [3, 8, 4],
  [4, 8, 9],
  [4, 9, 1],
  [1, 9, 5],

  // Calotta Inferiore (connessa al vertice 10: Astringenza)
  [10, 6, 5],
  [10, 7, 6],
  [10, 8, 7],
  [10, 9, 8],
  [10, 5, 9],
];

// 5 Gusti Primari (Bipiramide a base triangolare/quadrata)
const AXES_5_TASTE: VertexDef[] = [
  { ...AXES_11[0], dir: [0, 1, 0] }, // Dolce (Nord)
  { ...AXES_11[1], dir: [1, 0, 0] }, // Umami (Est)
  { ...AXES_11[2], dir: [0, 0, -1] }, // Sapido (Sud)
  { ...AXES_11[3], dir: [-1, 0, 0] }, // Acido (Ovest)
  { ...AXES_11[4], dir: [0, -1, 0] }, // Amaro (Nadir)
];

const FACES_5_TASTE: [number, number, number][] = [
  [0, 1, 2],
  [0, 2, 3],
  [0, 3, 1],
  [4, 2, 1],
  [4, 3, 2],
  [4, 1, 3],
];

// 6 Mouthfeel (Ottaedro 3D regolare)
const AXES_6_MOUTHFEEL: VertexDef[] = [
  { ...AXES_11[5], dir: [0, 1, 0] }, // Grassezza (+Y)
  { ...AXES_11[6], dir: [1, 0, 0] }, // Cremosità (+X)
  { ...AXES_11[7], dir: [0, 0, 1] }, // Succosità (+Z)
  { ...AXES_11[8], dir: [-1, 0, 0] }, // Croccantezza (-X)
  { ...AXES_11[9], dir: [0, 0, -1] }, // Pungenza (-Z)
  { ...AXES_11[10], dir: [0, -1, 0] }, // Astringenza (-Y)
];

const FACES_6_MOUTHFEEL: [number, number, number][] = [
  [0, 1, 2],
  [0, 2, 3],
  [0, 3, 4],
  [0, 4, 1],
  [5, 2, 1],
  [5, 3, 2],
  [5, 4, 3],
  [5, 1, 4],
];

const MAX_RADIUS = 3.4;

export const FlavorSolid3D: React.FC<FlavorSolid3DProps> = ({
  simulation,
  recipeName = 'Piatto Corrente',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<SolidMode>('all');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [showCage, setShowCage] = useState<boolean>(true);
  const [showRawGhost, setShowRawGhost] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [hoveredAxis, setHoveredAxis] = useState<string | null>(null);

  // Label 2D proiettate
  const [projectedLabels, setProjectedLabels] = useState<
    Array<{
      key: string;
      label: string;
      shortLabel: string;
      value: number;
      rawValue: number;
      color: string;
      x: number;
      y: number;
      visible: boolean;
    }>
  >([]);

  // Riferimenti Three.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const solidGroupRef = useRef<THREE.Group | null>(null);
  const solidMeshRef = useRef<THREE.Mesh | null>(null);
  const solidEdgesRef = useRef<THREE.LineSegments | null>(null);
  const rawMeshRef = useRef<THREE.Mesh | null>(null);
  const cageGroupRef = useRef<THREE.Group | null>(null);
  const vertexPointsGroupRef = useRef<THREE.Group | null>(null);
  const requestFrameRef = useRef<number | null>(null);

  // Drag interaction
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraDistanceRef = useRef<number>(7.2);

  // Estrai valori percepiti e grezzi per ogni asse
  const { values, rawValues, activeAxes, activeFaces } = useMemo(() => {
    let axes = AXES_11;
    let faces = FACES_11;

    if (mode === 'taste') {
      axes = AXES_5_TASTE;
      faces = FACES_5_TASTE;
    } else if (mode === 'mouthfeel') {
      axes = AXES_6_MOUTHFEEL;
      faces = FACES_6_MOUTHFEEL;
    }

    const valMap: Record<string, number> = {};
    const rawMap: Record<string, number> = {};

    for (const ax of axes) {
      if (ax.category === 'taste') {
        const k = ax.key as keyof typeof simulation.perceived.taste;
        valMap[ax.key] = simulation.perceived.taste[k] ?? 0;
        rawMap[ax.key] = simulation.rawTaste[k] ?? 0;
      } else {
        const k = ax.key as keyof typeof simulation.perceived.mouthfeel;
        valMap[ax.key] = simulation.perceived.mouthfeel[k] ?? 0;
        rawMap[ax.key] = simulation.rawMouthfeel[k] ?? 0;
      }
    }

    return {
      values: valMap,
      rawValues: rawMap,
      activeAxes: axes,
      activeFaces: faces,
    };
  }, [simulation, mode]);

  // Calcola statistiche geometriche del solido
  const metrics = useMemo(() => {
    let totalScore = 0;
    let maxVal = -1;
    let dominantAxis: VertexDef = activeAxes[0];

    activeAxes.forEach((ax) => {
      const v = values[ax.key] ?? 0;
      totalScore += v;
      if (v > maxVal) {
        maxVal = v;
        dominantAxis = ax;
      }
    });

    const avg = totalScore / activeAxes.length;
    // Indice di volume (rapporto pienezza 0..100)
    const volumePercent = Math.min(100, Math.round((avg / 10) * 100));

    // Varianza / Asimmetria
    let variance = 0;
    activeAxes.forEach((ax) => {
      const v = values[ax.key] ?? 0;
      variance += Math.pow(v - avg, 2);
    });
    const stdDev = Math.sqrt(variance / activeAxes.length);
    const asymmetryIndex = (stdDev / 5).toFixed(2);

    return {
      volumePercent,
      dominantAxis,
      dominantVal: maxVal.toFixed(1),
      avgScore: avg.toFixed(1),
      asymmetryIndex,
    };
  }, [activeAxes, values]);

  // Inizializzazione Three.js
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight || (isExpanded ? 580 : 420);

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.8, cameraDistanceRef.current);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfef3c7, 2.2);
    dirLight1.position.set(6, 9, 8);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight2.position.set(-6, -4, -6);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xf59e0b, 1.8, 12);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // Gruppo Principale del Solido
    const solidGroup = new THREE.Group();
    // Inclinazione iniziale isometrica elegante
    solidGroup.rotation.x = 0.28;
    solidGroup.rotation.y = 0.52;
    scene.add(solidGroup);
    solidGroupRef.current = solidGroup;

    // Resize observer
    const handleResize = () => {
      if (!mount || !renderer || !camera) return;
      const newWidth = mount.clientWidth;
      const newHeight = mount.clientHeight || (isExpanded ? 580 : 420);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestFrameRef.current) cancelAnimationFrame(requestFrameRef.current);
      renderer.dispose();
      if (mount) mount.innerHTML = '';
    };
  }, [isExpanded]);

  // Aggiornamento Geometrie del Solido 3D
  useEffect(() => {
    const solidGroup = solidGroupRef.current;
    if (!solidGroup) return;

    // Rimuovi figli precedenti nel gruppo
    while (solidGroup.children.length > 0) {
      const obj = solidGroup.children[0];
      solidGroup.remove(obj);
    }

    // Helper: calcola coordinate vertici per un dato set di valori
    const computePositions = (valSource: Record<string, number>) => {
      return activeAxes.map((ax) => {
        const val = Math.max(0, Math.min(10, valSource[ax.key] ?? 0));
        // Scala raggio con valore minimo non nullo (0.12) per mantenere un solido tridimensionale coerente
        const radius = MAX_RADIUS * (0.14 + 0.86 * (val / 10));
        const vec = new THREE.Vector3(...ax.dir).normalize().multiplyScalar(radius);
        return vec;
      });
    };

    const perceivedPositions = computePositions(values);
    const rawPositions = computePositions(rawValues);

    // 1. GABBIA DI RIFERIMENTO 10/10 & ANELLI SCALA (CAGE)
    const cageGroup = new THREE.Group();
    cageGroupRef.current = cageGroup;

    // Posizioni al massimo (10/10)
    const maxPositions = activeAxes.map((ax) => {
      return new THREE.Vector3(...ax.dir).normalize().multiplyScalar(MAX_RADIUS);
    });

    // Wireframe massimo
    const cageGeometry = new THREE.BufferGeometry();
    const cageLineIndices: number[] = [];
    activeFaces.forEach(([a, b, c]) => {
      cageLineIndices.push(a, b, b, c, c, a);
    });
    cageGeometry.setFromPoints(maxPositions);
    cageGeometry.setIndex(cageLineIndices);

    const cageMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.14,
    });
    const cageLines = new THREE.LineSegments(cageGeometry, cageMaterial);
    cageGroup.add(cageLines);

    // Spoke radiali dal centro a ciascun vertice di scala 10
    maxPositions.forEach((maxPos, idx) => {
      const ax = activeAxes[idx];
      const spokeGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        maxPos,
      ]);
      const spokeMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(ax.color),
        transparent: true,
        opacity: 0.22,
      });
      cageGroup.add(new THREE.Line(spokeGeo, spokeMat));
    });

    cageGroup.visible = showCage;
    solidGroup.add(cageGroup);

    // 2. GHOST MESH DEL CHIMICO GREZZO (OPZIONALE)
    if (showRawGhost) {
      const rawGeometry = new THREE.BufferGeometry();
      const rawVertices: number[] = [];
      activeFaces.forEach(([a, b, c]) => {
        const pa = rawPositions[a];
        const pb = rawPositions[b];
        const pc = rawPositions[c];
        rawVertices.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z, pc.x, pc.y, pc.z);
      });
      rawGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(rawVertices, 3)
      );
      rawGeometry.computeVertexNormals();

      const rawMat = new THREE.MeshBasicMaterial({
        color: 0x94a3b8,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });
      const rawMesh = new THREE.Mesh(rawGeometry, rawMat);
      rawMeshRef.current = rawMesh;
      solidGroup.add(rawMesh);
    }

    // 3. IL VERO E PROPRIO SOLIDO 3D DELLA RICETTA (PERCEPITO)
    const solidGeometry = new THREE.BufferGeometry();
    const solidVertices: number[] = [];
    const solidColors: number[] = [];

    activeFaces.forEach(([a, b, c]) => {
      const pa = perceivedPositions[a];
      const pb = perceivedPositions[b];
      const pc = perceivedPositions[c];
      solidVertices.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z, pc.x, pc.y, pc.z);

      // Colori vertici sfumati
      const colA = new THREE.Color(activeAxes[a].color);
      const colB = new THREE.Color(activeAxes[b].color);
      const colC = new THREE.Color(activeAxes[c].color);
      solidColors.push(
        colA.r,
        colA.g,
        colA.b,
        colB.r,
        colB.g,
        colB.b,
        colC.r,
        colC.g,
        colC.b
      );
    });

    solidGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(solidVertices, 3)
    );
    solidGeometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(solidColors, 3)
    );
    solidGeometry.computeVertexNormals();

    // Materiale traslucido gioiello ambrato / colorato
    const solidMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      vertexColors: true,
      roughness: 0.18,
      metalness: 0.15,
      transmission: 0.35,
      ior: 1.45,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide,
      clearcoat: 0.6,
      clearcoatRoughness: 0.15,
    });

    const solidMesh = new THREE.Mesh(solidGeometry, solidMaterial);
    solidMeshRef.current = solidMesh;
    solidGroup.add(solidMesh);

    // Spigoli marcati e luminosi del solido
    const edgesGeometry = new THREE.BufferGeometry();
    const edgeLines: number[] = [];
    activeFaces.forEach(([a, b, c]) => {
      const pa = perceivedPositions[a];
      const pb = perceivedPositions[b];
      const pc = perceivedPositions[c];
      edgeLines.push(
        pa.x, pa.y, pa.z, pb.x, pb.y, pb.z,
        pb.x, pb.y, pb.z, pc.x, pc.y, pc.z,
        pc.x, pc.y, pc.z, pa.x, pa.y, pa.z
      );
    });
    edgesGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(edgeLines, 3)
    );
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.75,
      linewidth: 2,
    });
    const solidEdges = new THREE.LineSegments(edgesGeometry, edgesMat);
    solidEdgesRef.current = solidEdges;
    solidGroup.add(solidEdges);

    // Sfere luminose sui vertici (nodi del cristallo sensoriale)
    const vertexPointsGroup = new THREE.Group();
    vertexPointsGroupRef.current = vertexPointsGroup;

    perceivedPositions.forEach((pos, idx) => {
      const ax = activeAxes[idx];
      const v = values[ax.key] ?? 0;
      const isHovered = hoveredAxis === ax.key;

      // Sfera del nodo
      const sphereRadius = 0.08 + (v / 10) * 0.05 + (isHovered ? 0.06 : 0);
      const sphereGeo = new THREE.SphereGeometry(sphereRadius, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(ax.color),
        emissive: new THREE.Color(ax.color),
        emissiveIntensity: isHovered ? 0.9 : 0.45,
        roughness: 0.2,
      });
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.position.copy(pos);
      vertexPointsGroup.add(sphereMesh);

      // Linea di spinta dal centro al vertice percepito
      const spokeGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        pos,
      ]);
      const spokeMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(ax.color),
        transparent: true,
        opacity: isHovered ? 0.9 : 0.55,
      });
      vertexPointsGroup.add(new THREE.Line(spokeGeo, spokeMat));
    });

    solidGroup.add(vertexPointsGroup);
  }, [activeAxes, activeFaces, values, rawValues, showCage, showRawGhost, hoveredAxis]);

  // Loop di rendering e proiezione etichette 3D -> 2D
  useEffect(() => {
    const solidGroup = solidGroupRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const mount = mountRef.current;
    const scene = sceneRef.current;

    if (!solidGroup || !camera || !renderer || !mount || !scene) return;

    let animId: number;

    const renderLoop = () => {
      // Auto-rotazione fluida
      if (autoRotate && !isDraggingRef.current) {
        solidGroup.rotation.y += 0.0055;
      }

      renderer.render(scene, camera);

      // Calcola posizione 2D a schermo per ogni vertice
      const width = mount.clientWidth;
      const height = mount.clientHeight || (isExpanded ? 580 : 420);

      const labels = activeAxes.map((ax) => {
        const val = Math.max(0, Math.min(10, values[ax.key] ?? 0));
        const raw = Math.max(0, Math.min(10, rawValues[ax.key] ?? 0));
        const radius = MAX_RADIUS * (0.14 + 0.86 * (val / 10));

        // Punto vertice nel sistema di coordinate del gruppo
        const localPos = new THREE.Vector3(...ax.dir)
          .normalize()
          .multiplyScalar(radius * 1.15); // Leggermente esterno per leggibilità

        // Trasforma in coordinate mondiali e proietta nella telecamera
        const worldPos = localPos.clone().applyMatrix4(solidGroup.matrixWorld);
        const projected = worldPos.clone().project(camera);

        const x = (projected.x * 0.5 + 0.5) * width;
        const y = (-projected.y * 0.5 + 0.5) * height;
        const visible = projected.z < 1.0;

        return {
          key: ax.key,
          label: ax.label,
          shortLabel: ax.shortLabel,
          value: val,
          rawValue: raw,
          color: ax.color,
          x,
          y,
          visible,
        };
      });

      setProjectedLabels(labels);

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    requestFrameRef.current = animId;

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [autoRotate, activeAxes, values, rawValues, isExpanded]);

  // Gestione rotazione manuale via mouse/touch
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !solidGroupRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    solidGroupRef.current.rotation.y += deltaX * 0.009;
    solidGroupRef.current.rotation.x += deltaY * 0.009;

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Touch drag
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      previousMousePositionRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || !solidGroupRef.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
    const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;

    solidGroupRef.current.rotation.y += deltaX * 0.011;
    solidGroupRef.current.rotation.x += deltaY * 0.011;

    previousMousePositionRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Zoom rotella
  const handleWheel = (e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    const zoomFactor = e.deltaY * 0.005;
    cameraDistanceRef.current = Math.max(
      4.2,
      Math.min(13.5, cameraDistanceRef.current + zoomFactor)
    );
    cameraRef.current.position.set(0, 1.8, cameraDistanceRef.current);
    cameraRef.current.lookAt(0, 0, 0);
  };

  // Reset orientamento
  const handleResetOrientation = () => {
    if (!solidGroupRef.current || !cameraRef.current) return;
    solidGroupRef.current.rotation.set(0.28, 0.52, 0);
    cameraDistanceRef.current = 7.2;
    cameraRef.current.position.set(0, 1.8, 7.2);
    cameraRef.current.lookAt(0, 0, 0);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d1017]/95 shadow-2xl backdrop-blur-xl">
      {/* Top Header Card */}
      <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-300 shadow-[0_0_20px_rgba(217,155,67,0.2)]">
            <Orbit className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-wide text-[#f6f1e7]">
                Solido Sensoriale Tridimensionale (3D Flavor Solid)
              </h3>
              <span className="rounded-full border border-amber-400/30 bg-amber-500/15 px-2 py-0.5 font-code text-[10px] font-bold uppercase tracking-wider text-amber-300">
                {recipeName}
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Trascina con il mouse o il tocco per ruotare il solido geometrico calcolato su ogni
              spigolo sensoriale della ricetta.
            </p>
          </div>
        </div>

        {/* Toolbar Controlli 3D */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Selettore Modalità Assi */}
          <div className="flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setMode('all')}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                mode === 'all'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Mostra tutti gli 11 assi (5 Gusti + 6 Mouthfeel)"
            >
              Completo 11D
            </button>
            <button
              type="button"
              onClick={() => setMode('taste')}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                mode === 'taste'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Isola i 5 Gusti Primari nel prisma 3D"
            >
              5 Gusti
            </button>
            <button
              type="button"
              onClick={() => setMode('mouthfeel')}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                mode === 'mouthfeel'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Isola i 6 parametri tattili e mouthfeel"
            >
              6 Mouthfeel
            </button>
          </div>

          {/* Toggle Auto-Rotazione */}
          <button
            type="button"
            onClick={() => setAutoRotate((v) => !v)}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
              autoRotate
                ? 'border-amber-400/40 bg-amber-500/15 text-amber-200'
                : 'border-white/10 bg-white/[0.04] text-stone-400 hover:text-stone-200'
            }`}
            title={autoRotate ? 'Pausa rotazione continua' : 'Avvia rotazione continua'}
          >
            {autoRotate ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            <span className="hidden sm:inline">{autoRotate ? 'Pausa' : 'Ruota'}</span>
          </button>

          {/* Toggle Gabbia di Riferimento 10/10 */}
          <button
            type="button"
            onClick={() => setShowCage((v) => !v)}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
              showCage
                ? 'border-amber-400/40 bg-amber-500/15 text-amber-200'
                : 'border-white/10 bg-white/[0.04] text-stone-400 hover:text-stone-200'
            }`}
            title="Mostra o nascondi la gabbia di riferimento del massimo punteggio"
          >
            <Box className="h-3 w-3" />
            <span className="hidden sm:inline">Gabbia</span>
          </button>

          {/* Toggle Chimico Grezzo */}
          <button
            type="button"
            onClick={() => setShowRawGhost((v) => !v)}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
              showRawGhost
                ? 'border-sky-400/40 bg-sky-500/15 text-sky-200'
                : 'border-white/10 bg-white/[0.04] text-stone-400 hover:text-stone-200'
            }`}
            title="Mostra il solido fantasma dei valori chimici grezzi prima della modulazione"
          >
            <Eye className="h-3 w-3" />
            <span className="hidden sm:inline">Grezzo</span>
          </button>

          {/* Reset Orientamento */}
          <button
            type="button"
            onClick={handleResetOrientation}
            className="rounded-lg border border-white/10 bg-white/[0.04] p-1.5 text-stone-400 transition hover:bg-white/10 hover:text-stone-200"
            title="Reimposta visuale iniziale"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Toggle Espandi Altezza */}
          <button
            type="button"
            onClick={() => setIsExpanded((v) => !v)}
            className="rounded-lg border border-white/10 bg-white/[0.04] p-1.5 text-stone-400 transition hover:bg-white/10 hover:text-stone-200"
            title={isExpanded ? 'Riduci dimensione' : 'Espandi visuale'}
          >
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div
        className="relative w-full cursor-grab active:cursor-grabbing select-none"
        style={{ height: isExpanded ? '580px' : '440px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <div ref={mountRef} className="h-full w-full" />

        {/* Floating 3D Vertex Labels Overlay */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {projectedLabels.map((lbl) => {
            if (!lbl.visible) return null;
            const isHovered = hoveredAxis === lbl.key;

            return (
              <div
                key={lbl.key}
                style={{
                  left: `${lbl.x}px`,
                  top: `${lbl.y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`pointer-events-auto absolute transition-transform duration-150 ${
                  isHovered ? 'scale-110 z-20' : 'scale-100 z-10'
                }`}
                onMouseEnter={() => setHoveredAxis(lbl.key)}
                onMouseLeave={() => setHoveredAxis(null)}
              >
                <div
                  className="flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold shadow-lg backdrop-blur-md transition-colors"
                  style={{
                    backgroundColor: isHovered
                      ? 'rgba(15, 23, 42, 0.95)'
                      : 'rgba(10, 13, 18, 0.78)',
                    borderColor: isHovered ? lbl.color : 'rgba(255, 255, 255, 0.16)',
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: lbl.color }}
                  />
                  <span className="text-stone-200 font-medium">{lbl.shortLabel}</span>
                  <span
                    className="font-code font-bold text-xs"
                    style={{ color: lbl.color }}
                  >
                    {lbl.value.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Suggerimento d'uso interattivo */}
        <div className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-2 rounded-xl border border-white/10 bg-black/50 px-3 py-1.5 text-[11px] text-stone-400 backdrop-blur-md">
          <Compass className="h-3.5 w-3.5 text-amber-400" />
          <span>Ruota: Trascina 3D &bull; Zoom: Rotella mouse / pinch</span>
        </div>
      </div>

      {/* Footer Statistiche Geometriche del Solido */}
      <div className="grid grid-cols-2 gap-3 border-t border-white/10 bg-[#090b0f] p-4 text-xs sm:grid-cols-4">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-stone-400">
            Pienezza del Solido
          </div>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="font-code text-base font-bold text-amber-300">
              {metrics.volumePercent}%
            </span>
            <span className="text-[11px] text-stone-500">del massimo</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-stone-400">
            Spigolo Dominante
          </div>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span
              className="font-semibold text-sm"
              style={{ color: metrics.dominantAxis.color }}
            >
              {metrics.dominantAxis.shortLabel}
            </span>
            <span className="font-code text-xs text-stone-300 font-bold">
              {metrics.dominantVal}/10
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-stone-400">
            Intensità Media Assi
          </div>
          <div className="mt-0.5 font-code text-base font-bold text-stone-200">
            {metrics.avgScore} <span className="text-xs font-normal text-stone-400">/ 10</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-stone-400">
            Asimmetria Cristallo
          </div>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="font-code text-base font-bold text-sky-300">
              {metrics.asymmetryIndex}
            </span>
            <span className="text-[10px] text-stone-500">
              {Number(metrics.asymmetryIndex) > 0.5 ? 'Asimmetrico' : 'Equilibrato'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
