'use client';

import { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, SlidersHorizontal } from 'lucide-react';
import { NORMAL_THRESHOLD, extractPredictions, topAbnormalConfidence } from '@/utils/predictions';

interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence?: number;
}

interface HeatmapViewerProps {
  originalImageUrl: string;
  /** Server-provided overlay (base64/data URL). Used as-is when present. */
  heatmapUrl?: string;
  predictionResult?: Record<string, any>;
  className?: string;
}

/** Mock-service regions are expressed on a 400 x 400 grid. */
const REGION_SPACE = 400;

function drawRegionOverlay(context: CanvasRenderingContext2D, width: number, height: number, regions: Region[], strength: number) {
  const scaleX = width / REGION_SPACE;
  const scaleY = height / REGION_SPACE;
  regions.forEach((region) => {
    const confidence = Math.max(0.35, Math.min(1, region.confidence ?? strength));
    const centerX = (region.x + region.width / 2) * scaleX;
    const centerY = (region.y + region.height / 2) * scaleY;
    const radiusX = Math.max(region.width, 24) * 0.8 * scaleX;
    const radiusY = Math.max(region.height, 24) * 0.8 * scaleY;

    context.save();
    context.translate(centerX, centerY);
    context.scale(radiusX, radiusY);
    const gradient = context.createRadialGradient(0, 0, 0, 0, 0, 1);
    gradient.addColorStop(0, `rgba(226, 84, 58, ${0.78 * confidence})`);
    gradient.addColorStop(0.45, `rgba(240, 160, 58, ${0.5 * confidence})`);
    gradient.addColorStop(0.8, `rgba(244, 208, 96, ${0.2 * confidence})`);
    gradient.addColorStop(1, 'rgba(244, 208, 96, 0)');
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(0, 0, 1, 0, Math.PI * 2);
    context.fill();
    context.restore();
  });
}

/**
 * Fallback for results without regions (the legacy backend payload).
 * Highlights brighter, denser areas inside an approximate lung field. It is an
 * interpretability approximation, and the UI labels it as such.
 */
function drawDensityOverlay(context: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number, strength: number) {
  const sample = document.createElement('canvas');
  sample.width = width;
  sample.height = height;
  const sampleContext = sample.getContext('2d');
  if (!sampleContext) return;
  sampleContext.drawImage(image, 0, 0, width, height);
  const source = sampleContext.getImageData(0, 0, width, height).data;

  const overlay = context.createImageData(width, height);
  const target = overlay.data;
  const centerX = width / 2;
  const centerY = height * 0.52;
  const radiusX = width * 0.42;
  const radiusY = height * 0.4;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const dx = (x - centerX) / radiusX;
      const dy = (y - centerY) / radiusY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 1) continue;
      const edge = distance < 0.75 ? 1 : 1 - (distance - 0.75) / 0.25;
      const brightness = (source[index] + source[index + 1] + source[index + 2]) / (3 * 255);
      const weight = Math.max(0, Math.min(1, (brightness - 0.45) / 0.4));
      const alpha = weight * weight * edge * strength * 0.7;
      if (alpha <= 0.01) continue;
      target[index] = 236;
      target[index + 1] = Math.round(150 - 90 * weight);
      target[index + 2] = 52;
      target[index + 3] = Math.round(alpha * 255);
    }
  }
  context.putImageData(overlay, 0, 0);
}

const HeatmapViewer: React.FC<HeatmapViewerProps> = ({ originalImageUrl, heatmapUrl, predictionResult, className = '' }) => {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [opacity, setOpacity] = useState(65);
  const [showControls, setShowControls] = useState(false);
  const [generatedHeatmap, setGeneratedHeatmap] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'ready' | 'none' | 'error'>('idle');

  const predictions = useMemo(() => extractPredictions(predictionResult), [predictionResult]);
  const abnormalConfidence = topAbnormalConfidence(predictions);
  const regions = useMemo<Region[]>(
    () => (Array.isArray(predictionResult?.regions) ? predictionResult.regions.filter((r: any) => typeof r?.x === 'number') : []),
    [predictionResult]
  );
  const regionsKey = JSON.stringify(regions);

  useEffect(() => {
    if (heatmapUrl) {
      setStatus('ready');
      return;
    }
    if (!originalImageUrl) return;
    if (abnormalConfidence < NORMAL_THRESHOLD) {
      setGeneratedHeatmap(null);
      setStatus('none');
      return;
    }

    let cancelled = false;
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      if (cancelled) return;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth || image.width;
        canvas.height = image.naturalHeight || image.height;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas not available');
        if (regions.length) drawRegionOverlay(context, canvas.width, canvas.height, regions, abnormalConfidence);
        else drawDensityOverlay(context, image, canvas.width, canvas.height, abnormalConfidence);
        setGeneratedHeatmap(canvas.toDataURL('image/png'));
        setStatus('ready');
      } catch (error) {
        console.error('Error generating attention overlay:', error);
        setStatus('error');
      }
    };
    image.onerror = () => {
      if (!cancelled) setStatus('error');
    };
    image.src = originalImageUrl;
    return () => {
      cancelled = true;
    };
    // regionsKey stands in for the regions array identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalImageUrl, heatmapUrl, abnormalConfidence, regionsKey]);

  const overlaySource = heatmapUrl || generatedHeatmap;
  const hasOverlay = status === 'ready' && !!overlaySource;

  return (
    <div className={`group relative overflow-hidden rounded-xl ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={originalImageUrl} alt="Chest X-ray under review" className="h-full w-full object-contain" />

      {hasOverlay && showHeatmap && (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={overlaySource || ''} alt="Model attention overlay" className="h-full w-full object-contain" style={{ opacity: opacity / 100 }} />
        </div>
      )}

      {hasOverlay && showControls && (
        <div className="absolute inset-x-0 bottom-0 bg-[#0b1d21]/85 p-3 text-white backdrop-blur">
          <div className="mb-2 flex items-center justify-between text-[11px] font-bold">
            <span>Overlay opacity</span>
            <span>{opacity}%</span>
          </div>
          <input type="range" min="0" max="100" value={opacity} onChange={(event) => setOpacity(parseInt(event.target.value, 10))} className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/25 accent-[#f0a03a]" aria-label="Overlay opacity" />
        </div>
      )}

      {hasOverlay && (
        <div className="absolute right-3 top-3 flex gap-2">
          <button onClick={() => setShowHeatmap((value) => !value)} className="rounded-lg bg-black/55 p-2 text-white backdrop-blur transition hover:bg-black/75" aria-label={showHeatmap ? 'Hide attention overlay' : 'Show attention overlay'}>
            {showHeatmap ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button onClick={() => setShowControls((value) => !value)} className="rounded-lg bg-black/55 p-2 text-white backdrop-blur transition hover:bg-black/75" aria-label="Overlay controls">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2">
        {hasOverlay && showHeatmap && (
          <span className="flex items-center gap-1.5 rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold text-white/90 backdrop-blur">
            <span className="h-2 w-6 rounded-full bg-gradient-to-r from-[#f4d060] via-[#f0a03a] to-[#e2543a]" />
            {heatmapUrl ? 'Model attention map' : regions.length ? 'Attention regions · prototype' : 'Saliency approximation · prototype'}
          </span>
        )}
        {status === 'none' && (
          <span className="rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold text-white/80 backdrop-blur">No focal attention region below review threshold</span>
        )}
        {status === 'error' && (
          <span className="rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold text-white/80 backdrop-blur">Overlay unavailable for this image</span>
        )}
      </div>
    </div>
  );
};

export default HeatmapViewer;
