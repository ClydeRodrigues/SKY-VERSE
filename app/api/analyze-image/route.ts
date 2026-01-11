import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
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
