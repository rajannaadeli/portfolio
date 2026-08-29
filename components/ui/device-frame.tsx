import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { CaseImage } from "@/lib/content";
import { ParallaxLayer } from "@/components/motion/ParallaxLayer";

/*
  DeviceFrame — the single reusable screenshot component (design §5.4, Phase 2 §1).

  Pre-encoded AVIF+WebP inside minimal browser or phone chrome. The media box's
  aspect-ratio always equals the source ratio, so the screenshot renders as a
  WHOLE frame — never letterboxed, never cropped through its own chrome
  (Phase-3 §1.2/§1.3). Native <picture>: AVIF first, WebP fallback, explicit
  width/height (zero CLS), lazy by default, LQIP blur-up. Band-aware: accent halo
  on dark, soft neutral shadow on light. NEVER a brightness/contrast filter.

  `composed`: fill the wrapper the caller provides (drops the phone max-width cap)
  so the frame can be centred inside a fixed-ratio slot (work rows).
  `parallax`: drift the whole frame ≤8% on scroll (no internal crop).
*/

interface DeviceFrameProps {
  image: CaseImage;
  frame?: "browser" | "phone";
  url?: string;
  angle?: number;
  bleed?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
  halo?: boolean;
  parallax?: boolean;
  composed?: boolean;
}

export function DeviceFrame({
  image,
  frame,
  url,
  angle = 0,
  bleed = false,
  priority = false,
  className,
  sizes,
  halo = false,
  parallax = false,
  composed = false,
}: DeviceFrameProps) {
  const chrome = frame ?? image.frame;
  const shownUrl = url ?? image.url;

  const wrapperStyle: CSSProperties | undefined = angle
    ? { transform: `perspective(1400px) rotateY(${angle}deg)`, transformOrigin: "center" }
    : undefined;

  const picture = (
    <picture>
      <source srcSet={image.avif} type="image/avif" sizes={sizes} />
      <source srcSet={image.webp} type="image/webp" sizes={sizes} />
      <img
        src={image.webp}
        alt={image.alt}
        width={image.width || undefined}
        height={image.height || undefined}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        sizes={sizes}
        className="block h-full w-full object-cover"
      />
    </picture>
  );

  const mediaBox = (
    <div
      className="relative overflow-hidden rounded-[10px] bg-surface-2"
      style={{
        aspectRatio: image.width && image.height ? `${image.width} / ${image.height}` : undefined,
        backgroundImage: image.blurDataURL ? `url(${image.blurDataURL})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {picture}
    </div>
  );

  let frameEl: ReactNode;
  if (chrome === "phone") {
    frameEl = (
      <div
        className={cn("mx-auto w-full", bleed && "max-w-none", className)}
        style={{ ...wrapperStyle, maxWidth: composed || bleed ? undefined : "320px" }}
      >
        <div className="device-shadow rounded-[2.5rem] border border-border bg-surface-1 p-2.5">
          <div className="overflow-hidden rounded-4xl">{mediaBox}</div>
        </div>
      </div>
    );
  } else {
    frameEl = (
      <div className={cn("w-full", className)} style={wrapperStyle}>
        <div className="device-shadow overflow-hidden rounded-media border border-border bg-surface-1">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <span className="flex gap-2" aria-hidden>
              <span className="h-3 w-3 rounded-pill bg-surface-3" />
              <span className="h-3 w-3 rounded-pill bg-surface-3" />
              <span className="h-3 w-3 rounded-pill bg-surface-3" />
            </span>
            {shownUrl ? (
              <span className="truncate rounded-pill bg-surface-3 px-3 py-1 font-mono text-[11px] text-dim">
                {shownUrl}
              </span>
            ) : null}
          </div>
          {/* bezel padding — screenshot never touches the frame edge */}
          <div className="bg-surface-2 p-2 sm:p-3">{mediaBox}</div>
        </div>
      </div>
    );
  }

  const withParallax = parallax ? <ParallaxLayer>{frameEl}</ParallaxLayer> : frameEl;
  return <Halo enabled={halo}>{withParallax}</Halo>;
}

function Halo({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  return enabled ? <div className="frame-halo">{children}</div> : <>{children}</>;
}
