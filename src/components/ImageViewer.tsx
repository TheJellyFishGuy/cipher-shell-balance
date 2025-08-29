import React, { useState, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Maximize2,
  Eye,
  Palette,
  Filter
} from 'lucide-react';

interface ImageViewerProps {
  imageSrc: string;
  title: string;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  imageSrc,
  title,
  onClose,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState('none');
  const imageRef = useRef<HTMLImageElement>(null);

  const filters = [
    { name: 'None', value: 'none' },
    { name: 'Grayscale', value: 'grayscale(100%)' },
    { name: 'Sepia', value: 'sepia(100%)' },
    { name: 'Blur', value: 'blur(2px)' },
    { name: 'Brightness', value: 'brightness(150%)' },
    { name: 'Contrast', value: 'contrast(150%)' },
    { name: 'Invert', value: 'invert(100%)' },
  ];

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.1));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setFilter('none');
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = title || 'image';
    link.click();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="glass-button p-2"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <span className="text-xs text-muted-foreground min-w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <button
            onClick={handleZoomIn}
            className="glass-button p-2"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-white/10 mx-2" />
          
          <button
            onClick={handleRotate}
            className="glass-button p-2"
            title="Rotate"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          
          <div className="relative group">
            <button className="glass-button p-2" title="Filters">
              <Filter className="w-4 h-4" />
            </button>
            
            <div className="absolute top-full right-0 mt-2 glass-panel p-2 space-y-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              {filters.map((f) => (
                <button
                  key={f.name}
                  onClick={() => setFilter(f.value)}
                  className={`block w-full text-left px-3 py-2 text-xs rounded hover:bg-white/10 ${
                    filter === f.value ? 'bg-primary/20 text-primary' : ''
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleDownload}
            className="glass-button p-2"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleReset}
            className="glass-button p-2"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div 
        className="flex-1 overflow-hidden bg-black/20 relative cursor-move"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          ref={imageRef}
          src={imageSrc}
          alt={title}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-none select-none"
          style={{
            transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            filter: filter,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={handleMouseDown}
          draggable={false}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 border-t border-white/10 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Zoom: {Math.round(zoom * 100)}%</span>
          <span>Rotation: {rotation}°</span>
          <span>Filter: {filters.find(f => f.value === filter)?.name || 'None'}</span>
        </div>
        <div className="text-xs">
          Drag to pan • Scroll to zoom
        </div>
      </div>
    </div>
  );
};