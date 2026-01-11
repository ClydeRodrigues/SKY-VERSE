"use client"

import { useState } from "react"
import { ZoomIn, ZoomOut, Download } from "lucide-react"

interface PDFPreviewProps {
  pdfUrl: string
  fileName: string
  onDownload?: () => void
}

export default function PDFPreview({ pdfUrl, fileName, onDownload }: PDFPreviewProps) {
  const [zoom, setZoom] = useState(100)

  return (
    <div className="flex flex-col h-full bg-[#1a1a2e] rounded-lg border border-[#3a3a4f] overflow-hidden">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4 p-4 border-b border-[#3a3a4f] bg-[#0f0f1e]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="p-2 hover:bg-[#25263b] rounded-lg text-[#a0a0b0] transition-colors"
            title="Zoom out"
          >
            <ZoomOut size={20} />
          </button>
          <span className="text-sm font-medium text-[#a0a0b0] w-12 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="p-2 hover:bg-[#25263b] rounded-lg text-[#a0a0b0] transition-colors"
            title="Zoom in"
          >
            <ZoomIn size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-[#a0a0b0]">{fileName}</span>
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-2 rounded-lg bg-[#00d9ff] px-3 py-2 text-[#0f0f1e] font-semibold hover:bg-[#00b8d4] transition-colors text-sm"
            >
              <Download size={16} />
              Download
            </button>
          )}
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto bg-[#0f0f1e] flex items-center justify-center p-4">
        <div
          style={{
            width: `${zoom}%`,
            transform: `scale(${zoom / 100})`,
            transformOrigin: "center top",
          }}
          className="bg-white rounded-lg shadow-lg"
        >
          <iframe
            src={pdfUrl}
            title="PDF Preview"
            className="w-full h-full rounded-lg"
            style={{ minHeight: "600px" }}
          />
        </div>
      </div>
    </div>
  )
}
