export type ToolType =
  | "select"
  | "pencil"
  | "rectangle"
  | "circle"
  | "text"
  | "crop";

export interface HistoryEntry {
  state: string;
  timestamp: number;
}

export interface AnnotationData {
  objects: object[];
  background: string;
}

export interface ExportMetadata {
  annotations: AnnotationData;
  imageEdits: {
    rotation: number;
    cropApplied: boolean;
    zoom: number;
  };
  exportedAt: string;
}
