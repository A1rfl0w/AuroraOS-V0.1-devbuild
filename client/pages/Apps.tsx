import { TopBar } from "@/components/aurora/Chrome";
import { useEffect, useState } from "react";
import { listAllApps, getPinned, togglePin } from "@/lib/apps";
import { Button } from "@/components/ui/button";

export default function Apps() {
  const [apps, setApps] = useState(listAllApps());
  const [pins, setPins] = useState<string[]>(getPinned());
  useEffect(() => { setApps(listAllApps()); setPins(getPinned()); }, []);

  return (
    <div className="min-h-screen" style={{ backgroundImage: "var(--aurora-wallpaper)" }}>
      <TopBar />
      <div className="max-w-4xl mx-auto pt-20 px-4">
        <h1 className="text-3xl font-bold text-center">Apps</h1>
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          {apps.map((app) => (
            <div key={app.id} className="rounded border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{app.icon}</span>
                <span className="font-medium">{app.name}</span>
              </div>
              <Button
                variant="secondary"
                onClick={() => { togglePin(app.id); setPins(getPinned()); }}
              >
                {pins.includes(app.id) ? "Unpin" : "Pin"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
