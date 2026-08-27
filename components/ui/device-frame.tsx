import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import type { CaseImage } from "@/lib/content";

/*
  DeviceFrame — the single reusable screenshot component (design §5.4).

  Renders a pre-encoded AVIF+WebP screenshot inside minimal browser chrome
  (three dots + URL) or phone chrome. Uses a native <picture> element:
  AVIF first, WebP fallback, explicit width/height (zero CLS), native lazy
  loading, and a LQIP blur-up background. Ships zero JS. See DECISIONS.md for
  why this is preferred over next/image for these already-optimal assets.
*/

interface DeviceFrameProps {
  image: CaseImage;
  /** Chrome style. Defaults to the frame recorded in the manifest. */
  frame?: "browser" | "phone";
  /** URL shown in browser chrome. Falls back to image.url. */
  url?: string;
  /** ≤6° subtle rotation with perspective (design §5.4). */
  angle?: number;
  /** Allow the media to bleed slightly wider than its column. */
  bleed?: boolean;
  /** Hero image only — eager + high priority. Everything else lazy. */
  priority?: boolean;
  className?: string;
  /** Explicit responsive sizing hint for the image box. */
  sizes?: string;
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
}: DeviceFrameProps) {
  const chrome = frame ?? image.frame;
  const shownUrl = url ?? image.url;

  const wrapperStyle: CSSProperties | undefined = angle
    ? { transform: `perspective(1400px) rotateY(${angle}deg)`, transformOrigin: "center" }
    : undefined;

  const mediaBox = (
    <div
      className="relative overflow-hidden bg-surface-2"
      style={{
        aspectRatio: image.width && image.height ? `${image.width} / ${image.height}` : undefined,
        backgroundImage: image.blurDataURL ? `url(${image.blurDataURL})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
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
    </div>
  );

  if (chrome === "phone") {
    return (
      <div
        className={cn("mx-auto w-full", bleed && "max-w-none", className)}
        style={{ ...wrapperStyle, maxWidth: bleed ? undefined : "320px" }}
      >
        <div className="rounded-[2.5rem] border border-border bg-surface-1 p-2.5 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
          <div className="overflow-hidden rounded-[2rem]">{mediaBox}</div>
        </div>
      </div>
    );
  }

  // browser chrome
  return (
    <div className={cn("w-full", className)} style={wrapperStyle}>
      <div className="overflow-hidden rounded-media border border-border bg-surface-1 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.9)]">
        <div className="flex items-center gap-3 border-b border-border bg-surface-1 px-4 py-3">
          <span className="flex gap-2" aria-hidden>
            <span className="h-3 w-3 rounded-pill bg-surface-3" />
            <span className="h-3 w-3 rounded-pill bg-surface-3" />
            <span className="h-3 w-3 rounded-pill bg-surface-3" />
          </span>
          {shownUrl ? (
            <span className="truncate rounded-pill bg-black/40 px-3 py-1 font-mono text-[11px] text-dim">
              {shownUrl}
            </span>
          ) : null}
        </div>
        {mediaBox}
      </div>
    </div>
  );
}
