import { useState, useEffect } from "react";
import type { AirQualityLevel } from "@shared/schema";

interface WeatherVideoBackgroundProps {
  level: AirQualityLevel;
}

function getYouTubeVideoId(level: AirQualityLevel): string {
  switch (level) {
    case "excellent":
    case "moderate":
      return "rL3l72sJrVU"; // 공기가 좋을 때
    case "unhealthy":
    case "hazardous":
    case "critical":
      return "E-8mmqbFH-s"; // 공기가 좋지 않을 때
    default:
      return "rL3l72sJrVU";
  }
}

export function WeatherVideoBackground({ level }: WeatherVideoBackgroundProps) {
  const videoId = getYouTubeVideoId(level);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
    }
  }, []);

  // 유튜브 embed URL with autoplay, mute, loop parameters
  const youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {!prefersReducedMotion ? (
        <iframe
          className="absolute inset-0 w-full h-full"
          style={{
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            pointerEvents: 'none',
          }}
          src={youtubeEmbedUrl}
          title="Weather background video"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          aria-hidden="true"
          data-testid="weather-video-background"
        />
      ) : (
        <div className="absolute inset-0 bg-background" />
      )}
      <div className="absolute inset-0 bg-background/30 backdrop-blur-sm" />
    </div>
  );
}
