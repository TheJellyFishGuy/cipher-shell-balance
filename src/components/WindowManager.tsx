import React, { useState, useRef, useEffect } from 'react';
import { X, Maximize2, Minimize2, Move } from 'lucide-react';

interface Window {
  id: string;
  title: string;
  content: React.ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  minimized: boolean;
  zIndex: number;
}

interface WindowManagerProps {
  windows: Omit<Window, 'position' | 'size' | 'minimized' | 'zIndex'>[];
  onWindowClose: (id: string) => void;
}

export const WindowManager: React.FC<WindowManagerProps> = ({ windows, onWindowClose }) => {
  const [windowStates, setWindowStates] = useState<Map<string, Window>>(new Map());
  const [dragState, setDragState] = useState<{ id: string; offset: { x: number; y: number } } | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(1000);

  // Initialize window states
  useEffect(() => {
    const newStates = new Map(windowStates);
    
    windows.forEach((window, index) => {
      if (!newStates.has(window.id)) {
        newStates.set(window.id, {
          ...window,
          position: { x: 100 + index * 30, y: 100 + index * 30 },
          size: { width: 600, height: 400 },
          minimized: false,
          zIndex: 1000 + index,
        });
      }
    });

    // Remove windows that are no longer in the props
    const currentIds = new Set(windows.map(w => w.id));
    for (const id of newStates.keys()) {
      if (!currentIds.has(id)) {
        newStates.delete(id);
      }
    }

    setWindowStates(newStates);
  }, [windows]);

  const updateWindow = (id: string, updates: Partial<Window>) => {
    setWindowStates(prev => {
      const newStates = new Map(prev);
      const existing = newStates.get(id);
      if (existing) {
        newStates.set(id, { ...existing, ...updates });
      }
      return newStates;
    });
  };

  const bringToFront = (id: string) => {
    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);
    updateWindow(id, { zIndex: newZIndex });
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    const window = windowStates.get(id);
    if (!window) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragState({
      id,
      offset: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      },
    });
    bringToFront(id);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragState) return;

    const window = windowStates.get(dragState.id);
    if (!window) return;

    updateWindow(dragState.id, {
      position: {
        x: e.clientX - dragState.offset.x,
        y: e.clientY - dragState.offset.y,
      },
    });
  };

  const handleMouseUp = () => {
    setDragState(null);
  };

  useEffect(() => {
    if (dragState) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState]);

  return (
    <>
      {Array.from(windowStates.values()).map((window) => (
        <div
          key={window.id}
          className={`fixed window-panel ${window.minimized ? 'hidden' : ''}`}
          style={{
            left: window.position.x,
            top: window.position.y,
            width: window.size.width,
            height: window.size.height,
            zIndex: window.zIndex,
          }}
          onClick={() => bringToFront(window.id)}
        >
          {/* Window Header */}
          <div
            className="flex items-center justify-between p-3 border-b border-white/10 cursor-move"
            onMouseDown={(e) => handleMouseDown(e, window.id)}
          >
            <div className="flex items-center gap-2">
              <Move className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">{window.title}</h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateWindow(window.id, { minimized: !window.minimized });
                }}
                className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Minimize2 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateWindow(window.id, {
                    size: window.size.width === 600 ? { width: 800, height: 600 } : { width: 600, height: 400 }
                  });
                }}
                className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWindowClose(window.id);
                }}
                className="p-1 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Window Content */}
          <div className="p-4 overflow-auto" style={{ height: 'calc(100% - 60px)' }}>
            {window.content}
          </div>
        </div>
      ))}
    </>
  );
};