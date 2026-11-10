import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { Book } from "./data";
export function motif(
  c: CanvasRenderingContext2D,
  type: string,
  x: number,
  y: number,
  s: number,
) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.lineWidth = 1.5;
  c.beginPath();
  if (type === "moon") {
    c.arc(0, -30, 24, 0, Math.PI * 2);
    for (let i = 0; i < 9; i++) {
      c.moveTo(-70 + i * 5, 15 + i * 7);
      c.lineTo(70 - i * 5, 15 + i * 7);
    }
  } else if (type === "mountain") {
    for (let i = 0; i < 4; i++) {
      c.moveTo(-85, 55 + i * 8);
      c.lineTo(-20, -35 + i * 10);
      c.lineTo(5, 0 + i * 8);
      c.lineTo(30, -60 + i * 12);
      c.lineTo(90, 55 + i * 8);
    }
  } else if (type === "house") {
    c.rect(-42, -5, 84, 55);
    c.moveTo(-60, -5);
    c.lineTo(0, -40);
    c.lineTo(60, -5);
    for (let i = 0; i < 4; i++) {
      c.rect(-30 + i * 19, 10, 10, 20);
    }
    c.moveTo(-65, 55);
    c.lineTo(65, 55);
    c.moveTo(-30, 50);
    c.lineTo(-30, 75);
    c.moveTo(30, 50);
    c.lineTo(30, 75);
  } else if (type === "boat") {
    c.moveTo(-65, 35);
    c.quadraticCurveTo(0, 85, 65, 35);
    c.closePath();
    c.moveTo(0, 35);
    c.lineTo(0, -65);
    c.lineTo(-45, 25);
    c.lineTo(-5, 25);
    c.moveTo(7, -45);
    c.lineTo(50, 25);
    c.lineTo(7, 25);
  } else {
    c.moveTo(0, 80);
    c.bezierCurveTo(-10, 20, 20, -20, 0, -80);
    for (let i = 0; i < 7; i++) {
      let y = 55 - i * 20,
        d = i % 2 ? 1 : -1;
      c.moveTo(0, y);
      c.bezierCurveTo(d * 65, y - 55, d * 55, y - 75, 0, y - 15);
      c.moveTo(0, y);
      c.lineTo(d * 35, y - 40);
    }
  }
  c.stroke();
  c.restore();
}
function texture(book: Book, spine = false) {
  const canvas = document.createElement("canvas");
  canvas.width = spine ? 180 : 512;
  canvas.height = 768;
  const c = canvas.getContext("2d")!;
  const w = canvas.width;
  c.fillStyle = book.color;
  c.fillRect(0, 0, w, 768);
  let seed = 3;
  for (let i = 0; i < 15000; i++) {
    seed = (seed * 16807) % 2147483647;
    c.fillStyle = `rgba(${seed % 2 ? 255 : 0},${seed % 2 ? 255 : 0},${seed % 2 ? 255 : 0},.045)`;
    c.fillRect(seed % w, (seed * 7) % 768, 1, 2);
  }
  const ink = ["#c8b79a", "#d4bb88", "#bdac91"].includes(book.color)
    ? "#183c72"
    : "#ecd7a6";
  c.strokeStyle = ink;
  c.lineWidth = 2;
  c.strokeRect(10, 13, w - 20, 742);
  c.strokeRect(16, 20, w - 32, 728);
  c.fillStyle = ink;
  c.textAlign = "center";
  c.font = spine ? "25px Georgia" : "bold 37px Georgia";
  const words = book.title.toUpperCase().split(" ");
  let lines: string[] = [];
  let line = "";
  words.forEach((word) => {
    if (c.measureText(line + " " + word).width > w - 40) {
      lines.push(line);
      line = word;
    } else line += (line ? " " : "") + word;
  });
  lines.push(line);
  lines.forEach((l, i) => c.fillText(l, w / 2, 150 + i * (spine ? 38 : 49)));
  c.strokeStyle = ink;
  motif(c, book.motif, w / 2, 500, spine ? 0.65 : 1.65);
  c.font = spine ? "15px Georgia" : "20px Georgia";
  c.fillText(spine ? "LEAF AHEAD" : book.author.toUpperCase(), w / 2, 700);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
export default function Shelf({
  books,
  selected,
  onSelect,
  reset,
}: {
  books: Book[];
  selected: string;
  onSelect: (id: string) => void;
  reset: number;
}) {
  const host = useRef<HTMLDivElement>(null),
    selection = useRef(selected);
  const [fallback, setFallback] = useState(
    new URLSearchParams(location.search).has("fallback"),
  );
  useEffect(() => {
    selection.current = selected;
  }, [selected]);
  useEffect(() => {
    if (fallback || !host.current) return;
    const el = host.current;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setFallback(true);
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
    camera.position.set(0, 3.4, 9);
    camera.lookAt(0, 1.5, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x807568, 2));
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(-3, 7, 6);
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    scene.add(light);
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(Math.max(14, books.length * 1.03 + 2), 0.18, 2.1),
      new THREE.MeshStandardMaterial({ color: "#99704a", roughness: 0.9 }),
    );
    shelf.position.y = -0.08;
    shelf.receiveShadow = true;
    scene.add(shelf);
    const groups: THREE.Group[] = [];
    const hits: THREE.Object3D[] = [];
    books.forEach((b, i) => {
      const g = new THREE.Group();
      const width = 0.65 + (i % 3) * 0.08,
        height = 3.15 + (i % 4) * 0.1,
        depth = 1.9;
      const gold = new THREE.MeshStandardMaterial({
        color: b.color,
        roughness: 0.9,
      });
      const paper = new THREE.MeshStandardMaterial({
        color: "#e4d8bc",
        roughness: 1,
      });
      const front = new THREE.MeshStandardMaterial({
        map: texture(b),
        roughness: 0.9,
      });
      const spine = new THREE.MeshStandardMaterial({
        map: texture(b, true),
        roughness: 0.9,
      });
      const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), [
        front,
        gold,
        paper,
        paper,
        spine,
        gold,
      ]);
      body.position.y = height / 2;
      body.castShadow = true;
      body.userData.id = b.id;
      g.add(body);
      const coverGeo = new THREE.BoxGeometry(
        0.055,
        height + 0.06,
        depth + 0.08,
      );
      [-1, 1].forEach((sign) => {
        const cover = new THREE.Mesh(coverGeo, [
          front,
          front,
          gold,
          gold,
          gold,
          gold,
        ]);
        cover.position.set(sign * (width / 2 + 0.015), height / 2, 0);
        g.add(cover);
      });
      g.position.x = (i - (books.length - 1) / 2) * 1.03;
      scene.add(g);
      groups.push(g);
      hits.push(body);
    });
    const ray = new THREE.Raycaster();
    let downX = 0,
      downY = 0,
      offset = 0,
      base = 0,
      visible = true,
      frame = 0;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const resize = () => {
      const w = el.clientWidth,
        h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.position.z = w < 600 ? 13 : 9;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    const io = new IntersectionObserver((e) => {
      visible = e[0].isIntersecting;
    });
    io.observe(el);
    const down = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
      base = offset;
    };
    const up = (e: PointerEvent) => {
      const dx = e.clientX - downX,
        dy = e.clientY - downY;
      if (Math.abs(dx) > 15) {
        if (Math.abs(dx) > Math.abs(dy))
          offset = THREE.MathUtils.clamp(base + dx / 90, -5, 5);
        return;
      }
      if (Math.abs(dy) > 15) return;
      const r = el.getBoundingClientRect();
      ray.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - r.left) / r.width) * 2 - 1,
          (-(e.clientY - r.top) / r.height) * 2 + 1,
        ),
        camera,
      );
      const found = ray.intersectObjects(hits)[0];
      if (found) onSelect(found.object.userData.id);
    };
    renderer.domElement.addEventListener("pointerdown", down);
    renderer.domElement.addEventListener("pointerup", up);
    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (!visible) return;
      groups.forEach((g, i) => {
        const active = books[i].id === selection.current;
        const lerp = reduced ? 1 : 0.12;
        g.position.z = THREE.MathUtils.lerp(
          g.position.z,
          active ? 1.25 : 0,
          lerp,
        );
        g.rotation.y = THREE.MathUtils.lerp(
          g.rotation.y,
          active ? -1.05 : 0,
          lerp,
        );
        g.rotation.z = THREE.MathUtils.lerp(
          g.rotation.z,
          active ? -0.075 : 0,
          lerp,
        );
      });
      const selectedIndex = books.findIndex((b) => b.id === selection.current);
      const focus =
        books.length > 10 ? (selectedIndex - (books.length - 1) / 2) * 1.03 : 0;
      camera.position.x = THREE.MathUtils.lerp(
        camera.position.x,
        focus - offset,
        reduced ? 1 : 0.1,
      );
      camera.lookAt(camera.position.x, 1.55, 0);
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      renderer.domElement.removeEventListener("pointerdown", down);
      renderer.domElement.removeEventListener("pointerup", up);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach(
            (m) => {
              if ("map" in m && m.map instanceof THREE.Texture) m.map.dispose();
              m.dispose();
            },
          );
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [books, fallback, reset, onSelect]);
  return (
    <div
      className="shelf-host"
      ref={host}
      aria-label="Interactive three dimensional bookshelf"
    >
      {fallback && (
        <div className="fallback-shelf">
          {books.map((b) => (
            <button
              key={b.id}
              style={{ background: b.color }}
              onClick={() => onSelect(b.id)}
              aria-pressed={selected === b.id}
            >
              {b.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
