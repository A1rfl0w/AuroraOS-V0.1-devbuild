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

export function Dock({ onOpenBrowser }: { onOpenBrowser: () => void }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 rounded-2xl border border-white/15 bg-white/10 backdrop-blur p-2 shadow-2xl">
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenBrowser}
          className="group h-12 w-12 rounded-xl grid place-items-center bg-gradient-to-br from-sky-400/40 to-indigo-400/40 border border-white/20 hover:from-sky-400/60 hover:to-indigo-400/60 transition"
          aria-label="Aurora Browser"
        >
          <span className="i lucide-globe text-white/90 group-hover:scale-110 transition">🌐</span>
        </button>
        <button
          onClick={() => (window.location.href = "/apps")}
          className="h-12 w-12 rounded-xl grid place-items-center bg-gradient-to-br from-emerald-400/40 to-teal-400/40 border border-white/20"
          aria-label="Apps"
        >
          <span>🗂️</span>
        </button>
        <button
          onClick={() => (window.location.href = "/settings")}
          className="h-12 w-12 rounded-xl grid place-items-center bg-gradient-to-br from-fuchsia-400/40 to-pink-400/40 border border-white/20"
          aria-label="Settings"
        >
          <span>⚙️</span>
        </button>
      </div>
    </div>
  );
}
