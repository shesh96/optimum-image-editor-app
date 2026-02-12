import { useEffect, useRef } from "react";
import type { fabric } from "fabric";

interface CanvasProps {
  onInit: (canvas: HTMLCanvasElement) => fabric.Canvas;
}

export default function Canvas({ onInit }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (canvasElRef.current && !initialized.current) {
      initialized.current = true;
      onInit(canvasElRef.current);
    }
  }, [onInit]);

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center bg-editor-canvas-bg overflow-auto p-4"
    >
      <canvas ref={canvasElRef} />
    </div>
  );
}
