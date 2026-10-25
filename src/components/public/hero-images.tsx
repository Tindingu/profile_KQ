"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
export function HeroImages({
  photos,
}: {
  photos: { id: string; url: string; alt: string }[];
}) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (
      photos.length < 2 ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timer = setInterval(
      () => setActive((i) => (i + 1) % photos.length),
      6500,
    );
    return () => clearInterval(timer);
  }, [photos.length]);
  return (
    <>
      {photos.map((p, i) => (
        <Image
          key={p.id}
          className={`hero-slide ${i === active ? "visible" : ""}`}
          src={p.url}
          alt={p.alt}
          fill
          priority={i === 0}
          sizes="(max-width:800px) 100vw, 50vw"
        />
      ))}
      {photos.length > 1 && (
        <div className="slide-controls">
          {photos.map((p, i) => (
            <button
              type="button"
              key={p.id}
              onClick={() => setActive(i)}
              className={active === i ? "active" : ""}
              aria-label={`Photo ${i + 1}`}
              aria-pressed={active === i}
            />
          ))}
        </div>
      )}
    </>
  );
}
