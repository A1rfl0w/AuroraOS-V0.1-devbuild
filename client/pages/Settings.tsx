import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getSettings, saveSettings, AuroraSettings } from "@/lib/settings";
import { TopBar } from "@/components/aurora/Chrome";

const WALLPAPERS: string[] = [
  "linear-gradient(120deg, hsl(200 90% 55% / 0.3), hsl(270 90% 60% / 0.3))",
  "linear-gradient(135deg, hsl(160 80% 45% / 0.25), hsl(260 90% 60% / 0.25))",
  "radial-gradient(1200px 700px at 10% 10%, hsl(200 90% 55% / 0.25), transparent), radial-gradient(1200px 700px at 90% 90%, hsl(280 90% 60% / 0.25), transparent)",
];

export default function Settings() {
  const [settings, setSettings] = useState<AuroraSettings>(getSettings());

  useEffect(() => {
    // apply wallpaper live
    const root = document.documentElement;
    root.style.setProperty("--aurora-wallpaper", settings.wallpaper);
  }, [settings.wallpaper]);

  return (
    <div className="min-h-screen" style={{ backgroundImage: "var(--aurora-wallpaper)" }}>
      <TopBar />
      <div className="max-w-3xl mx-auto space-y-8 pt-20 px-4 md:px-8">
        <h1 className="text-3xl font-bold">Aurora Settings</h1>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Wallpaper</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {WALLPAPERS.map((wp) => (
              <button
                key={wp}
                onClick={() => setSettings((s) => ({ ...s, wallpaper: wp }))}
                className="h-24 rounded-lg border overflow-hidden"
                style={{ backgroundImage: wp }}
                aria-label="Select wallpaper"
              />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Accent color</h2>
          <div className="flex gap-3">
            {[
              "260 88% 60%",
              "200 90% 55%",
              "160 80% 45%",
              "320 85% 60%",
            ].map((hsl) => (
              <button
                key={hsl}
                onClick={() => setSettings((s) => ({ ...s, accent: hsl }))}
                className="h-10 w-10 rounded-full border"
                style={{ backgroundColor: `hsl(${hsl})` }}
                aria-label="Select accent"
              />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Density</h2>
          <div className="flex gap-2">
            {(["comfortable", "compact"] as const).map((d) => (
              <Button
                key={d}
                variant={settings.density === d ? "default" : "secondary"}
                onClick={() => setSettings((s) => ({ ...s, density: d }))}
              >
                {d}
              </Button>
            ))}
          </div>
        </section>

        <div className="pt-4">
          <Button
            onClick={() => {
              saveSettings(settings);
            }}
          >
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
