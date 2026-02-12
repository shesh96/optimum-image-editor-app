import { useCallback, useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import type { ToolType, ExportMetadata } from "@/types/types";
import { useCanvasHistory } from "./useCanvasHistory";

/**
 * Custom hook to manage image editor state and Fabric.js canvas interactions.
 * Handles tool selection, image manipulation (rotate, zoom, crop), and history.
 */
export function useImageEditor() {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [hasImage, setHasImage] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isCropping, setIsCropping] = useState(false);
  const [annotationColor, setAnnotationColor] = useState("#ff4444");
  const cropRectRef = useRef<fabric.Rect | null>(null);
  const backgroundImageRef = useRef<fabric.Image | null>(null);

  const { saveState, undo, redo, canUndo, canRedo, clearHistory } =
    useCanvasHistory(canvasRef);

  // Initialize canvas
  const initCanvas = useCallback((canvasEl: HTMLCanvasElement) => {
    canvasElRef.current = canvasEl;
    const canvas = new fabric.Canvas(canvasEl, {
      width: 800,
      height: 600,
      backgroundColor: "#1a1d23",
      selection: true,
    });
    canvasRef.current = canvas;

    canvas.on("object:modified", () => saveState());
    canvas.on("path:created", () => saveState());

    return canvas;
  }, [saveState]);

  // Upload image
  const uploadImage = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;

        fabric.Image.fromURL(dataUrl, (img) => {
          const canvas = canvasRef.current;
          if (!canvas) return;

          // Scale image to fit canvas
          const scale = Math.min(
            (canvas.width! * 0.9) / img.width!,
            (canvas.height! * 0.9) / img.height!,
            1
          );
          img.scale(scale);
          img.set({
            originX: "center",
            originY: "center",
            left: canvas.width! / 2,
            top: canvas.height! / 2,
            selectable: false,
            evented: false,
          });

          canvas.clear();
          canvas.setBackgroundColor("#1a1d23", () => { });
          canvas.add(img);
          backgroundImageRef.current = img;
          canvas.renderAll();

          setHasImage(true);
          setRotation(0);
          setZoom(1);
          clearHistory();
          saveState();
        });
      };
      reader.readAsDataURL(file);
    },
    [saveState, clearHistory]
  );

  // Set active tool
  const selectTool = useCallback(
    (tool: ToolType) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Clean up crop mode if leaving crop
      if (activeTool === "crop" && tool !== "crop") {
        cancelCrop();
      }

      setActiveTool(tool);
      canvas.isDrawingMode = tool === "pencil";

      if (tool === "pencil") {
        canvas.freeDrawingBrush.color = annotationColor;
        canvas.freeDrawingBrush.width = 3;
        canvas.selection = false;
      } else if (tool === "select") {
        canvas.selection = true;
      } else if (tool === "crop") {
        startCrop();
      } else {
        canvas.selection = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTool, annotationColor]
  );

  // Add shape
  const addShape = useCallback(
    (type: "rectangle" | "circle") => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      let shape: fabric.Object;

      if (type === "rectangle") {
        shape = new fabric.Rect({
          left: 100,
          top: 100,
          width: 150,
          height: 100,
          fill: "transparent",
          stroke: annotationColor,
          strokeWidth: 2,
        });
      } else {
        shape = new fabric.Circle({
          left: 100,
          top: 100,
          radius: 60,
          fill: "transparent",
          stroke: annotationColor,
          strokeWidth: 2,
        });
      }

      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();
      saveState();
      setActiveTool("select");
    },
    [saveState, annotationColor]
  );

  // Add text
  const addText = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const text = new fabric.IText("Type here", {
      left: 100,
      top: 100,
      fontSize: 24,
      fill: annotationColor,
      fontFamily: "sans-serif",
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    saveState();
    setActiveTool("select");
  }, [saveState, annotationColor]);

  // Sync brush color when annotationColor changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && canvas.isDrawingMode) {
      canvas.freeDrawingBrush.color = annotationColor;
    }
  }, [annotationColor]);

  // Canvas click handler for shapes/text
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (opt: fabric.IEvent) => {
      if (activeTool === "rectangle") {
        addShape("rectangle");
      } else if (activeTool === "circle") {
        addShape("circle");
      } else if (activeTool === "text") {
        addText();
      }
    };

    canvas.on("mouse:down", handleMouseDown);
    return () => {
      canvas.off("mouse:down", handleMouseDown);
    };
  }, [activeTool, addShape, addText]);

  // Rotate
  const rotateImage = useCallback(
    (degrees: number) => {
      const img = backgroundImageRef.current;
      const canvas = canvasRef.current;
      if (!img || !canvas) return;

      const newRotation = rotation + degrees;
      img.rotate(newRotation);
      img.setCoords();
      canvas.renderAll();
      setRotation(newRotation);
      saveState();
    },
    [rotation, saveState]
  );

  // Crop
  const startCrop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsCropping(true);
    const cropRect = new fabric.Rect({
      left: 150,
      top: 100,
      width: 300,
      height: 200,
      fill: "rgba(0, 0, 0, 0.3)",
      stroke: "#4a9eff",
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      cornerColor: "#4a9eff",
      cornerSize: 10,
      transparentCorners: false,
    });

    canvas.add(cropRect);
    canvas.setActiveObject(cropRect);
    canvas.renderAll();
    cropRectRef.current = cropRect;
  }, []);

  const applyCrop = useCallback(() => {
    const canvas = canvasRef.current;
    const cropRect = cropRectRef.current;
    if (!canvas || !cropRect) return;

    const left = cropRect.left!;
    const top = cropRect.top!;
    const width = cropRect.width! * cropRect.scaleX!;
    const height = cropRect.height! * cropRect.scaleY!;

    // Remove crop rect
    canvas.remove(cropRect);
    cropRectRef.current = null;

    // Create a cropped version
    const dataUrl = canvas.toDataURL({
      left,
      top,
      width,
      height,
      format: "png",
    });

    fabric.Image.fromURL(dataUrl, (img) => {
      canvas.clear();
      canvas.setBackgroundColor("#1a1d23", () => { });

      const scale = Math.min(
        (canvas.width! * 0.9) / img.width!,
        (canvas.height! * 0.9) / img.height!,
        1
      );
      img.scale(scale);
      img.set({
        originX: "center",
        originY: "center",
        left: canvas.width! / 2,
        top: canvas.height! / 2,
        selectable: false,
        evented: false,
      });

      canvas.add(img);
      backgroundImageRef.current = img;
      canvas.renderAll();

      setIsCropping(false);
      setActiveTool("select");
      saveState();
    });
  }, [saveState]);

  const cancelCrop = useCallback(() => {
    const canvas = canvasRef.current;
    const cropRect = cropRectRef.current;
    if (canvas && cropRect) {
      canvas.remove(cropRect);
      cropRectRef.current = null;
    }
    setIsCropping(false);
  }, []);

  // Zoom
  const handleZoom = useCallback(
    (direction: "in" | "out") => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const newZoom = direction === "in"
        ? Math.min(zoom + 0.1, 3)
        : Math.max(zoom - 0.1, 0.3);

      canvas.setZoom(newZoom);
      canvas.renderAll();
      setZoom(newZoom);
    },
    [zoom]
  );

  // Delete selected
  const deleteSelected = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObjects();
    active.forEach((obj) => {
      if (obj !== backgroundImageRef.current) {
        canvas.remove(obj);
      }
    });
    canvas.discardActiveObject();
    canvas.renderAll();
    saveState();
  }, [saveState]);

  // Export image
  const exportImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL({ format: "png", multiplier: 2 });
    const link = document.createElement("a");
    link.download = "edited-image.png";
    link.href = dataUrl;
    link.click();
  }, []);

  // Export JSON
  const exportJSON = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const metadata: ExportMetadata = {
      annotations: canvas.toJSON() as unknown as ExportMetadata["annotations"],
      imageEdits: {
        rotation,
        cropApplied: false,
        zoom,
      },
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.download = "editor-data.json";
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }, [rotation, zoom]);

  // Cleanup
  useEffect(() => {
    return () => {
      canvasRef.current?.dispose();
    };
  }, []);

  return {
    canvasRef,
    initCanvas,
    activeTool,
    selectTool,
    hasImage,
    uploadImage,
    rotateImage,
    handleZoom,
    zoom,
    deleteSelected,
    undo,
    redo,
    canUndo,
    canRedo,
    exportImage,
    exportJSON,
    isCropping,
    applyCrop,
    cancelCrop,
    annotationColor,
    setAnnotationColor,
  };
}
