"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export function HeroImages({
  photos,
  locale = "vi",
}: {
  photos: { id: string; url: string; alt: string }[];
  locale?: string;
}) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const en = locale === "en";
  const multiple = photos.length > 1;
  const current = active % Math.max(1, photos.length);

  function goTo(index: number) {
    setActive((index + photos.length) % photos.length);
  }

  useEffect(() => {
    if (!multiple || !playing || hovered || focused) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    function syncAutoplay() {
      clearInterval(timer);
      if (!preference.matches)
        timer = setInterval(
          () => setActive((i) => (i + 1) % photos.length),
          6500,
        );
    }
    syncAutoplay();
    preference.addEventListener("change", syncAutoplay);
    return () => {
      clearInterval(timer);
      preference.removeEventListener("change", syncAutoplay);
    };
  }, [multiple, photos.length, playing, hovered, focused, active]);

  if (!photos.length) return null;

  return (
    <div
      className="hero-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={en ? "Portrait gallery" : "Bộ ảnh giới thiệu"}
      tabIndex={multiple ? 0 : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setFocused(false);
      }}
      onKeyDown={(event) => {
        if (!multiple || !["ArrowLeft", "ArrowRight"].includes(event.key))
          return;
        event.preventDefault();
        goTo(current + (event.key === "ArrowRight" ? 1 : -1));
      }}
    >
      <div
        className="hero-visual"
        onPointerDown={(event) => {
          if (event.pointerType === "touch") touchStart.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (!multiple || touchStart.current === null) return;
          const distance = touchStart.current - event.clientX;
          touchStart.current = null;
          if (Math.abs(distance) > 45) goTo(current + (distance > 0 ? 1 : -1));
        }}
        onPointerCancel={() => {
          touchStart.current = null;
        }}
      >
        {photos.map((photo, index) => (
          <Image
            key={photo.id}
            className={`hero-slide ${index === current ? "visible" : ""}`}
            src={photo.url}
            alt={photo.alt}
            aria-hidden={index !== current}
            fill
            priority={index === 0}
            sizes="(max-width: 540px) 300px, (max-width: 800px) 340px, (max-width: 1100px) 40vw, 440px"
          />
        ))}
        <span className="portrait-corners" aria-hidden="true" />
        {multiple && (
          <>
            <button
              type="button"
              className="carousel-arrow previous"
              onClick={() => goTo(current - 1)}
              aria-label={en ? "Previous photo" : "Ảnh trước"}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="carousel-arrow next"
              onClick={() => goTo(current + 1)}
              aria-label={en ? "Next photo" : "Ảnh tiếp theo"}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
      <div className="carousel-footer">
        <div
          className="slide-controls"
          role="group"
          aria-label={en ? "Choose a photo" : "Chọn ảnh"}
        >
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              className={index === current ? "active" : ""}
              onClick={() => goTo(index)}
              aria-label={`${en ? "Photo" : "Ảnh"} ${index + 1}`}
              aria-pressed={index === current}
            />
          ))}
        </div>
        <span
          className="carousel-count"
          aria-live={playing && !hovered && !focused ? "off" : "polite"}
        >
          {String(current + 1).padStart(2, "0")} /{" "}
          {String(photos.length).padStart(2, "0")}
        </span>
        {multiple && (
          <button
            type="button"
            className="carousel-autoplay"
            onClick={() => setPlaying((value) => !value)}
            aria-label={
              playing
                ? en
                  ? "Pause slideshow"
                  : "Tạm dừng trình chiếu"
                : en
                  ? "Play slideshow"
                  : "Tiếp tục trình chiếu"
            }
          >
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}
