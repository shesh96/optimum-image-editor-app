import {
  MousePointer2,
  Pencil,
  Square,
  Circle,
  Type,
  Crop,
  RotateCcw,
  RotateCw,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Download,
  FileJson,
  Trash2,
  Upload,
  Check,
  X,
  Palette,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ToolType } from "@/types/types";

interface ToolbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  hasImage: boolean;
  onUpload: () => void;
  onRotate: (degrees: number) => void;
  onZoom: (direction: "in" | "out") => void;
  zoom: number;
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExportImage: () => void;
  onExportJSON: () => void;
  isCropping: boolean;
  onApplyCrop: () => void;
  onCancelCrop: () => void;
  annotationColor: string;
  onColorChange: (color: string) => void;
}

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

function ToolButton({ icon, label, onClick, active, disabled }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`
        flex items-center justify-center w-9 h-9 rounded-md transition-colors
        ${active
          ? "bg-editor-accent text-white"
          : "text-editor-text hover:bg-editor-surface-hover"
        }
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {icon}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-editor-border mx-1" />;
}

export default function Toolbar({
  activeTool,
  onSelectTool,
  hasImage,
  onUpload,
  onRotate,
  onZoom,
  zoom,
  onDelete,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExportImage,
  onExportJSON,
  isCropping,
  onApplyCrop,
  onCancelCrop,
  annotationColor,
  onColorChange,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-editor-toolbar border-b border-editor-border">
      {/* Upload */}
      <ToolButton
        icon={<Upload size={18} />}
        label="Upload Image"
        onClick={onUpload}
      />

      <Divider />

      {/* Drawing tools */}
      <ToolButton
        icon={<MousePointer2 size={18} />}
        label="Select"
        onClick={() => onSelectTool("select")}
        active={activeTool === "select"}
        disabled={!hasImage}
      />
      <ToolButton
        icon={<Pencil size={18} />}
        label="Free Draw"
        onClick={() => onSelectTool("pencil")}
        active={activeTool === "pencil"}
        disabled={!hasImage}
      />
      <ToolButton
        icon={<Square size={18} />}
        label="Rectangle"
        onClick={() => onSelectTool("rectangle")}
        active={activeTool === "rectangle"}
        disabled={!hasImage}
      />
      <ToolButton
        icon={<Circle size={18} />}
        label="Circle"
        onClick={() => onSelectTool("circle")}
        active={activeTool === "circle"}
        disabled={!hasImage}
      />
      <ToolButton
        icon={<Type size={18} />}
        label="Text"
        onClick={() => onSelectTool("text")}
        active={activeTool === "text"}
        disabled={!hasImage}
      />


      {/* Color Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            title="Annotation Color"
            disabled={!hasImage}
            className={`
              flex items-center justify-center w-9 h-9 rounded-md transition-colors
              text-editor-text hover:bg-editor-surface-hover
              ${!hasImage ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <Palette size={18} style={{ color: annotationColor }} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-editor-text-muted">Color</span>
            <div className="flex gap-1.5 flex-wrap max-w-[168px]">
              {["#ff4444", "#ff8c00", "#ffd700", "#4ade80", "#4a9eff", "#a855f7", "#ec4899", "#ffffff"].map((color) => (
                <button
                  key={color}
                  onClick={() => onColorChange(color)}
                  className={`w-7 h-7 rounded-md border-2 transition-transform hover:scale-110 ${annotationColor === color ? "border-white scale-110" : "border-transparent"
                    }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <input
              type="color"
              value={annotationColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-full h-7 rounded cursor-pointer bg-transparent border-0"
            />
          </div>
        </PopoverContent>
      </Popover>

      <Divider />

      {/* Crop */}
      {isCropping ? (
        <>
          <ToolButton
            icon={<Check size={18} />}
            label="Apply Crop"
            onClick={onApplyCrop}
          />
          <ToolButton
            icon={<X size={18} />}
            label="Cancel Crop"
            onClick={onCancelCrop}
          />
        </>
      ) : (
        <ToolButton
          icon={<Crop size={18} />}
          label="Crop"
          onClick={() => onSelectTool("crop")}
          active={activeTool === "crop"}
          disabled={!hasImage}
        />
      )}

      {/* Rotate */}
      <ToolButton
        icon={<RotateCcw size={18} />}
        label="Rotate Left 90°"
        onClick={() => onRotate(-90)}
        disabled={!hasImage}
      />
      <ToolButton
        icon={<RotateCw size={18} />}
        label="Rotate Right 90°"
        onClick={() => onRotate(90)}
        disabled={!hasImage}
      />

      <Divider />

      {/* Zoom */}
      <ToolButton
        icon={<ZoomOut size={18} />}
        label="Zoom Out"
        onClick={() => onZoom("out")}
        disabled={!hasImage}
      />
      <span className="text-xs text-editor-text-muted w-10 text-center select-none">
        {Math.round(zoom * 100)}%
      </span>
      <ToolButton
        icon={<ZoomIn size={18} />}
        label="Zoom In"
        onClick={() => onZoom("in")}
        disabled={!hasImage}
      />

      <Divider />

      {/* Undo/Redo */}
      <ToolButton
        icon={<Undo2 size={18} />}
        label="Undo"
        onClick={onUndo}
        disabled={!canUndo}
      />
      <ToolButton
        icon={<Redo2 size={18} />}
        label="Redo"
        onClick={onRedo}
        disabled={!canRedo}
      />

      <Divider />

      {/* Delete */}
      <ToolButton
        icon={<Trash2 size={18} />}
        label="Delete Selected"
        onClick={onDelete}
        disabled={!hasImage}
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Export */}
      <ToolButton
        icon={<Download size={18} />}
        label="Export Image"
        onClick={onExportImage}
        disabled={!hasImage}
      />
      <ToolButton
        icon={<FileJson size={18} />}
        label="Export JSON"
        onClick={onExportJSON}
        disabled={!hasImage}
      />
    </div>
  );
}
