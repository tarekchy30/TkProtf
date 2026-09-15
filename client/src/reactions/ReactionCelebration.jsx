import React, { useEffect, useMemo, useState } from "react";

const PARTICLES = 32;
const ACCENTS = ["·", "✦", "✧"];

export default function ReactionCelebration({ celebration }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!celebration) return undefined;
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 2800);
    return () => window.clearTimeout(timer);
  }, [celebration]);

  const particles = useMemo(() => {
    if (!celebration) return [];
    return Array.from({ length: PARTICLES }, (_, index) => ({
      id: `${celebration.id}-${index}`,
      symbol: index % 5 === 0 ? ACCENTS[index % ACCENTS.length] : celebration.reaction,
      left: `${4 + ((index * 29 + celebration.id) % 92)}%`,
      delay: `${(index % 9) * 34}ms`,
      duration: `${1900 + (index % 8) * 110}ms`,
      size: `${18 + (index % 7) * 4}px`,
      drift: `${(index % 7 - 3) * 28}px`,
      rotation: `${index % 2 ? 18 : -18}deg`,
    }));
  }, [celebration]);

  if (!celebration || !visible) return null;

  return (
    <div className="reactionCelebration" aria-hidden="true">
      <div
        className="reactionBurst"
        style={{
          left: celebration.origin.x,
          top: celebration.origin.y,
        }}
      >
        {Array.from({ length: 8 }, (_, index) => (
          <span key={index}>{index % 2 ? "✨" : celebration.reaction}</span>
        ))}
      </div>
      <div className="reactionParticles">
        {particles.map((particle) => (
          <span
            key={particle.id}
            style={{
              left: particle.left,
              "--reaction-delay": particle.delay,
              "--reaction-duration": particle.duration,
              "--reaction-size": particle.size,
              "--reaction-drift": particle.drift,
              "--reaction-rotation": particle.rotation,
            }}
          >
            {particle.symbol}
          </span>
        ))}
      </div>
    </div>
  );
}
