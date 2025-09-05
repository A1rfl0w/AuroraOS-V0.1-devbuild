export type AppId = string;

export type BuiltinId =
  | "browser"
  | "console"
  | "settings"
  | "store"
  | "apps"
  | "files";

export interface BaseApp {
  id: AppId;
  name: string;
  icon: string; // emoji or url
  type: "builtin" | "github";
  launchUrl?: string; // for github/external
}

const PINS_KEY = "aurora_pins_v1"; // taskbar pins
const DESKTOP_KEY = "aurora_desktop_pins_v1"; // desktop shortcuts (AppId or bm:<id>)
const APPS_KEY = "aurora_installed_apps_v1";
const BMS_KEY = "aurora_bookmarks_v1";

export function getPinned(): AppId[] {
  const raw = localStorage.getItem(PINS_KEY);
  return raw
    ? (JSON.parse(raw) as AppId[])
    : ["browser", "store", "settings", "files"];
}

export function setPinned(pins: AppId[]) {
  localStorage.setItem(PINS_KEY, JSON.stringify(pins));
}

export function togglePin(id: AppId) {
  const pins = getPinned();
  if (pins.includes(id)) setPinned(pins.filter((p) => p !== id));
  else setPinned([...pins, id]);
}

export function getDesktopPins(): string[] {
  const raw = localStorage.getItem(DESKTOP_KEY);
  return raw ? (JSON.parse(raw) as string[]) : ["browser", "store", "files"];
}

export function setDesktopPins(pins: string[]) {
  localStorage.setItem(DESKTOP_KEY, JSON.stringify(pins));
}

export function toggleDesktopPin(id: string) {
  const pins = getDesktopPins();
  if (pins.includes(id)) setDesktopPins(pins.filter((p) => p !== id));
  else setDesktopPins([...pins, id]);
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  createdAt: string;
}
export function getBookmarks(): Bookmark[] {
  const raw = localStorage.getItem(BMS_KEY);
  return raw ? (JSON.parse(raw) as Bookmark[]) : [];
}
export function addBookmark(url: string, title: string): Bookmark {
  const bms = getBookmarks();
  const bm = {
    id: Math.random().toString(36).slice(2),
    title,
    url,
    createdAt: new Date().toISOString(),
  };
  bms.unshift(bm);
  localStorage.setItem(BMS_KEY, JSON.stringify(bms));
  return bm;
}
export function removeBookmark(id: string) {
  const bms = getBookmarks().filter((b) => b.id !== id);
  localStorage.setItem(BMS_KEY, JSON.stringify(bms));
}

export interface InstalledApp extends BaseApp {}

export function getInstalled(): Record<AppId, InstalledApp> {
  const raw = localStorage.getItem(APPS_KEY);
  return raw ? (JSON.parse(raw) as Record<AppId, InstalledApp>) : {};
}

export function saveInstalled(map: Record<AppId, InstalledApp>) {
  localStorage.setItem(APPS_KEY, JSON.stringify(map));
}

export async function installGithub(
  repoUrl: string,
): Promise<{ ok: true; app: InstalledApp } | { ok: false; error: string }> {
  const url = new URL(repoUrl);
  if (url.hostname !== "github.com")
    return { ok: false, error: "Only GitHub repos supported for now" } as const;
  const [owner, repo] = url.pathname.replace(/^\//, "").split("/");
  if (!owner || !repo)
    return { ok: false, error: "Invalid GitHub repository URL" } as const;
  const api = `https://api.github.com/repos/${owner}/${repo}`;
  const res = await fetch(api);
  if (!res.ok)
    return { ok: false, error: `GitHub API error: ${res.status}` } as const;
  const data = (await res.json()) as any;
  const homepage: string | undefined = data.homepage || undefined;
  const ghPages =
    homepage && /^https?:\/\//.test(homepage) ? homepage : undefined;
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

export async function ensureDefaultDevApps() {
  const FLAG = "aurora_seeded_dev_apps_v1";
  if (localStorage.getItem(FLAG)) return;
  const repos = [
    "nodejs/node",
    "denoland/deno",
    "oven-sh/bun",
    "vercel/next.js",
    "facebook/react",
    "withastro/astro",
    "tailwindlabs/tailwindcss",
    "vitejs/vite",
    "sveltejs/svelte",
    "angular/angular",
    "microsoft/TypeScript",
  ];
  for (const r of repos) {
    try {
      await installGithub(`https://github.com/${r}`);
    } catch {}
  }
  localStorage.setItem(FLAG, "1");
}

export function listAllApps(): InstalledApp[] {
  const builtins: InstalledApp[] = [
    { id: "browser", name: "Browser", icon: "🌐", type: "builtin" },
    { id: "console", name: "Console", icon: "⌨️", type: "builtin" },
    { id: "settings", name: "Settings", icon: "⚙️", type: "builtin" },
    { id: "store", name: "Store", icon: "🛍️", type: "builtin" },
    { id: "apps", name: "Apps", icon: "🗂️", type: "builtin" },
    { id: "files", name: "Files", icon: "📁", type: "builtin" },
  ];
  const installed = Object.values(getInstalled());
  return [...builtins, ...installed];
}
