import { useCallback, useRef, useState } from "react";
import type { fabric } from "fabric";

const MAX_HISTORY = 50;

export function useCanvasHistory(canvasRef: React.MutableRefObject<fabric.Canvas | null>) {
  const history = useRef<string[]>([]);
  const currentIndex = useRef(-1);
  const isRestoring = useRef(false);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateButtons = useCallback(() => {
    setCanUndo(currentIndex.current > 0);
    setCanRedo(currentIndex.current < history.current.length - 1);
  }, []);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isRestoring.current) return;

    const json = JSON.stringify(canvas.toJSON());

    // Remove future states if we branched
    if (currentIndex.current < history.current.length - 1) {
      history.current = history.current.slice(0, currentIndex.current + 1);
    }

    history.current.push(json);

    // Trim old history
    if (history.current.length > MAX_HISTORY) {
      history.current.shift();
    } else {
      currentIndex.current++;
    }

    updateButtons();
  }, [canvasRef, updateButtons]);

  const restoreState = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      if (!canvas || index < 0 || index >= history.current.length) return;

      isRestoring.current = true;
      const state = history.current[index];

      canvas.loadFromJSON(JSON.parse(state), () => {
        canvas.renderAll();
        currentIndex.current = index;
        isRestoring.current = false;
        updateButtons();
      });
    },
    [canvasRef, updateButtons]
  );

  const undo = useCallback(() => {
    if (currentIndex.current > 0) {
      restoreState(currentIndex.current - 1);
    }
  }, [restoreState]);

  const redo = useCallback(() => {
    if (currentIndex.current < history.current.length - 1) {
      restoreState(currentIndex.current + 1);
    }
  }, [restoreState]);

  const clearHistory = useCallback(() => {
    history.current = [];
    currentIndex.current = -1;
    updateButtons();
  }, [updateButtons]);

  return { saveState, undo, redo, canUndo, canRedo, clearHistory };
}
