import { AuroraLogo } from "./Brand";
import { ProxySwitcher } from "./ProxySwitcher";
import { AuthModal } from "./AuthModal";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

export function TopBar() {
  const [userName, setUserName] = useState<string | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    const u = getCurrentUser();
    setUserName(u?.username ?? null);
  }, []);

  return (
    <div className="fixed top-0 inset-x-0 z-40 h-14 px-4 md:px-6 flex items-center justify-between backdrop-blur bg-background/60 border-b border-white/10">
      <div className="flex items-center gap-3">
        <button onClick={() => nav("/")}> <AuroraLogo /> </button>
        <span className="hidden sm:inline text-xs text-foreground/60">A next-gen web OS</span>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => nav("/")}>Home</Button>
        <ProxySwitcher />
        <Button variant="ghost" onClick={() => nav("/settings")}>Settings</Button>
        {userName ? (
          <div className="flex items-center gap-2">
            <span className="text-sm">{userName}</span>
            <Button
              variant="secondary"
              className="bg-white/10 border-white/20"
              onClick={() => {
                logout();
                setUserName(null);
              }}
            >
              Sign out
            </Button>
          </div>
        ) : (
          <AuthModal />
        )}
      </div>
    </div>
  );
}

import { AuroraBrowser } from "./Browser";
import { AuroraConsole } from "./Console";
import { TaskManager, type ProcessInfo } from "./TaskManager";
import { AuroraFiles } from "./Files";
import { listAllApps, togglePin, getPinned, toggleDesktopPin, getDesktopPins, getBookmarks } from "@/lib/apps";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";

export function Dock({ onOpenBrowser }: { onOpenBrowser: () => void }) {
  return null;
}

export function Taskbar() {
  const nav = useNavigate();
  const [openBrowser, setOpenBrowser] = useState(false);
  const [openConsole, setOpenConsole] = useState(false);
  const [consoleCwd, setConsoleCwd] = useState<string | undefined>(undefined);
  const [openFiles, setOpenFiles] = useState(false);
  const [openManager, setOpenManager] = useState(false);
  const [openStart, setOpenStart] = useState(false);
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [query, setQuery] = useState("");
  const [initialUrl, setInitialUrl] = useState<string | undefined>(undefined);

  function track(id: string, name: string, open: boolean) {
    setProcesses((ps) => {
      const rest = ps.filter((p) => p.id !== id);
      return open ? [...rest, { id, name }] : rest;
    });
  }

  useEffect(() => {
    const handler = () => {
      const id = localStorage.getItem("aurora_open_id");
      if (!id) return;
      if (id === "browser") setOpenBrowser(true);
      else if (id === "console") setOpenConsole(true);
      else if (id === "files") setOpenFiles(true);
      else if (id === "settings") nav("/settings");
      else if (id === "store") nav("/store");
      else if (id === "apps") nav("/apps");
      else if (id.startsWith("gh:")) {
        const apps = JSON.parse(localStorage.getItem("aurora_installed_apps_v1") || "{}");
        const app = apps[id];
        if (app?.launchUrl) { setInitialUrl(app.launchUrl); setOpenBrowser(true); }
      } else if (id.startsWith("bm:")) {
        const bms = JSON.parse(localStorage.getItem("aurora_bookmarks_v1") || "[]");
        const bm = bms.find((b: any) => `bm:${b.id}` === id);
        if (bm) { setInitialUrl(bm.url); setOpenBrowser(true); }
      }
      localStorage.removeItem("aurora_open_id");
    };
    window.addEventListener("aurora-open", handler);
    return () => window.removeEventListener("aurora-open", handler);
  }, []);

  return (
    <>
      <div className="fixed bottom-0 inset-x-0 z-40 h-14 px-2 md:px-4 flex items-center gap-2 bg-background/70 backdrop-blur border-t border-white/10">
        <Button variant="secondary" className="bg-white/10 border-white/20" onClick={() => setOpenStart((v) => !v)}>Start</Button>
        <div className="flex-1 max-w-xl">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                const target = `https://duckduckgo.com/?q=${encodeURIComponent(query.trim())}`;
                setInitialUrl(target);
                setOpenBrowser(true);
              }
            }}
            placeholder="Type here to search the web"
            className="w-full h-10 rounded-md bg-white/10 border border-white/20 px-3 text-sm"
          />
        </div>
        <PinnedBar
          onLaunch={(id) => {
            if (id === "browser") setOpenBrowser(true);
            else if (id === "console") setOpenConsole(true);
            else if (id === "settings") nav("/settings");
            else if (id === "store") nav("/store");
            else if (id === "apps") nav("/apps");
            else if (id === "files") setOpenFiles(true);
            else if (id.startsWith("gh:")) {
              const apps = JSON.parse(localStorage.getItem("aurora_installed_apps_v1") || "{}");
              const app = apps[id];
              if (app?.launchUrl) {
                setInitialUrl(app.launchUrl);
                setOpenBrowser(true);
              }
            }
          }}
        />
        <Button variant="ghost" onClick={() => { setOpenManager(true); }}>📊</Button>
      </div>

      {openStart && (
        <StartMenu
          onClose={() => setOpenStart(false)}
          onLaunch={(id) => {
            setOpenStart(false);
            if (id === "browser") setOpenBrowser(true);
            else if (id === "console") setOpenConsole(true);
            else if (id === "files") setOpenFiles(true);
            else if (id === "settings") nav("/settings");
            else if (id === "store") nav("/store");
            else if (id === "apps") nav("/apps");
            else if (id.startsWith("gh:")) {
              const apps = JSON.parse(localStorage.getItem("aurora_installed_apps_v1") || "{}");
              const app = apps[id];
              if (app?.launchUrl) {
                setInitialUrl(app.launchUrl);
                setOpenBrowser(true);
              }
            }
          }}
        />
      )}

      <AuroraBrowser
        open={openBrowser}
        onOpenChange={(v) => {
          setOpenBrowser(v);
          track("browser", "Aurora Browser", v);
        }}
        initialUrl={initialUrl}
      />
      <AuroraConsole
        open={openConsole}
        onOpenChange={(v) => {
          setOpenConsole(v);
          track("console", "Command Prompt", v);
        }}
      />
      <AuroraFiles
        open={openFiles}
        onOpenChange={(v) => setOpenFiles(v)}
      />
      <TaskManager
        open={openManager}
        onOpenChange={setOpenManager}
        processes={processes}
        onKill={(id) => {
          if (id === "browser") setOpenBrowser(false);
          if (id === "console") setOpenConsole(false);
        }}
      />
    </>
  );
}

function PinnedBar({ onLaunch }: { onLaunch: (id: string) => void }) {
  const [pins, setPins] = useState<string[]>([]);
  useEffect(() => {
    const read = () => setPins(JSON.parse(localStorage.getItem("aurora_pins_v1") || "[]"));
    read();
    const iv = setInterval(read, 800);
    return () => clearInterval(iv);
  }, []);
  return (
    <div className="flex items-center gap-2">
      {pins.map((id) => (
        <Button key={id} variant="ghost" onClick={() => onLaunch(id)} title={id}>
          {id === "browser" ? "🌐" : id === "console" ? "⌨️" : id === "settings" ? "⚙️" : id === "store" ? "🛍️" : id === "apps" ? "🗂️" : id === "files" ? "📁" : "📦"}
        </Button>
      ))}
    </div>
  );
}

function StartMenu({ onClose, onLaunch }: { onClose: () => void; onLaunch: (id: string) => void }) {
  const [apps, setApps] = useState(listAllApps());
  const [pins, setPins] = useState<string[]>(getPinned());
  const [desk, setDesk] = useState<string[]>(getDesktopPins());
  const [bms, setBms] = useState(getBookmarks());

  useEffect(() => {
    const iv = setInterval(() => {
      setApps(listAllApps());
      setPins(getPinned());
      setDesk(getDesktopPins());
      setBms(getBookmarks());
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="fixed bottom-14 left-2 z-50 w-[720px] max-w-[calc(100vw-1rem)] rounded-xl border border-white/15 bg-background/90 backdrop-blur shadow-2xl p-4" onMouseLeave={onClose}>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <h3 className="text-sm mb-2">Apps</h3>
          <div className="grid grid-cols-3 gap-2">
            {apps.map((a) => (
              <div key={a.id} className="rounded border p-2 flex flex-col gap-2">
                <button className="text-left" onClick={() => onLaunch(a.id)}>
                  <div className="text-xl" aria-hidden>{a.icon}</div>
                  <div className="text-sm font-medium truncate">{a.name}</div>
                </button>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => { togglePin(a.id); setPins(getPinned()); }}>{pins.includes(a.id) ? "Unpin" : "Pin"}</Button>
                  <Button size="sm" variant="secondary" onClick={() => { toggleDesktopPin(a.id); setDesk(getDesktopPins()); }}>{desk.includes(a.id) ? "Un‑desktop" : "Desktop"}</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm mb-2">Bookmarks</h3>
          <div className="space-y-2 max-h-64 overflow-auto pr-1">
            {bms.length === 0 && <p className="text-xs text-muted-foreground">No bookmarks yet</p>}
            {bms.map((b) => (
              <button key={b.id} className="w-full rounded border p-2 text-left hover:bg-white/5" onClick={() => { onLaunch("browser"); localStorage.setItem("aurora_browser_initial", b.url); }}>
                <div className="text-xs truncate">{b.title}</div>
                <div className="text-[10px] text-muted-foreground truncate">{b.url}</div>
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button size="sm" onClick={() => onLaunch("store")}>Open Store</Button>
            <Button size="sm" onClick={() => onLaunch("files")}>Open Files</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
