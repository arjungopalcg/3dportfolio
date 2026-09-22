import { useMemo } from "react";
import * as THREE from "three";

interface LabelProps {
  text: string;
  width: number; // world units
  height: number;
  fontSize?: number; // px, at 1x canvas scale (canvas is rendered at RES px/world-unit)
  color?: string;
  weight?: string | number;
  fontFamily?: string;
}

const RES = 140; // texture pixels per world unit — keeps text crisp up close

/**
 * A text label rendered to a canvas texture rather than an SDF/shader-based text mesh.
 * More broadly compatible than shader-based text (works under software/SwiftShader
 * rendering, restricted corporate GPUs, etc.) at the cost of fixed resolution.
 */
export function Label({
  text,
  width,
  height,
  fontSize = 48,
  color = "#fff8ea",
  weight = 700,
  fontFamily = "Georgia, 'Times New Roman', serif",
}: LabelProps) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * RES);
    canvas.height = Math.round(height * RES);
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = `${weight} ${fontSize}px ${fontFamily}`;

    const maxWidth = canvas.width * 0.9;
    const lines = wrapText(ctx, text, maxWidth);
    const lineHeight = fontSize * 1.2;
    const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, i) => {
      ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, width, height, fontSize, color, weight, fontFamily]);

  return (
    <mesh rotation={[0, Math.PI, 0]} renderOrder={999}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        toneMapped={false}
        depthWrite={false}
        depthTest={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}
