import { cn } from "@/lib/cn";

/*
  Prose — renders the build-time HTML of a case-study body. Styling lives in the
  `.prose` layer in globals.css (token-driven). The HTML is produced by `marked`
  at build from trusted local markdown, so dangerouslySetInnerHTML is safe here.
*/

interface ProseProps {
  html: string;
  className?: string;
}

export function Prose({ html, className }: ProseProps) {
  return <div className={cn("prose", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
