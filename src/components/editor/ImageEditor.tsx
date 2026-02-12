import { useCallback, useRef } from "react";
import { useImageEditor } from "@/hooks/useImageEditor";
import Toolbar from "./Toolbar";
import Canvas from "./Canvas";
import UploadOverlay from "./UploadOverlay";

export default function ImageEditor() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
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
  } = useImageEditor();

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadImage(file);
      e.target.value = "";
    },
    [uploadImage]
  );

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-editor-bg">
      <div className="flex items-center px-4 py-2 border-b border-editor-border bg-editor-surface shrink-0">
        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Optimum Image Editor
        </h1>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Toolbar */}
      <Toolbar
        activeTool={activeTool}
        onSelectTool={selectTool}
        hasImage={hasImage}
        onUpload={openFilePicker}
        onRotate={rotateImage}
        onZoom={handleZoom}
        zoom={zoom}
        onDelete={deleteSelected}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onExportImage={exportImage}
        onExportJSON={exportJSON}
        isCropping={isCropping}
        onApplyCrop={applyCrop}
        onCancelCrop={cancelCrop}
        annotationColor={annotationColor}
        onColorChange={setAnnotationColor}
      />

      {/* Canvas area */}
      <div className="relative flex-1">
        {!hasImage && <UploadOverlay onUpload={uploadImage} />}
        <Canvas onInit={initCanvas} />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-editor-toolbar border-t border-editor-border text-xs text-editor-text-muted">
        <span>
          {hasImage ? `Tool: ${activeTool}` : "Upload an image to start editing"}
        </span>
        <span>Zoom: {Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
}
