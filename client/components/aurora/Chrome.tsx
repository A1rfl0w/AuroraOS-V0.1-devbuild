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

export function Dock({ onOpenBrowser }: { onOpenBrowser: () => void }) {
  return null;
}

export function Taskbar() {
  const nav = useNavigate();
  const [openBrowser, setOpenBrowser] = useState(false);
  const [openConsole, setOpenConsole] = useState(false);
  const [openManager, setOpenManager] = useState(false);
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [query, setQuery] = useState("");
  const [initialUrl, setInitialUrl] = useState<string | undefined>(undefined);

  function track(id: string, name: string, open: boolean) {
    setProcesses((ps) => {
      const rest = ps.filter((p) => p.id !== id);
      return open ? [...rest, { id, name }] : rest;
    });
  }

  return (
    <>
      <div className="fixed bottom-0 inset-x-0 z-40 h-14 px-2 md:px-4 flex items-center gap-2 bg-background/70 backdrop-blur border-t border-white/10">
        <Button variant="secondary" className="bg-white/10 border-white/20" onClick={() => nav("/")}>Start</Button>
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
            else if (id.startsWith("gh:")) {
              // Launch in browser modal
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
          {id === "browser" ? "🌐" : id === "console" ? "⌨️" : id === "settings" ? "⚙️" : id === "store" ? "🛍️" : id === "apps" ? "🗂️" : "📦"}
        </Button>
      ))}
    </div>
  );
}
