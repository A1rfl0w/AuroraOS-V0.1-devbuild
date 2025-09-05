import { useEffect, useState } from "react";
import { TopBar, Taskbar } from "@/components/aurora/Chrome";
import { Desktop } from "@/components/aurora/Desktop";
import { getSettings } from "@/lib/settings";
import { ensureDefaultDevApps } from "@/lib/apps";

export default function Index() {
  const [wallpaper, setWallpaper] = useState<string>(getSettings().wallpaper);

  useEffect(() => {
    const settings = getSettings();
    setWallpaper(settings.wallpaper);
    const root = document.documentElement;
    root.style.setProperty("--aurora-wallpaper", settings.wallpaper);
    root.style.setProperty("--primary", settings.accent);
    void ensureDefaultDevApps();
  }, []);

  return (
    <div
      className="min-h-screen text-foreground"
      style={{ backgroundImage: "var(--aurora-wallpaper)" }}
    >
      <TopBar />
      <main className="pt-20 px-4">
        <section className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <Desktop
              onLaunch={(id) => {
                localStorage.setItem("aurora_browser_initial", "");
                localStorage.setItem("aurora_open_id", id);
                window.dispatchEvent(new Event("aurora-open"));
              }}
            />
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur p-6 shadow-xl">
            <div className="aspect-[16/10] rounded-xl border border-white/20 bg-gradient-to-br from-sky-400/30 via-indigo-400/25 to-emerald-400/25 grid place-items-center text-center p-6">
              <p className="text-sm sm:text-base max-w-md">
                Use the Start menu to launch apps, pin to taskbar/desktop, open
                Store and Files, and bookmark pages from the browser.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Taskbar />
    </div>
  );
}
