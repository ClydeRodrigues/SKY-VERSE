import { type NextRequest, NextResponse } from "next/server"
import sharp from "sharp"

type NightSkyCheck = {
  ok: boolean
  metrics: {
    darkFrac: number
    brightFrac: number
    veryBrightFrac: number
    mean: number
    std: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Server-side gate: reject obvious non-night-sky images.
    // This prevents bypassing the client-side check.
    const buf = Buffer.from(await file.arrayBuffer())
    const check = await isLikelyNightSkyImage(buf)
    if (!check.ok) {
      return NextResponse.json(
        {
          error: "Only star/constellation night-sky images are allowed.",
          details: check.metrics,
        },
        { status: 400 },
      )
    }

    // Simulate analysis with deterministic results based on image size
    const fileSize = file.size
    const seed = fileSize % 1000

    const analysis = {
      starCount: 120 + (seed % 50),
      clusterCount: 3 + (seed % 5),
      anomalyCount: seed % 3,
      discoveryScore: 65 + (seed % 30),
      summary: `Stellar analysis extracted ${120 + (seed % 50)} distinct stellar objects from the provided night-sky image. The field exhibits moderate stellar density with ${3 + (seed % 5)} distinct clustering formations. Image contrast is sufficient for reliable feature extraction.`,
      timestamp: new Date().toISOString(),
      stars: generateStarField(120 + (seed % 50)),
      constellations: [
        { name: "Orion", stars: [0, 1, 2, 3, 4] },
        { name: "Ursa Major", stars: [10, 11, 12, 13, 14, 15] },
      ],
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}

function generateStarField(count: number) {
  const stars = []
  for (let i = 0; i < count; i++) {
    stars.push({
      ra: Math.random() * 360,
      dec: Math.random() * 180 - 90,
      brightness: Math.random() * 10,
    })
  }
  return stars
}

export async function GET() {
  return NextResponse.json({ status: "API ready" })
}

async function isLikelyNightSkyImage(input: Buffer): Promise<NightSkyCheck> {
  // Downsample + compute simple luminance statistics.
  const targetW = 256
  const img = sharp(input, { failOn: "none" }).rotate()
  const meta = await img.metadata()
  const w0 = meta.width ?? 0
  const h0 = meta.height ?? 0
  if (w0 < 2 || h0 < 2) {
    return {
      ok: false,
      metrics: { darkFrac: 0, brightFrac: 0, veryBrightFrac: 0, mean: 0, std: 0 },
    }
  }

  const scale = Math.min(1, targetW / w0)
  const w = Math.max(1, Math.floor(w0 * scale))
  const h = Math.max(1, Math.floor(h0 * scale))

  const { data } = await img
    .resize(w, h, { fit: "inside" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const n = w * h
  let dark = 0
  let bright = 0
  let veryBright = 0
  let sum = 0
  let sumSq = 0

  // RGB triplets
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i]!
    const g = data[i + 1]!
    const b = data[i + 2]!
    const y = 0.2126 * r + 0.7152 * g + 0.0722 * b
    sum += y
    sumSq += y * y

    if (y < 40) dark++
    if (y > 180) bright++
    if (y > 230) veryBright++
  }

  const mean = sum / n
  const variance = Math.max(0, sumSq / n - mean * mean)
  const std = Math.sqrt(variance)

  const darkFrac = dark / n
  const brightFrac = bright / n
  const veryBrightFrac = veryBright / n

  const ok =
    darkFrac >= 0.55 &&
    brightFrac >= 0.001 &&
    brightFrac <= 0.12 &&
    veryBrightFrac <= 0.02 &&
    mean <= 110 &&
    std >= 25

  return {
    ok,
    metrics: { darkFrac, brightFrac, veryBrightFrac, mean, std },
  }
}
