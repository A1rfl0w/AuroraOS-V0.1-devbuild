import { cn } from "@/lib/utils";

export function AuroraLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="relative inline-flex h-6 w-6 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-[conic-gradient(at_50%_50%,#7dd3fc_0deg,#c4b5fd_120deg,#6ee7b7_240deg,#7dd3fc_360deg)] blur-[2px]" />
        <span className="relative h-4 w-4 rounded-full bg-background border border-white/40 shadow-inner" />
      </span>
      <span className="font-extrabold tracking-tight text-lg">AuroraOS</span>
    </div>
  );
}
