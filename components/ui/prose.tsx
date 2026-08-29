import { cn } from "@/lib/cn";

/*
  Prose — renders the build-time HTML of a case-study body. Styling lives in the
  `.prose` (and `.prose-case`) layers in globals.css. The HTML is produced by
  `marked` at build from trusted local markdown, so dangerouslySetInnerHTML is
  safe here.
*/

interface ProseProps {
  html: string;
  className?: string;
  /** Case-page reading rhythm: numbered headings, larger body, tighter measure. */
  variant?: "default" | "case";
}

export function Prose({ html, className, variant = "default" }: ProseProps) {
  return (
    <div
      className={cn("prose", variant === "case" && "prose-case", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
