import { useEffect, useState } from "react";
import { getDesktopPins, listAllApps, getBookmarks, getPinned, togglePin, toggleDesktopPin } from "@/lib/apps";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";

export function Desktop({ onLaunch }: { onLaunch: (id: string) => void }) {
  const [pins, setPins] = useState<string[]>(getDesktopPins());
  const [apps, setApps] = useState(listAllApps());
  const [bms, setBms] = useState(getBookmarks());

  useEffect(() => {
    const iv = setInterval(() => {
      setPins(getDesktopPins());
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  function labelFor(id: string): { icon: string; name: string } {
    if (id.startsWith("bm:")) {
      const bm = bms.find((b) => `bm:${b.id}` === id);
      return { icon: "🔖", name: bm ? bm.title : id };
    }
    const app = apps.find((a) => a.id === id);
    return { icon: app?.icon || "📦", name: app?.name || id };
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] p-6 w-48 grid grid-cols-1 auto-rows-[96px] gap-4">
      {pins.map((id) => {
        const { icon, name } = labelFor(id);
        const pinnedToTaskbar = getPinned().includes(id);
        return (
          <ContextMenu key={id}>
            <ContextMenuTrigger asChild>
              <button onDoubleClick={() => onLaunch(id)} className="w-24 h-24 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 backdrop-blur flex flex-col items-center justify-center gap-2 text-center shadow-sm">
                <span className="text-2xl" aria-hidden>{icon}</span>
                <span className="text-xs line-clamp-2">{name}</span>
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => onLaunch(id)}>Open</ContextMenuItem>
              <ContextMenuItem onClick={() => togglePin(id)}>{pinnedToTaskbar ? "Unpin from taskbar" : "Pin to taskbar"}</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => toggleDesktopPin(id)}>Remove from desktop</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
    </div>
  );
}
