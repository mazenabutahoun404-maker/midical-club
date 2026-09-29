import {
  AdditiveBlending,
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  Sprite,
  SpriteMaterial,
  Vector3,
  type Object3D,
} from "three";
import { campusDestinations } from "./campus-state";

export const campusCenters = [-16.25, -9.75, -3.25, 3.25, 9.75, 16.25];
/** Travel is deterministic and independent of refresh rate. */
export function campusTrafficPosition(seconds: number, lane: number) {
  const progress =
    (((seconds * (lane ? 1.35 : 1.05) + lane * 25) % 49) + 49) % 49;
  return lane ? 24.5 - progress : progress - 24.5;
}

/** A small procedural layer: shared geometries, three unshadowed lights,
 * emissive windows and lanterns. No postprocessing or extra scene asset. */
export function createCampusLife() {
  const group = new Group();
  group.name = "Campus_life";
  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = glowCanvas.height = 64;
  const context = glowCanvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,243,195,1)");
    gradient.addColorStop(0.2, "rgba(255,203,117,.65)");
    gradient.addColorStop(1, "rgba(255,171,77,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
  }
  const texture = new CanvasTexture(glowCanvas);
  const glowMaterial = new SpriteMaterial({
    map: texture,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    opacity: 0.72,
  });
  const stripGeometry = new BoxGeometry(4.6, 0.065, 0.12);
  const floorGeometry = new PlaneGeometry(4.8, 3.8);
  const windowMaterial = new MeshBasicMaterial({
    color: 0xffd296,
    toneMapped: false,
  });
  const floorMaterial = new MeshBasicMaterial({
    color: 0xffc78b,
    transparent: true,
    opacity: 0.15,
    depthWrite: false,
  });
  const lamps: Sprite[] = [];
  const canopies: Mesh[] = [];
  campusCenters.forEach((x, index) => {
    const z = index === 0 || index === 5 ? 0 : -0.5;
    const strip = new Mesh(stripGeometry, windowMaterial.clone());
    strip.name = campusDestinations[index].id;
    strip.position.set(x, 4.12, z + 1.7);
    group.add(strip);
    canopies.push(strip);
    const floor = new Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(x, 0.968, z + 0.1);
    group.add(floor);
    const glow = new Sprite(glowMaterial.clone());
    glow.position.set(x, 3.85, z + 1.45);
    glow.scale.set(4.5, 1.2, 1);
    group.add(glow);
  });
  // Warm pools along the promenade. No dynamic shadows or expensive bloom.
  const lights = [-13, 0, 13].map((x) => {
    const light = new PointLight(0xffc582, 28, 17, 2);
    light.position.set(x, 4.2, 3.5);
    group.add(light);
    return light;
  });
  for (const x of [-18.4, -12.1, -5.6, 7.4, 13.9, 20.2]) {
    const glow = new Sprite(glowMaterial);
    glow.position.set(x, 3.2, 6.7);
    glow.scale.set(1.15, 1.15, 1);
    group.add(glow);
    lamps.push(glow);
  }
  const wheelGeometry = new CylinderGeometry(0.18, 0.18, 0.13, 10);
  const wheelMaterial = new MeshStandardMaterial({
    color: 0x29313a,
    roughness: 0.9,
  });
  const bodyGeometry = new BoxGeometry(1.9, 0.45, 0.85);
  const cabinGeometry = new BoxGeometry(0.92, 0.38, 0.73);
  const headlightGeometry = new BoxGeometry(0.03, 0.12, 0.2);
  const cabinMaterial = new MeshStandardMaterial({
    color: 0xa7c5d0,
    metalness: 0.4,
    roughness: 0.25,
  });
  const headlightMaterial = new MeshBasicMaterial({
    color: 0xffe4b1,
    toneMapped: false,
  });
  const cars = [0x9d4435, 0x315874].map((color, lane) => {
    const car = new Group();
    car.name = `Campus_car_${lane}`;
    const body = new Mesh(
      bodyGeometry,
      new MeshStandardMaterial({ color, metalness: 0.28, roughness: 0.4 }),
    );
    body.position.y = 0.48;
    car.add(body);
    const cabin = new Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(-0.1, 0.86, 0);
    car.add(cabin);
    for (const x of [-0.58, 0.58])
      for (const z of [-0.44, 0.44]) {
        const wheel = new Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(x, 0.28, z);
        car.add(wheel);
      }
    for (const z of [-0.28, 0.28]) {
      const headlight = new Mesh(headlightGeometry, headlightMaterial);
      headlight.position.set(0.96, 0.5, z);
      car.add(headlight);
    }
    car.position.set(campusTrafficPosition(0, lane), 0.12, lane ? 10.85 : 9.2);
    if (lane) car.rotation.y = Math.PI;
    group.add(car);
    return car;
  });
  let evening = false;
  return {
    group,
    update(seconds: number) {
      cars.forEach((car, lane) => {
        car.position.x = campusTrafficPosition(seconds, lane);
      });
    },
    setEvening(value: boolean) {
      evening = value;
      lights.forEach((light) => {
        light.intensity = value ? 56 : 28;
      });
      floorMaterial.opacity = value ? 0.28 : 0.15;
      glowMaterial.opacity = value ? 0.92 : 0.65;
    },
    highlight(id: string | null) {
      canopies.forEach((mesh) => {
        (mesh.material as MeshBasicMaterial).color.set(
          mesh.name === id ? 0xffffff : 0xffd296,
        );
      });
      lamps.forEach((sprite) => {
        sprite.scale.setScalar(evening ? 1.5 : 1.15);
      });
    },
    dispose() {
      const geometries = new Set<
        BoxGeometry | CylinderGeometry | PlaneGeometry
      >();
      const materials = new Set<
        MeshBasicMaterial | MeshStandardMaterial | SpriteMaterial
      >();
      group.traverse((object) => {
        if (object instanceof Mesh) {
          geometries.add(object.geometry);
          materials.add(object.material);
        }
        if (object instanceof Sprite) materials.add(object.material);
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      windowMaterial.dispose();
      texture.dispose();
      group.removeFromParent();
    },
  };
}

export function prepareCampusWalkers(objects: Object3D[]) {
  return objects.map((object) => {
    if (object instanceof Mesh) {
      object.geometry.computeBoundingBox();
      const center = object.geometry.boundingBox!.getCenter(new Vector3());
      object.geometry.translate(-center.x, -center.y, -center.z);
      object.position.add(center);
    }
    return { object, origin: object.position.clone() };
  });
}
