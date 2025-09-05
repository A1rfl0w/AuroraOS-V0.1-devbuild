import { useEffect, useState } from "react";
import { TopBar, Dock } from "@/components/aurora/Chrome";
import { AuroraBrowser } from "@/components/aurora/Browser";
import { getSettings } from "@/lib/settings";

export default function Index() {
  const [openBrowser, setOpenBrowser] = useState(false);
  const [wallpaper, setWallpaper] = useState<string>(getSettings().wallpaper);

  useEffect(() => {
    const settings = getSettings();
    setWallpaper(settings.wallpaper);
    const root = document.documentElement;
    root.style.setProperty("--aurora-wallpaper", settings.wallpaper);
    root.style.setProperty("--primary", settings.accent);
  }, []);

  return (
    <div className="min-h-screen text-foreground" style={{ backgroundImage: "var(--aurora-wallpaper)" }}>
      <TopBar />
      <main className="pt-20 px-4">
        <section className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              AuroraOS
              <span className="block text-lg sm:text-2xl font-semibold text-foreground/70">Inspired by TerbiumOS‑V2 and Windows — built for the web</span>
            </h1>
            <ul className="grid gap-2 text-sm sm:text-base text-foreground/80">
              <li>• Built‑in proxy switching from the home screen</li>
              <li>• Secure signup/login with passwords and security questions</li>
              <li>• Deep customization: wallpaper, accent, density</li>
              <li>• Beautiful desktop experience with a fast app dock</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur p-6 shadow-xl">
            <div className="aspect-[16/10] rounded-xl border border-white/20 bg-gradient-to-br from-sky-400/30 via-indigo-400/25 to-emerald-400/25 grid place-items-center text-center p-6">
              <p className="text-sm sm:text-base max-w-md">
                Open the Aurora Browser from the dock below and switch proxies instantly from the top bar. Try loading example.com or httpbin.org through the proxy.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Dock onOpenBrowser={() => setOpenBrowser(true)} />
      <AuroraBrowser open={openBrowser} onOpenChange={setOpenBrowser} />
    </div>
  );
}
