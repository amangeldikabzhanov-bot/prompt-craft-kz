/** Atmospheric background: gradient orbs + subtle particle field. */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 37) % 100,
  top: (i * 61) % 100,
  size: 1 + (i % 3),
  delay: (i % 7) * 1.3,
  duration: 8 + (i % 5) * 2,
}));

export function GlowBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div className="animate-drift absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary/25 blur-[120px]" />
      <div className="animate-drift absolute top-1/3 -right-40 h-[26rem] w-[26rem] rounded-full bg-violet/20 blur-[130px] [animation-delay:-8s]" />
      <div className="animate-pulse-glow absolute bottom-0 left-1/3 h-[22rem] w-[22rem] rounded-full bg-primary-glow/10 blur-[120px]" />
      <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,color-mix(in_oklab,var(--border)_45%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--border)_45%,transparent)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="animate-float absolute rounded-full bg-primary-glow/50"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
