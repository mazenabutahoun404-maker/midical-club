import { useEffect, useRef, useState } from "react";

const vertexShader = `
  attribute vec3 aPosition;
  attribute float aSeed;
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uAspect;
  varying float vSeed;
  varying float vDepth;

  mat2 rotate2d(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
  }

  void main() {
    vec3 point = aPosition;
    float drift = uTime * (0.08 + aSeed * 0.05);
    point.xz = rotate2d(drift + uPointer.x * 0.34) * point.xz;
    point.yz = rotate2d(uPointer.y * 0.2) * point.yz;
    point.x += sin(uTime * 0.35 + aSeed * 18.0) * 0.08;
    float depth = max(2.4, 7.4 - point.z);
    vec2 projected = point.xy / depth * 3.1;
    gl_Position = vec4(projected.x / uAspect, projected.y, 0.0, 1.0);
    gl_PointSize = (2.2 + aSeed * 4.8) * (7.0 / depth);
    vSeed = aSeed;
    vDepth = clamp(1.0 - depth / 10.0, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;
  varying float vSeed;
  varying float vDepth;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float distanceToCenter = length(center);
    if (distanceToCenter > 0.5) discard;
    float halo = smoothstep(0.5, 0.04, distanceToCenter);
    vec3 red = vec3(0.98, 0.24, 0.24);
    vec3 coral = vec3(1.0, 0.62, 0.4);
    vec3 pearl = vec3(1.0, 0.92, 0.82);
    vec3 color = mix(red, coral, vSeed);
    color = mix(color, pearl, vDepth * 0.48);
    gl_FragColor = vec4(color, halo * (0.24 + vDepth * 0.76));
  }
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createParticleData() {
  const points: number[] = [];
  const seeds: number[] = [];
  let randomState = 8608;
  const random = () => {
    randomState = (randomState * 16807) % 2147483647;
    return (randomState - 1) / 2147483646;
  };

  for (let strand = 0; strand < 2; strand += 1) {
    for (let index = 0; index < 420; index += 1) {
      const progress = index / 419;
      const angle = progress * Math.PI * 8 + strand * Math.PI;
      const radius = 1.32 + Math.sin(progress * Math.PI * 5) * 0.11;
      points.push(
        Math.cos(angle) * radius,
        (progress - 0.5) * 6.4,
        Math.sin(angle) * radius,
      );
      seeds.push(strand ? 0.78 : 0.28);
    }
  }

  for (let index = 0; index < 520; index += 1) {
    const angle = random() * Math.PI * 2;
    const radius = 1.9 + random() * 3.3;
    points.push(
      Math.cos(angle) * radius,
      (random() - 0.5) * 7.8,
      Math.sin(angle) * radius,
    );
    seeds.push(random());
  }

  return {
    positions: new Float32Array(points),
    seeds: new Float32Array(seeds),
    count: seeds.length,
  };
}

export function MedicalFieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (typeof WebGLRenderingContext === "undefined") {
      setAvailable(false);
      return;
    }
    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
      });
    } catch {
      gl = null;
    }
    if (!gl) {
      setAvailable(false);
      return;
    }

    const vertex = compile(gl, gl.VERTEX_SHADER, vertexShader);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentShader);
    if (!vertex || !fragment) {
      setAvailable(false);
      return;
    }
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setAvailable(false);
      return;
    }

    const particles = createParticleData();
    const positionBuffer = gl.createBuffer();
    const seedBuffer = gl.createBuffer();
    const positionLocation = gl.getAttribLocation(program, "aPosition");
    const seedLocation = gl.getAttribLocation(program, "aSeed");
    const timeLocation = gl.getUniformLocation(program, "uTime");
    const pointerLocation = gl.getUniformLocation(program, "uPointer");
    const aspectLocation = gl.getUniformLocation(program, "uAspect");
    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let visible = true;
    let animationFrame = 0;

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, particles.positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, particles.seeds, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(seedLocation);
    gl.vertexAttribPointer(seedLocation, 1, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.clearColor(0, 0, 0, 0);

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.max(1, Math.floor(bounds.width * ratio));
      canvas.height = Math.max(1, Math.floor(bounds.height * ratio));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const onPointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      target.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      target.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * -2;
    };
    const render = (timestamp: number) => {
      pointer.x += (target.x - pointer.x) * 0.04;
      pointer.y += (target.y - pointer.y) * 0.04;
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(timeLocation, reduced ? 0 : timestamp / 1000);
      gl.uniform2f(pointerLocation, pointer.x, pointer.y);
      gl.uniform1f(aspectLocation, canvas.width / canvas.height);
      gl.drawArrays(gl.POINTS, 0, particles.count);
      if (!reduced && visible) animationFrame = requestAnimationFrame(render);
    };
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([entry]) => {
            visible = entry?.isIntersecting ?? true;
            if (visible && !reduced) {
              cancelAnimationFrame(animationFrame);
              animationFrame = requestAnimationFrame(render);
            }
          });
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            resize();
            if (reduced) render(0);
          });

    resize();
    resizeObserver?.observe(canvas);
    observer?.observe(canvas);
    if (!resizeObserver) window.addEventListener("resize", resize);
    if (!reduced) canvas.addEventListener("pointermove", onPointerMove);
    render(0);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointerMove);
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(seedBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="auth-medical-field"
      data-webgl={available ? "active" : "fallback"}
      aria-hidden="true"
    />
  );
}
