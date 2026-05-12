import { createContext, useContext, useCallback, useRef, useState, createElement, type ReactNode } from "react";

type PopupId = "symptom" | "test-reminder" | "gtt";

const PRIORITY: Record<PopupId, number> = { symptom: 0, "test-reminder": 1, gtt: 2 };

interface MaternityPopupQueueContextType {
  activePopup: PopupId | null;
  requestShow: (id: PopupId) => void;
  notifyDismissed: (id: PopupId) => void;
  cancelRequest: (id: PopupId) => void;
}

const MaternityPopupQueueContext = createContext<MaternityPopupQueueContextType | null>(null);

export function MaternityPopupQueueProvider({ children }: { children: ReactNode }) {
  const [activePopup, setActivePopup] = useState<PopupId | null>(null);
  const pendingRef = useRef<PopupId[]>([]);

  const requestShow = useCallback((id: PopupId) => {
    setActivePopup((prevActive) => {
      if (prevActive === null) {
        const all = [...pendingRef.current, id];
        const sorted = all.sort((a, b) => PRIORITY[a] - PRIORITY[b]);
        pendingRef.current = sorted.slice(1);
        return sorted[0];
      }
      if (!pendingRef.current.includes(id)) {
        pendingRef.current = [...pendingRef.current, id];
      }
      return prevActive;
    });
  }, []);

  const notifyDismissed = useCallback((id: PopupId) => {
    setActivePopup((prevActive) => {
      if (prevActive !== id) return prevActive;
      if (pendingRef.current.length > 0) {
        const sorted = [...pendingRef.current].sort((a, b) => PRIORITY[a] - PRIORITY[b]);
        pendingRef.current = sorted.slice(1);
        return sorted[0];
      }
      pendingRef.current = [];
      return null;
    });
  }, []);

  const cancelRequest = useCallback((id: PopupId) => {
    setActivePopup((prevActive) => {
      if (prevActive === id) {
        if (pendingRef.current.length > 0) {
          const sorted = [...pendingRef.current].sort((a, b) => PRIORITY[a] - PRIORITY[b]);
          pendingRef.current = sorted.slice(1);
          return sorted[0];
        }
        pendingRef.current = [];
        return null;
      }
      pendingRef.current = pendingRef.current.filter((p) => p !== id);
      return prevActive;
    });
  }, []);

  return createElement(
    MaternityPopupQueueContext.Provider,
    { value: { activePopup, requestShow, notifyDismissed, cancelRequest } },
    children,
  );
}

export function useMaternityPopupQueue(): MaternityPopupQueueContextType {
  const ctx = useContext(MaternityPopupQueueContext);
  if (!ctx) {
    return {
      activePopup: null,
      requestShow: () => {},
      notifyDismissed: () => {},
      cancelRequest: () => {},
    };
  }
  return ctx;
}
