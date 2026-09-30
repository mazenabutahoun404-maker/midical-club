import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  HemisphereLight,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  Color,
  Vector2,
  Raycaster,
  SRGBColorSpace,
  NeutralToneMapping,
  PCFShadowMap,
  type Object3D,
  type Material,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createCampusLife, prepareCampusWalkers } from "./campus-life";
import { campusLayerVisible, type CampusMode } from "./campus-state";

export type CampusController = {
  setMotion: (enabled: boolean) => void;
  setVisible: (visible: boolean) => void;
  setView: (view: number) => void;
  highlight: (id: string | null) => void;
  setEvening: (enabled: boolean) => void;
  dispose: () => void;
};

export async function mountCampus(
  canvas: HTMLCanvasElement,
  options: {
    mode: CampusMode;
    signal: AbortSignal;
    onChoose: (id: string) => void;
    onFailure: () => void;
    onHover?: (id: string | null) => void;
  },
): Promise<CampusController> {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio || 1,
      window.innerWidth < 768 ? 1.25 : 1.5,
    ),
  );
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = options.mode === "active" ? 1.18 : 0.83;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  const scene = new Scene();
  const camera = new OrthographicCamera(-22, 22, 12.375, -12.375, 0.1, 150);
  const sky = new HemisphereLight(0xe2efff, 0xb7a787, 1.65);
  scene.add(sky);
  const rim = new DirectionalLight(
    0xffd19a,
    options.mode === "active" ? 1.8 : 0.45,
  );
  rim.position.set(15, 12, -8);
  scene.add(rim);
  const sun = new DirectionalLight(
    options.mode === "active" ? 0xffebc5 : 0xd3e3ee,
    2.2,
  );
  sun.position.set(-12, 25, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, {
    left: -30,
    right: 30,
    top: 26,
    bottom: -26,
    near: 0.5,
    far: 100,
  });
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.025;
  scene.add(sun);
  let model: Object3D | undefined;
  const materials = new Set<Material>();
  const walkers: Object3D[] = [];
  let walking: ReturnType<typeof prepareCampusWalkers> = [];
  let life: ReturnType<typeof createCampusLife> | undefined;
  const buildings: Mesh[] = [];
  let frame = 0,
    disposed = false,
    visible = false,
    motion = false,
    view = 0,
    time = 0,
    previous = 0;
  let pointerX = 0,
    pointerY = 0;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  const pointer = new Vector2();
  const raycaster = new Raycaster();
  const aim = () => {
    camera.position.set(view * 2.6 + pointerX, 18.6 + pointerY, 42);
    camera.lookAt(0, 3.7, 1);
  };
  const draw = () => {
    if (!disposed && visible && !document.hidden && model) {
      aim();
      renderer.render(scene, camera);
    }
  };
  const tick = (now: number) => {
    frame = 0;
    if (disposed || !visible || document.hidden || !motion || reduced.matches)
      return;
    if (now - previous >= 1000 / 30) {
      time += Math.min(now - previous, 60) / 1000;
      previous = now;
      walking.forEach(({ object, origin }, i) => {
        object.position.x = origin.x + Math.sin(time * 0.25 + i) * 1.2;
        object.position.y =
          origin.y + Math.abs(Math.sin(time * 3.5 + i)) * 0.025;
      });
      life?.update(time);
      draw();
    }
    frame = requestAnimationFrame(tick);
  };
  const restart = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (
      motion &&
      visible &&
      !document.hidden &&
      !reduced.matches &&
      !disposed
    ) {
      previous = performance.now();
      frame = requestAnimationFrame(tick);
    } else draw();
  };
  const resize = () => {
    const width = canvas.clientWidth,
      height = canvas.clientHeight;
    if (!width || !height) return;
    const halfHeight = (22 * height) / width;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    draw();
  };
  const highlight = (id: string | null) => {
    buildings.forEach((mesh) => {
      const material = mesh.material as MeshStandardMaterial;
      material.emissive = new Color(
        mesh.name === `Building_${id}` ? 0xffc57e : 0,
      );
      material.emissiveIntensity = 0.15;
    });
    life?.highlight(id);
    options.onHover?.(id);
    draw();
  };
  const pick = (event: PointerEvent | MouseEvent) => {
    const bounds = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      (-(event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    return (
      raycaster
        .intersectObjects(buildings, false)[0]
        ?.object.name.replace("Building_", "") ?? null
    );
  };
  const move = (event: PointerEvent) => {
    if (!fine.matches) return;
    const id = pick(event);
    highlight(id);
    canvas.style.cursor = id ? "pointer" : "default";
    if (motion && !reduced.matches) {
      pointerX = pointer.x * 0.45;
      pointerY = pointer.y * 0.22;
    }
  };
  const leave = () => {
    pointerX = 0;
    pointerY = 0;
    highlight(null);
  };
  const click = (event: MouseEvent) => {
    const id = pick(event);
    if (id) options.onChoose(id);
  };
  const lost = (event: Event) => {
    event.preventDefault();
    options.onFailure();
    dispose();
  };
  const resizeObserver = new ResizeObserver(resize);
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    document.removeEventListener("visibilitychange", restart);
    reduced.removeEventListener("change", restart);
    canvas.removeEventListener("pointermove", move);
    canvas.removeEventListener("pointerleave", leave);
    canvas.removeEventListener("click", click);
    canvas.removeEventListener("webglcontextlost", lost);
    options.signal.removeEventListener("abort", dispose);
    model?.traverse((object) => {
      if (object instanceof Mesh) object.geometry.dispose();
    });
    materials.forEach((material) => material.dispose());
    life?.dispose();
    sun.shadow.map?.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  }
  options.signal.addEventListener("abort", dispose, { once: true });
  try {
    const response = await fetch(
      new URL("../../assets/campus/medclub-campus.glb", import.meta.url),
      { signal: options.signal },
    );
    if (!response.ok) throw new Error("Campus model unavailable");
    const bytes = await response.arrayBuffer();
    if (options.signal.aborted) throw new DOMException("Aborted", "AbortError");
    const gltf = await new GLTFLoader().parseAsync(bytes, "");
    model = gltf.scene;
    if (options.signal.aborted) {
      model.traverse((object) => {
        if (object instanceof Mesh) {
          object.geometry.dispose();
          (Array.isArray(object.material)
            ? object.material
            : [object.material]
          ).forEach((m) => m.dispose());
        }
      });
      throw new DOMException("Aborted", "AbortError");
    }
    model.traverse((object) => {
      object.visible = campusLayerVisible(
        object.userData.campusLayer,
        options.mode,
      );
      if (object.userData.walking) walkers.push(object);
      if (object instanceof Mesh) {
        const original = object.material as MeshStandardMaterial;
        const material = original.clone();
        object.material = material;
        materials.add(original);
        materials.add(material);
        object.castShadow = !object.userData.walking;
        object.receiveShadow = true;
        if (options.mode === "dormant") material.color.set(0xc1c8ce);
        if (object.name.startsWith("Building_")) buildings.push(object);
      }
    });
    scene.add(model);
    walking = prepareCampusWalkers(walkers);
    if (options.mode === "active") {
      life = createCampusLife();
      scene.add(life.group);
    }
    aim();
    resize();
    renderer.shadowMap.needsUpdate = true;
    resizeObserver.observe(canvas);
    document.addEventListener("visibilitychange", restart);
    reduced.addEventListener("change", restart);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerleave", leave);
    canvas.addEventListener("click", click);
    canvas.addEventListener("webglcontextlost", lost);
    return {
      setMotion(enabled) {
        motion = enabled;
        if (!enabled) {
          pointerX = 0;
          pointerY = 0;
        }
        restart();
      },
      setVisible(value) {
        visible = value;
        restart();
      },
      setView(value) {
        view = Math.max(-2, Math.min(2, value));
        pointerX = 0;
        pointerY = 0;
        draw();
      },
      setEvening(enabled) {
        if (options.mode !== "active") {
          sky.intensity = enabled ? 0.48 : 1.65;
          sky.color.set(enabled ? 0x9e9aaa : 0xe2efff);
          sun.intensity = enabled ? 0.35 : 2.2;
          rim.intensity = enabled ? 0.2 : 0.45;
          renderer.toneMappingExposure = enabled ? 0.62 : 0.83;
          draw();
          return;
        }
        sky.intensity = enabled ? 0.8 : 1.65;
        sky.color.set(enabled ? 0x99b4df : 0xe2efff);
        sun.intensity = enabled ? 0.7 : 2.2;
        sun.color.set(enabled ? 0xffc083 : 0xffebc5);
        rim.intensity = enabled ? 0.8 : 1.8;
        renderer.toneMappingExposure = enabled ? 1.04 : 1.18;
        life?.setEvening(enabled);
        draw();
      },
      highlight,
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
