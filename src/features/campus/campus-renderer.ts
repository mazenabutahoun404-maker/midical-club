import {
  Scene, OrthographicCamera, WebGLRenderer, HemisphereLight, DirectionalLight,
  Mesh, MeshStandardMaterial, Color, Vector2, Raycaster, SRGBColorSpace,
  NeutralToneMapping, PCFSoftShadowMap, type Object3D, type Material,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { campusLayerVisible, type CampusMode } from "./campus-state";

export type CampusController = {
  setMotion: (enabled: boolean) => void;
  setVisible: (visible: boolean) => void;
  setView: (view: number) => void;
  highlight: (id: string | null) => void;
  dispose: () => void;
};

export async function mountCampus(canvas: HTMLCanvasElement, options: {
  mode: CampusMode;
  signal: AbortSignal;
  onChoose: (id: string) => void;
  onFailure: () => void;
}): Promise<CampusController> {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = options.mode === "active" ? 1.1 : .83;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  const scene = new Scene();
  const camera = new OrthographicCamera(-22, 22, 12.375, -12.375, .1, 150);
  scene.add(new HemisphereLight(0xe2efff, 0xb7a787, 2));
  const sun = new DirectionalLight(options.mode === "active" ? 0xffebc5 : 0xd3e3ee, 2.2);
  sun.position.set(-12, 25, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 26, bottom: -26, near: .5, far: 100 });
  sun.shadow.bias = -.0003;
  sun.shadow.normalBias = .025;
  scene.add(sun);
  let model: Object3D | undefined;
  const materials = new Set<Material>();
  const walkers: Object3D[] = [];
  const buildings: Mesh[] = [];
  let frame = 0, disposed = false, visible = false, motion = false, view = 0, time = 0, previous = 0;
  let pointerX = 0, pointerY = 0;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  const pointer = new Vector2();
  const raycaster = new Raycaster();
  const aim = () => {
    camera.position.set(view * 2.6 + pointerX, 20 + pointerY, 42);
    camera.lookAt(0, 4, 1);
  };
  const draw = () => {
    if (!disposed && visible && !document.hidden && model) {
      aim(); renderer.render(scene, camera);
    }
  };
  const tick = (now: number) => {
    frame = 0;
    if (disposed || !visible || document.hidden || !motion || reduced.matches) return;
    if (now - previous >= 1000 / 30) {
      time += Math.min(now - previous, 60) / 1000;
      previous = now;
      walkers.forEach((walker, i) => {
        walker.position.x = Math.sin(time * .3 + i) * .55;
        walker.position.y = Math.sin(time * 2 + i) * .013;
      });
      draw();
    }
    frame = requestAnimationFrame(tick);
  };
  const restart = () => {
    cancelAnimationFrame(frame); frame = 0;
    if (motion && visible && !document.hidden && !reduced.matches && !disposed) {
      previous = performance.now(); frame = requestAnimationFrame(tick);
    } else draw();
  };
  const resize = () => {
    const width = canvas.clientWidth, height = canvas.clientHeight;
    if (!width || !height) return;
    const halfHeight = 22 * height / width;
    camera.top = halfHeight; camera.bottom = -halfHeight;
    camera.updateProjectionMatrix(); renderer.setSize(width, height, false); draw();
  };
  const highlight = (id: string | null) => {
    buildings.forEach(mesh => {
      const material = mesh.material as MeshStandardMaterial;
      material.emissive = new Color(mesh.name === `Building_${id}` ? 0x25334a : 0);
      material.emissiveIntensity = .22;
    });
    draw();
  };
  const pick = (event: PointerEvent | MouseEvent) => {
    const bounds = canvas.getBoundingClientRect();
    pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(buildings, false)[0]?.object.name.replace("Building_", "") ?? null;
  };
  const move = (event: PointerEvent) => {
    if (!fine.matches) return;
    const id = pick(event); highlight(id); canvas.style.cursor = id ? "pointer" : "default";
    if (motion && !reduced.matches) { pointerX = pointer.x * .45; pointerY = pointer.y * .22; }
  };
  const leave = () => { pointerX = 0; pointerY = 0; highlight(null); };
  const click = (event: MouseEvent) => { const id = pick(event); if (id) options.onChoose(id); };
  const lost = (event: Event) => { event.preventDefault(); options.onFailure(); dispose(); };
  const resizeObserver = new ResizeObserver(resize);
  function dispose() {
    if (disposed) return;
    disposed = true; cancelAnimationFrame(frame); resizeObserver.disconnect();
    document.removeEventListener("visibilitychange", restart);
    reduced.removeEventListener("change", restart);
    canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerleave", leave);
    canvas.removeEventListener("click", click); canvas.removeEventListener("webglcontextlost", lost);
    options.signal.removeEventListener("abort", dispose);
    model?.traverse(object => { if (object instanceof Mesh) object.geometry.dispose(); });
    materials.forEach(material => material.dispose());
    sun.shadow.map?.dispose(); renderer.dispose(); renderer.forceContextLoss();
  }
  options.signal.addEventListener("abort", dispose, { once: true });
  try {
    const response = await fetch(new URL("../../assets/campus/medclub-campus.glb", import.meta.url), { signal: options.signal });
    if (!response.ok) throw new Error("Campus model unavailable");
    const bytes = await response.arrayBuffer();
    if (options.signal.aborted) throw new DOMException("Aborted", "AbortError");
    const gltf = await new GLTFLoader().parseAsync(bytes, "");
    model = gltf.scene;
    if (options.signal.aborted) {
      model.traverse(object => {
        if (object instanceof Mesh) { object.geometry.dispose(); (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => m.dispose()); }
      });
      throw new DOMException("Aborted", "AbortError");
    }
    model.traverse(object => {
      object.visible = campusLayerVisible(object.userData.campusLayer, options.mode);
      if (object.userData.walking) walkers.push(object);
      if (object instanceof Mesh) {
        const original = object.material as MeshStandardMaterial;
        const material = original.clone(); object.material = material; materials.add(original); materials.add(material);
        object.castShadow = !object.userData.walking;
        object.receiveShadow = true;
        if (options.mode === "dormant") material.color.set(0xc1c8ce);
        if (object.name.startsWith("Building_")) buildings.push(object);
      }
    });
    scene.add(model); aim(); resize(); renderer.shadowMap.needsUpdate = true;
    resizeObserver.observe(canvas);
    document.addEventListener("visibilitychange", restart); reduced.addEventListener("change", restart);
    canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerleave", leave);
    canvas.addEventListener("click", click); canvas.addEventListener("webglcontextlost", lost);
    return {
      setMotion(enabled) { motion = enabled; if (!enabled) { pointerX = 0; pointerY = 0; } restart(); },
      setVisible(value) { visible = value; restart(); },
      setView(value) { view = Math.max(-2, Math.min(2, value)); pointerX = 0; pointerY = 0; draw(); },
      highlight, dispose,
    };
  } catch (error) { dispose(); throw error; }
}
