import { useEffect, useState } from "react";
import { getDesktopPins, listAllApps, getBookmarks } from "@/lib/apps";

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
    <div className="grid gap-4 p-6 max-w-sm">
      {pins.map((id) => {
        const { icon, name } = labelFor(id);
        return (
          <button key={id} onDoubleClick={() => onLaunch(id)} className="w-24 h-24 rounded-lg bg-white/10 border border-white/20 backdrop-blur flex flex-col items-center justify-center gap-2 text-center">
            <span className="text-2xl" aria-hidden>{icon}</span>
            <span className="text-xs line-clamp-2">{name}</span>
          </button>
        );
      })}
    </div>
  );
}
