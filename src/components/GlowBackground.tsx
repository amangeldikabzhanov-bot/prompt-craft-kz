/** Atmospheric background: gradient orbs + subtle particle field + grid/noise. */
const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37) % 100,
  top: (i * 61) % 100,
  size: 1 + (i % 3),
  delay: (i % 7) * 1.3,
  duration: 9 + (i % 5) * 2.5,
  opacity: 0.25 + (i % 4) * 0.15,
}));

export function GlowBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      {/* Deep vertical gradient */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--primary)_9%,transparent),transparent_45%,color-mix(in_oklab,var(--violet)_8%,transparent))]" />

      {/* Ambient blobs */}
      <div className="animate-drift absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary/25 blur-[120px]" />
      <div className="animate-drift absolute top-1/3 -right-40 h-[26rem] w-[26rem] rounded-full bg-violet/20 blur-[130px] [animation-delay:-8s]" />
      <div className="animate-aurora absolute -bottom-24 left-1/4 h-[24rem] w-[34rem] rounded-full bg-primary-glow/10 blur-[140px]" />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.3] [background-image:linear-gradient(to_right,color-mix(in_oklab,var(--border)_45%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--border)_45%,transparent)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />

      {/* Noise texture */}
      <div className="noise-overlay absolute inset-0 opacity-[0.18]" />

      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="animate-float absolute rounded-full bg-primary-glow"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
