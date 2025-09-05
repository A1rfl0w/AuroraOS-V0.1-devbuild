export interface AuroraSettings {
  wallpaper: string; // css gradient
  accent: string; // hsl string like 260 88% 60%
  density: "comfortable" | "compact";
}

const DEFAULTS: AuroraSettings = {
  wallpaper: "linear-gradient(135deg, hsl(200 90% 55% / 0.2), hsl(270 90% 60% / 0.25), hsl(160 80% 45% / 0.2))",
  accent: "260 88% 60%",
  density: "comfortable",
};

const KEY = "aurora_settings_v1";

export function getSettings(): AuroraSettings {
  const raw = localStorage.getItem(KEY);
  return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as AuroraSettings) } : DEFAULTS;
}

export function saveSettings(s: AuroraSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
  // update CSS variables for live preview
  const root = document.documentElement;
  root.style.setProperty("--primary", s.accent);
}
