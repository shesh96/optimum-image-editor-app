import { Upload } from "lucide-react";

interface UploadOverlayProps {
  onUpload: (file: File) => void;
}

export default function UploadOverlay({ onUpload }: UploadOverlayProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-editor-canvas-bg z-10">
      <label className="flex flex-col items-center gap-3 cursor-pointer group">
        <div className="w-20 h-20 rounded-2xl bg-editor-surface flex items-center justify-center group-hover:bg-editor-surface-hover transition-colors">
          <Upload size={32} className="text-editor-text-muted group-hover:text-editor-accent transition-colors" />
        </div>
        <span className="text-sm text-editor-text-muted group-hover:text-editor-text transition-colors">
          Click to upload an image
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
      </label>
    </div>
  );
}
