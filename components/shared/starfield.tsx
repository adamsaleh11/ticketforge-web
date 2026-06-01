"use client";

import { useEffect, useRef } from "react";

const STAR_COUNT = 200;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

type Star = {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  driftX: number;
  driftY: number;
};

function createStars(width: number, height: number): Star[] {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: 0.45 + Math.random() * 1.35,
    opacity: 0.25 + Math.random() * 0.65,
    twinkleSpeed: 0.0008 + Math.random() * 0.0018,
    twinkleOffset: Math.random() * Math.PI * 2,
    driftX: (Math.random() - 0.5) * 0.018,
    driftY: 0.008 + Math.random() * 0.018,
  }));
}

function drawStars(
  context: CanvasRenderingContext2D,
  stars: Star[],
  width: number,
  height: number,
  time: number,
  shouldAnimate: boolean,
) {
  context.clearRect(0, 0, width, height);

  for (const star of stars) {
    if (shouldAnimate) {
      star.x = (star.x + star.driftX + width) % width;
      star.y = (star.y + star.driftY) % height;
    }

    const twinkle = shouldAnimate
      ? Math.sin(time * star.twinkleSpeed + star.twinkleOffset)
      : Math.sin(star.twinkleOffset);
    const alpha = Math.max(0.18, Math.min(0.95, star.opacity + twinkle * 0.22));

    context.beginPath();
    context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(228, 230, 241, ${alpha})`;
    context.shadowBlur = star.radius * 4;
    context.shadowColor = `rgba(192, 132, 252, ${alpha * 0.55})`;
    context.fill();
  }

  context.shadowBlur = 0;
}

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
    let animationFrame = 0;
    let stars: Star[] = [];

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const pixelRatio = window.devicePixelRatio || 1;

      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      stars = createStars(width, height);
      drawStars(context, stars, width, height, performance.now(), !reducedMotion.matches);
    };

    const animate = (time: number) => {
      drawStars(
        context,
        stars,
        window.innerWidth,
        window.innerHeight,
        time,
        !reducedMotion.matches,
      );

      if (!reducedMotion.matches) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    const start = () => {
      window.cancelAnimationFrame(animationFrame);
      resize();

      if (!reducedMotion.matches) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    start();
    window.addEventListener("resize", start);
    reducedMotion.addEventListener("change", start);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", start);
      reducedMotion.removeEventListener("change", start);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-screen w-screen bg-background"
    />
  );
}
