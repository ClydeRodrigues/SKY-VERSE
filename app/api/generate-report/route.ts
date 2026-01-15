import { type NextRequest, NextResponse } from "next/server"
import { generatePdfReport } from "./pdf"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analysis, originalImage, timestamp, observationId, charts } = body

    const resolvedObservationId = observationId || `OBS-${Date.now()}`
    const origin =
      request.headers.get("origin") ||
      (process.env.NEXT_PUBLIC_APP_URL ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "") : null) ||
      "https://skyverse.app"

    const pdfBuffer = generatePdfReport({
      analysis,
      originalImage,
      charts,
      timestamp,
      observationId: resolvedObservationId,
      baseUrl: origin,
    })

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="skyverse-observation-${resolvedObservationId}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Report generation error:", error)
    return NextResponse.json({ error: "Report generation failed" }, { status: 500 })
  }
}
