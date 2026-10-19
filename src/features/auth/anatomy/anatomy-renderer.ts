import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  HemisphereLight,
  DirectionalLight,
  PointLight,
  Mesh,
  MeshPhysicalMaterial,
  MeshBasicMaterial,
  Color,
  Group,
  Vector3,
  Box3,
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  PointsMaterial,
  CatmullRomCurve3,
  TubeGeometry,
  SphereGeometry,
  SRGBColorSpace,
  NeutralToneMapping,
  type Material,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clampProgress, type AnatomyState } from "./anatomy-state";
const modelURL = new URL(
  "../../../assets/medical/heart-study.glb",
  import.meta.url,
).href;
export interface AnatomyController {
  update: (state: AnatomyState) => void;
  setVisible: (value: boolean) => void;
  dispose: () => void;
}

/** A single local mesh, no shadows/postprocessing, bounded pixel density and 30 rendered frames/sec. */
export async function mountAnatomy(
  canvas: HTMLCanvasElement,
  options: {
    signal: AbortSignal;
    state: AnatomyState;
    onFailure: () => void;
  },
): Promise<AnatomyController> {
  if (options.signal.aborted) throw new DOMException("Aborted", "AbortError");
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio || 1,
      window.innerWidth < 768 ? 1.15 : 1.5,
    ),
  );
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.1;
  const scene = new Scene(),
    camera = new OrthographicCamera(-1.8, 1.8, 1.68, -1.68, 0.1, 30);
  camera.position.set(0, 0.1, 7);
  camera.lookAt(0, 0, 0);
  scene.add(new HemisphereLight(0xffeadb, 0x68777b, 2));
  const key = new DirectionalLight(0xffe4ce, 3.5);
  key.position.set(-3, 4, 5);
  scene.add(key);
  const rim = new DirectionalLight(0x9dcbc1, 3);
  rim.position.set(3, 1, -3);
  scene.add(rim);
  const pulse = new PointLight(0xffffff, 0.7, 12);
  pulse.position.set(0, 0, 2.4);
  scene.add(pulse);
  const sculpture = new Group();
  scene.add(sculpture);
  const material = new MeshPhysicalMaterial({
    color: 0xc8a28b,
    roughness: 0.32,
    metalness: 0.12,
    clearcoat: 0.35,
    clearcoatRoughness: 0.3,
    emissiveIntensity: 0.04,
  });
  const geometries = new Set<BufferGeometry>(),
    materials = new Set<Material>([material]);
  const markerGeometry = new SphereGeometry(0.023, 8, 6);
  geometries.add(markerGeometry);
  const paths = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * Math.PI) / 3 - 0.3;
    const curve = new CatmullRomCurve3(
      Array.from({ length: 9 }, (_, j) => {
        const a = angle + (j / 8) * 1.75;
        return new Vector3(
          Math.cos(a) * (1.25 - j * 0.055),
          Math.sin(a) * (1.15 - j * 0.045),
          -0.24 + j * 0.065,
        );
      }),
    );
    const geometry = new TubeGeometry(curve, 32, 0.003, 4, false);
    geometries.add(geometry);
    const line = new MeshBasicMaterial({ transparent: true, opacity: 0.12 });
    materials.add(line);
    const dot = new MeshBasicMaterial({
      color: 0xffedd3,
      transparent: true,
      opacity: 0.7,
    });
    materials.add(dot);
    const marker = new Mesh(markerGeometry, dot);
    scene.add(new Mesh(geometry, line), marker);
    return { curve, line, marker, dot };
  });
  const dustGeometry = new BufferGeometry();
  geometries.add(dustGeometry);
  const dustPositions = Array.from({ length: 30 }, (_, i) => {
    const angle = i * 2.39996,
      radius = 0.95 + (i % 7) * 0.11;
    return [
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      (i % 5) * 0.1 - 0.4,
    ];
  }).flat();
  dustGeometry.setAttribute(
    "position",
    new Float32BufferAttribute(dustPositions, 3),
  );
  const dustMaterial = new PointsMaterial({
    size: 0.012,
    transparent: true,
    opacity: 0.32,
  });
  materials.add(dustMaterial);
  const dust = new Points(dustGeometry, dustMaterial);
  scene.add(dust);
  let state = options.state,
    disposed = false,
    visible = false,
    frame = 0,
    previous = 0,
    elapsed = 0;
  let revealed = state.registering ? clampProgress(state.progress) / 6 : 1,
    rx = 0,
    ry = 0;
  const pointer = { x: 0, y: 0 },
    body = new Color(),
    rest = new Color();
  let bounds = canvas.getBoundingClientRect();
  function updateColors() {
    body.set(state.dark ? "#bb8c78" : "#d2b29a");
    rest.set(state.dark ? "#817b7b" : "#c5c0b7");
    material.emissive.set(state.accent);
    pulse.color.set(state.accent);
    dustMaterial.color.set(state.accent);
    paths.forEach((path) => path.line.color.set(state.accent));
  }
  function resize() {
    if (disposed) return;
    bounds = canvas.getBoundingClientRect();
    const width = Math.max(1, bounds.width),
      height = Math.max(1, bounds.height),
      aspect = width / height;
    renderer.setSize(width, height, false);
    camera.left = -1.68 * aspect;
    camera.right = 1.68 * aspect;
    camera.updateProjectionMatrix();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  function move(event: PointerEvent) {
    if (event.pointerType !== "mouse" || !bounds.width || !bounds.height)
      return;
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
  }
  function enter() {
    bounds = canvas.getBoundingClientRect();
  }
  function leave() {
    pointer.x = 0;
    pointer.y = 0;
  }
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerenter", enter);
  canvas.addEventListener("pointerleave", leave);
  function render(time: number) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    frame = requestAnimationFrame(render);
    if (previous && time - previous < 1000 / 30) return;
    const dt = previous ? Math.min(0.08, (time - previous) / 1000) : 0;
    previous = time;
    elapsed += dt;
    const ease = 1 - Math.exp(-dt * 5);
    revealed +=
      ((state.registering ? clampProgress(state.progress) / 6 : 1) - revealed) *
      ease;
    rx += (pointer.x * 0.22 - rx) * ease;
    ry += (-pointer.y * 0.1 - ry) * ease;
    const beat = Math.pow(
      Math.max(
        0,
        Math.sin(elapsed * (state.feedback === "submitting" ? 5.6 : 3.8)),
      ),
      12,
    );
    const entrance = 1 - Math.pow(1 - Math.min(1, elapsed / 1.25), 3);
    sculpture.rotation.y = rx + Math.sin(elapsed * 0.18) * 0.055;
    sculpture.rotation.x = ry;
    sculpture.position.y =
      -0.12 * (1 - entrance) + Math.sin(elapsed * 0.55) * 0.012;
    sculpture.scale.setScalar(0.94 + entrance * 0.06 + beat * 0.009);
    material.color.copy(rest).lerp(body, 0.2 + revealed * 0.8);
    material.emissiveIntensity =
      0.02 +
      revealed * 0.035 +
      (state.feedback === "success" ? 0.16 : state.focused ? 0.04 : 0);
    pulse.intensity = 0.45 + revealed * 0.35 + beat * 0.14;
    dust.rotation.z = elapsed * 0.018;
    paths.forEach((path, i) => {
      const lit = !state.registering || i < clampProgress(state.progress);
      path.line.opacity = lit ? 0.23 : 0.035;
      path.dot.opacity = lit ? 0.75 : 0;
      path.marker.position.copy(
        path.curve.getPoint((elapsed * 0.1 + i * 0.17) % 1),
      );
    });
    try {
      renderer.render(scene, camera);
    } catch {
      dispose();
      options.onFailure();
    }
  }
  function setVisible(value: boolean) {
    visible = value;
    if (!value) {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
    } else if (!disposed && !frame) frame = requestAnimationFrame(render);
  }
  function contextLost(event: Event) {
    event.preventDefault();
    dispose();
    options.onFailure();
  }
  canvas.addEventListener("webglcontextlost", contextLost);
  function dispose() {
    if (disposed) return;
    disposed = true;
    setVisible(false);
    observer.disconnect();
    canvas.removeEventListener("pointermove", move);
    canvas.removeEventListener("pointerenter", enter);
    canvas.removeEventListener("pointerleave", leave);
    canvas.removeEventListener("webglcontextlost", contextLost);
    options.signal.removeEventListener("abort", dispose);
    scene.clear();
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    renderer.dispose();
    // Keep the canvas context reusable when reduced-motion preferences change.
    // Geometry, materials, programs and render lists have already been released.
  }
  options.signal.addEventListener("abort", dispose, { once: true });
  try {
    const response = await fetch(modelURL, { signal: options.signal });
    if (!response.ok) throw new Error("Anatomy illustration unavailable");
    const gltf = await new GLTFLoader().parseAsync(
      await response.arrayBuffer(),
      "",
    );
    gltf.scene.traverse((node) => {
      if (node instanceof Mesh) {
        geometries.add(node.geometry);
        (Array.isArray(node.material)
          ? node.material
          : [node.material]
        ).forEach((m) => m.dispose());
        node.material = material;
      }
    });
    if (disposed || options.signal.aborted) {
      geometries.forEach((g) => g.dispose());
      throw new DOMException("Aborted", "AbortError");
    }
    const box = new Box3().setFromObject(gltf.scene),
      size = box.getSize(new Vector3());
    gltf.scene.position.sub(box.getCenter(new Vector3()));
    const orientation = new Group();
    orientation.add(gltf.scene);
    orientation.scale.setScalar(2.65 / Math.max(size.x, size.y, size.z));
    orientation.rotation.y = -Math.PI / 2 + 0.12;
    sculpture.add(orientation);
    updateColors();
    resize();
    renderer.render(scene, camera);
    return {
      update(next) {
        state = next;
        updateColors();
      },
      setVisible,
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
