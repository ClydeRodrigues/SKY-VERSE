"use client"

import { useEffect, useRef } from "react"

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()

    // Star data structure
    interface Star {
      x: number
      y: number
      radius: number
      opacity: number
      twinkleSpeed: number
      baseOpacity: number
      color: string
      dx: number // for diagonal movement
      dy: number
      twinklePhase: number
    }

    interface Meteor {
      x: number
      y: number
      vx: number
      vy: number
      length: number
      opacity: number
    }

    const stars: Star[] = []
    const meteors: Meteor[] = []

    // Generate static stars
    const generateStars = () => {
      stars.length = 0;
      const starCount = Math.floor((window.innerWidth * window.innerHeight) / 7000);
      for (let i = 0; i < starCount; i++) {
        // Randomly pick white or yellowish
        const color = Math.random() < 0.8 ? '#fff' : '#ffe066';
        // Diagonal movement for depth
        const speed = Math.random() * 0.15 + 0.03;
        const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.2; // ~45deg
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 0.8 + 0.2,
          opacity: Math.random() * 0.7 + 0.3,
          twinkleSpeed: Math.random() * 0.7 + 0.3,
          baseOpacity: Math.random() * 0.7 + 0.3,
          color,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    };
    generateStars();

    // Create random meteor occasionally
    let meteorCounter = 0
    const createMeteor = () => {
      if (Math.random() < 0.02 && meteors.length < 3) {
        const side = Math.random()
        let x, y, vx, vy

        if (side < 0.25) {
          // Top
          x = Math.random() * canvas.width
          y = -20
          vx = (Math.random() - 0.5) * 3
          vy = Math.random() * 2 + 1
        } else if (side < 0.5) {
          // Right
          x = canvas.width + 20
          y = Math.random() * canvas.height
          vx = -(Math.random() * 2 + 1)
          vy = (Math.random() - 0.5) * 3
        } else if (side < 0.75) {
          // Bottom
          x = Math.random() * canvas.width
          y = canvas.height + 20
          vx = (Math.random() - 0.5) * 3
          vy = -(Math.random() * 2 + 1)
        } else {
          // Left
          x = -20
          y = Math.random() * canvas.height
          vx = Math.random() * 2 + 1
          vy = (Math.random() - 0.5) * 3
        }

        meteors.push({
          x,
          y,
          vx,
          vy,
          length: Math.random() * 30 + 20,
          opacity: 0.8,
        })
      }
    }

    // Animation loop
    const animate = () => {
      // Clear with fade effect for trail
      ctx.fillStyle = "rgba(15, 15, 30, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw, twinkle, and move stars
      const now = performance.now() / 1000;
      stars.forEach((star) => {
        // Smooth twinkle using sine wave
        const twinkle = Math.sin(now * star.twinkleSpeed + star.twinklePhase) * 0.35;
        star.opacity = Math.max(Math.min(star.baseOpacity + twinkle, 1), 0.15);
        // Move diagonally
        star.x += star.dx;
        star.y += star.dy;
        // Wrap around
        if (star.x > canvas.width) star.x = 0;
        if (star.y > canvas.height) star.y = 0;
        if (star.x < 0) star.x = canvas.width;
        if (star.y < 0) star.y = canvas.height;
        // Draw
        ctx.save();
        ctx.globalAlpha = star.opacity;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.shadowColor = star.color;
        ctx.shadowBlur = 6 * star.radius;
        ctx.fill();
        ctx.restore();
      });

      // Update and draw meteors
      for (let i = meteors.length - 1; i >= 0; i--) {
        const meteor = meteors[i]
        meteor.x += meteor.vx
        meteor.y += meteor.vy
        meteor.opacity -= 0.01

        if (meteor.opacity <= 0) {
          meteors.splice(i, 1)
          continue
        }

        // Draw meteor trail
        const angle = Math.atan2(meteor.vy, meteor.vx)
        const trailX = meteor.x - Math.cos(angle) * meteor.length
        const trailY = meteor.y - Math.sin(angle) * meteor.length

        const gradient = ctx.createLinearGradient(trailX, trailY, meteor.x, meteor.y)
        gradient.addColorStop(0, `rgba(0, 217, 255, 0)`)
        gradient.addColorStop(0.7, `rgba(0, 217, 255, ${meteor.opacity * 0.5})`)
        gradient.addColorStop(1, `rgba(0, 217, 255, ${meteor.opacity})`)

        ctx.strokeStyle = gradient
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(trailX, trailY)
        ctx.lineTo(meteor.x, meteor.y)
        ctx.stroke()
      }

      createMeteor()
      meteorCounter++

      requestAnimationFrame(animate)
    }

    animate()

    // Handle window resize
    const handleResize = () => {
      setCanvasSize()
      generateStars()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-60"
      style={{ background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)" }}
    />
  )
}
