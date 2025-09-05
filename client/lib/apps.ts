export type AppId = string;

export type BuiltinId = "browser" | "console" | "settings" | "store" | "apps";

export interface BaseApp {
  id: AppId;
  name: string;
  icon: string; // emoji or url
  type: "builtin" | "github";
  launchUrl?: string; // for github/external
}

const PINS_KEY = "aurora_pins_v1";
const APPS_KEY = "aurora_installed_apps_v1";

export function getPinned(): AppId[] {
  const raw = localStorage.getItem(PINS_KEY);
  return raw ? (JSON.parse(raw) as AppId[]) : ["browser", "store", "settings"];
}

export function setPinned(pins: AppId[]) {
  localStorage.setItem(PINS_KEY, JSON.stringify(pins));
}

export function togglePin(id: AppId) {
  const pins = getPinned();
  if (pins.includes(id)) setPinned(pins.filter((p) => p !== id));
  else setPinned([...pins, id]);
}

export interface InstalledApp extends BaseApp {}

export function getInstalled(): Record<AppId, InstalledApp> {
  const raw = localStorage.getItem(APPS_KEY);
  return raw ? (JSON.parse(raw) as Record<AppId, InstalledApp>) : {};
}

export function saveInstalled(map: Record<AppId, InstalledApp>) {
  localStorage.setItem(APPS_KEY, JSON.stringify(map));
}

export async function installGithub(repoUrl: string): Promise<{ ok: true; app: InstalledApp } | { ok: false; error: string }>{
  try {
    const m = repoUrl.match(/github.com\/(.+?)\/(.+?)(?:$|\?|#|\/) /);
    // safer regex without trailing space
  } catch (_) {}
  // Robust parsing
  const url = new URL(repoUrl);
  if (url.hostname !== "github.com") return { ok: false, error: "Only GitHub repos supported for now" } as const;
  const [owner, repo] = url.pathname.replace(/^\//, "").split("/");
  if (!owner || !repo) return { ok: false, error: "Invalid GitHub repository URL" } as const;
  const api = `https://api.github.com/repos/${owner}/${repo}`;
  const res = await fetch(api);
  if (!res.ok) return { ok: false, error: `GitHub API error: ${res.status}` } as const;
  const data = (await res.json()) as any;
  const homepage: string | undefined = data.homepage || undefined;
  const defaultBranch: string = data.default_branch;
  const ghPages = homepage && /^https?:\/\//.test(homepage) ? homepage : undefined;
  // Fallback to repo page if no homepage
  const launchUrl = ghPages || `https://github.com/${owner}/${repo}`;
  const id: AppId = `gh:${owner}/${repo}`;

  const apps = getInstalled();
  apps[id] = {
    id,
    name: data.full_name || `${owner}/${repo}`,
    icon: data.owner?.avatar_url || "📦",
    type: "github",
    launchUrl,
  };
  saveInstalled(apps);
  return { ok: true, app: apps[id] } as const;
}

export function uninstall(id: AppId) {
  const apps = getInstalled();
  delete apps[id];
  saveInstalled(apps);
  setPinned(getPinned().filter((p) => p !== id));
}

export function listAllApps(): InstalledApp[] {
  const builtins: InstalledApp[] = [
    { id: "browser", name: "Browser", icon: "🌐", type: "builtin" },
    { id: "console", name: "Console", icon: "⌨️", type: "builtin" },
    { id: "settings", name: "Settings", icon: "⚙️", type: "builtin" },
    { id: "store", name: "Store", icon: "🛍️", type: "builtin" },
    { id: "apps", name: "Apps", icon: "🗂️", type: "builtin" },
  ];
  const installed = Object.values(getInstalled());
  return [...builtins, ...installed];
}
