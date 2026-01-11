"use client"

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react"

export type StarFieldCanvasHandle = {
  exportImage: () => string | null;
};
import { Download } from "lucide-react"
import type { Star, Constellation, AnalysisResult } from "@/types"

interface StarFieldCanvasProps {
  analysis?: AnalysisResult
  stars?: Star[]
  constellations?: Constellation[]
  width?: number
  height?: number
  showHeatmap?: boolean
  showConstellations?: boolean
  downloadable?: boolean
}

const StarFieldCanvas = forwardRef<StarFieldCanvasHandle, StarFieldCanvasProps>(function StarFieldCanvas({
  analysis,
  stars: propsStars,
  constellations: propsConstellations,
  width = 800,
  height = 600,
  showHeatmap = false,
  showConstellations = false,
  downloadable = false,
}, ref) {
  const stars = propsStars || analysis?.stars || []
  const constellations = propsConstellations || analysis?.constellations || []

  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Export method for parent
  useImperativeHandle(ref, () => ({
    exportImage: () => {
      if (canvasRef.current) {
        return canvasRef.current.toDataURL("image/png")
      }
      return null
    }
  }))
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || stars.length === 0) return

    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return

    // Clear canvas with subtle background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
    bgGradient.addColorStop(0, "#0f0f1e")
    bgGradient.addColorStop(1, "#1a1a2e")
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)

    // Calculate bounds for stars
    const raValues = stars.map((s) => s.ra)
    const decValues = stars.map((s) => s.dec)
    const raMin = Math.min(...raValues)
    const raMax = Math.max(...raValues)
    const decMin = Math.min(...decValues)
    const decMax = Math.max(...decValues)

    const raRange = raMax - raMin || 360
    const decRange = decMax - decMin || 180
    const padding = 50

    const mapToCanvas = (ra: number, dec: number) => {
      const x = padding + ((ra - raMin) / raRange) * (width - 2 * padding)
      const y = padding + ((dec - decMin) / decRange) * (height - 2 * padding)
      return { x, y }
    }

    // Add jitter for label/cluster separation
    const starPositions: Array<{ pos: { x: number; y: number }; size: number; brightness: number; labelOffset?: {x:number;y:number} }> = []
    const MIN_DISTANCE = 12 // Minimum pixel distance between star centers

    for (const star of stars) {
      const pos = mapToCanvas(star.ra, star.dec);
      const brightness = Math.min(star.brightness, 10);
      const baseSize = (brightness / 10) * 3 + 0.8;

      // Jitter for label separation
      const jitter = Math.random() * 8 + 4;
      const angle = Math.random() * Math.PI * 2;
      const labelOffset = { x: Math.cos(angle) * jitter, y: Math.sin(angle) * jitter };

      // Check collision with existing stars
      let hasCollision = false;
      for (const existing of starPositions) {
        const dist = Math.hypot(pos.x - existing.pos.x, pos.y - existing.pos.y);
        if (dist < MIN_DISTANCE) {
          hasCollision = true;
          break;
        }
      }

      // Only add star if no collision, or reduce size if needed
      if (!hasCollision) {
        starPositions.push({ pos, size: baseSize, brightness, labelOffset });
      } else if (baseSize > 0.5) {
        // Allow very small stars in dense regions
        starPositions.push({ pos, size: baseSize * 0.6, brightness: brightness * 0.7, labelOffset });
      }
    }

    // Draw heatmap if enabled
    if (showHeatmap) {
      const gridSize = 25
      const maxDensity = 8

      for (let gx = 0; gx < width; gx += gridSize) {
        for (let gy = 0; gy < height; gy += gridSize) {
          let density = 0
          for (const star of stars) {
            const pos = mapToCanvas(star.ra, star.dec)
            const dist = Math.hypot(pos.x - gx, pos.y - gy)
            if (dist < gridSize * 2.5) {
              density += 1 / (1 + dist / 15)
            }
          }

          const normalized = Math.min(density / maxDensity, 1)
          if (normalized > 0.05) {
            const hue = 190 - normalized * 80
            const saturation = 65
            const lightness = 20 + normalized * 25
            ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`
            ctx.fillRect(gx, gy, gridSize, gridSize)
          }
        }
      }
    }

    // Draw constellation lines
    if (showConstellations && constellations && constellations.length > 0) {
      ctx.strokeStyle = "rgba(0, 217, 255, 0.25)"
      ctx.setLineDash([6, 4])
      ctx.lineWidth = 1.2

      for (const constellation of constellations) {
        if (!constellation.stars || constellation.stars.length < 2) continue

        const starIndices = constellation.stars
        for (let i = 0; i < starIndices.length - 1; i++) {
          const star1 = stars[starIndices[i]]
          const star2 = stars[starIndices[i + 1]]

          if (star1 && star2) {
            const pos1 = mapToCanvas(star1.ra, star1.dec)
            const pos2 = mapToCanvas(star2.ra, star2.dec)

            ctx.beginPath()
            ctx.moveTo(pos1.x, pos1.y)
            ctx.lineTo(pos2.x, pos2.y)
            ctx.stroke()
          }
        }
      }

      ctx.setLineDash([])
    }

    for (const starData of starPositions) {
      const { pos, size, brightness, labelOffset } = starData;
      // Outer glow (more subtle)
      const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, size * 3.5);
      gradient.addColorStop(0, `rgba(0, 217, 255, ${0.3 + brightness / 30})`);
      gradient.addColorStop(0.5, `rgba(0, 217, 255, ${0.1 + brightness / 50})`);
      gradient.addColorStop(1, "rgba(0, 217, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(pos.x - size * 3.5, pos.y - size * 3.5, size * 7, size * 7);

      // Core star with opacity based on brightness
      ctx.fillStyle = `rgba(0, 217, 255, ${0.8 + brightness / 20})`;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
      ctx.fill();

      // Bright core highlight
      ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + brightness / 30})`;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Draw star label with offset (if label exists)
      if (analysis?.starLabels && analysis.starLabels[starPositions.indexOf(starData)]) {
        const label = analysis.starLabels[starPositions.indexOf(starData)];
        ctx.font = "12px monospace";
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.textAlign = "left";
        ctx.fillText(label, pos.x + (labelOffset?.x || 0) + 8, pos.y + (labelOffset?.y || 0) - 8);
      }
    }

    // Draw constellation names with better positioning
    if (showConstellations && constellations && constellations.length > 0) {
      ctx.fillStyle = "rgba(160, 160, 176, 0.6)"
      ctx.font = "bold 13px monospace"
      ctx.textAlign = "center"

      for (const constellation of constellations) {
        if (!constellation.stars || constellation.stars.length === 0) continue;
        let centerX = 0, centerY = 0, count = 0;
        for (const starIdx of constellation.stars) {
          if (stars[starIdx]) {
            const pos = mapToCanvas(stars[starIdx].ra, stars[starIdx].dec);
            centerX += pos.x;
            centerY += pos.y;
            count++;
          }
        }
        if (count > 0) {
          centerX /= count;
          centerY /= count;
          // Jitter constellation label
          const jitter = Math.random() * 12 + 6;
          const angle = Math.random() * Math.PI * 2;
          centerX += Math.cos(angle) * jitter;
          centerY += Math.sin(angle) * jitter;
          // Draw background for text readability
          const textWidth = ctx.measureText(constellation.name).width;
          ctx.fillStyle = "rgba(15, 15, 30, 0.6)";
          ctx.fillRect(centerX - textWidth / 2 - 6, centerY - 18, textWidth + 12, 16);
          ctx.fillStyle = "rgba(160, 160, 176, 0.8)";
          ctx.fillText(constellation.name, centerX, centerY - 10);
        }
      }
    }

    // Draw axes labels with subtle styling
    ctx.fillStyle = "rgba(160, 160, 176, 0.4)"
    ctx.font = "12px monospace"
    ctx.textAlign = "center"
    ctx.fillText("Right Ascension (RA)", width / 2, height - 12)

    ctx.save()
    ctx.translate(18, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText("Declination (Dec)", 0, 0)
    ctx.restore()
  }, [stars, constellations, width, height, showHeatmap, showConstellations])

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.href = canvas.toDataURL("image/png")
    link.download = "skyverse-star-field.png"
    link.click()
  }

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4">
      <div className="overflow-hidden rounded-lg border border-border bg-card flex items-center justify-center" style={{maxWidth:width, maxHeight:height}}>
        <canvas ref={canvasRef} width={width} height={height} className="block w-full h-auto" style={{objectFit:'contain',maxWidth:'100%',maxHeight:'100%'}} />
      </div>
      {downloadable && (
        <button
          onClick={downloadCanvas}
          className="flex items-center gap-2 rounded-lg bg-[#00d9ff] px-4 py-2 text-sm font-semibold text-[#0f0f1e] hover:bg-[#00b8d4] transition-colors"
        >
          <Download size={16} />
          Download Visualization
        </button>
      )}
    </div>
  );
});
export default StarFieldCanvas;
