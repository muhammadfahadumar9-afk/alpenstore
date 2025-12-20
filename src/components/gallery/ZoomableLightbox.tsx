import { useState, useRef, useEffect, useCallback } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ZoomableLightboxProps {
  image: {
    src: string;
    alt: string;
    category: string;
    description?: string;
  };
  onClose: () => void;
}

const ZoomableLightbox = ({ image, onClose }: ZoomableLightboxProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const MIN_SCALE = 1;
  const MAX_SCALE = 4;
  const ZOOM_STEP = 0.5;

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + ZOOM_STEP, MAX_SCALE));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const newScale = Math.max(prev - ZOOM_STEP, MIN_SCALE);
      if (newScale === MIN_SCALE) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Handle scroll wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setScale((prev) => {
      const newScale = Math.max(MIN_SCALE, Math.min(prev + delta, MAX_SCALE));
      if (newScale === MIN_SCALE) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  }, []);

  // Handle double-click to toggle zoom
  const handleDoubleClick = useCallback(() => {
    if (scale > 1) {
      handleReset();
    } else {
      setScale(2);
    }
  }, [scale, handleReset]);

  // Handle mouse drag for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart, scale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle touch events for pinch-to-zoom
  const getTouchDistance = (touches: React.TouchList | TouchList) => {
    if (touches.length < 2) return null;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      setLastTouchDistance(getTouchDistance(e.touches));
    } else if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance !== null) {
      e.preventDefault();
      const newDistance = getTouchDistance(e.touches);
      if (newDistance !== null) {
        const scaleFactor = newDistance / lastTouchDistance;
        setScale((prev) => {
          const newScale = Math.max(MIN_SCALE, Math.min(prev * scaleFactor, MAX_SCALE));
          if (newScale === MIN_SCALE) {
            setPosition({ x: 0, y: 0 });
          }
          return newScale;
        });
        setLastTouchDistance(newDistance);
      }
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  }, [lastTouchDistance, isDragging, dragStart, scale]);

  const handleTouchEnd = useCallback(() => {
    setLastTouchDistance(null);
    setIsDragging(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") handleZoomIn();
      if (e.key === "-") handleZoomOut();
      if (e.key === "0") handleReset();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, handleZoomIn, handleZoomOut, handleReset]);

  // Add wheel listener to container
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, [handleWheel]);

  // Add touch move listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("touchmove", handleTouchMove, { passive: false });
      return () => container.removeEventListener("touchmove", handleTouchMove);
    }
  }, [handleTouchMove]);

  // Add mouse move/up listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Add touch end listener
  useEffect(() => {
    window.addEventListener("touchend", handleTouchEnd);
    return () => window.removeEventListener("touchend", handleTouchEnd);
  }, [handleTouchEnd]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      style={{ animation: "fadeIn 300ms ease-out forwards" }}
    >
      {/* Top bar with controls */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={scale <= MIN_SCALE}
            className="text-white hover:bg-white/20 disabled:opacity-40"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <span className="text-white text-sm font-medium min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={scale >= MAX_SCALE}
            className="text-white hover:bg-white/20 disabled:opacity-40"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            disabled={scale === 1}
            className="text-white hover:bg-white/20 disabled:opacity-40"
            aria-label="Reset zoom"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Image container */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget && scale === 1) {
            onClose();
          }
        }}
      >
        <div
          className="relative"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transition: isDragging ? "none" : "transform 200ms ease-out",
            cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
          }}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          onTouchStart={handleTouchStart}
        >
          <img
            ref={imageRef}
            src={image.src}
            alt={image.alt}
            className="max-w-[90vw] max-h-[70vh] object-contain rounded-lg select-none"
            style={{ animation: "scaleIn 300ms ease-out forwards" }}
            draggable={false}
          />
        </div>
      </div>

      {/* Bottom info bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/60 to-transparent">
        <div className="text-center text-white max-w-lg mx-auto">
          <span className="text-xs font-medium bg-primary/80 px-3 py-1 rounded-full mb-2 inline-block">
            {image.category}
          </span>
          <h3 className="text-lg font-semibold mb-1">{image.alt}</h3>
          {image.description && (
            <p className="text-white/80 text-sm">{image.description}</p>
          )}
          <p className="text-white/50 text-xs mt-2">
            Double-click or use scroll to zoom • Drag to pan when zoomed
          </p>
        </div>
      </div>
    </div>
  );
};

export default ZoomableLightbox;