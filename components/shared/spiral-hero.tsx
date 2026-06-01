"use client";

import dynamic from "next/dynamic";

const SpiralAnimation = dynamic(
  () =>
    import("@/components/ui/spiral-animation").then(
      (module) => module.SpiralAnimation,
    ),
  {
    ssr: false,
  },
);

export function SpiralHero() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <SpiralAnimation />
    </div>
  );
}
