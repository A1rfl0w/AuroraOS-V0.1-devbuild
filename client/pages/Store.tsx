import { useEffect, useState } from "react";
import { TopBar } from "@/components/aurora/Chrome";
import { Button } from "@/components/ui/button";
import { installGithub, listAllApps, togglePin, getPinned } from "@/lib/apps";

export default function Store() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apps, setApps] = useState(listAllApps());
  const [pins, setPins] = useState<string[]>(getPinned());

  useEffect(() => { setApps(listAllApps()); setPins(getPinned()); }, []);

  return (
    <div className="min-h-screen" style={{ backgroundImage: "var(--aurora-wallpaper)" }}>
      <TopBar />
      <div className="max-w-4xl mx-auto pt-20 px-4 space-y-6">
        <h1 className="text-3xl font-bold">Aurora Store</h1>
        <p className="text-muted-foreground">Install GitHub repositories as apps. If the project has a homepage (GitHub Pages), we'll launch it; otherwise we link to the repo.</p>
        <form
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true); setError(null);
            const res = await installGithub(repoUrl.trim());
            setLoading(false);
            if (!res.ok) setError(res.error);
            setApps(listAllApps());
          }}
        >
          <input
            className="flex-1 h-10 rounded-md bg-white/10 border border-white/20 px-3 text-sm"
            placeholder="https://github.com/owner/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
          <Button disabled={loading}>{loading ? "Installing..." : "Install"}</Button>
        </form>
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="grid sm:grid-cols-2 gap-4 pt-4">
          {apps.map((app) => (
            <div key={app.id} className="rounded-lg border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl" aria-hidden>{app.icon}</span>
                <div>
                  <div className="font-medium">{app.name}</div>
                  <div className="text-xs text-muted-foreground">{app.type}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    togglePin(app.id);
                    setPins(getPinned());
                  }}
                >
                  {pins.includes(app.id) ? "Unpin" : "Pin"}
                </Button>
                {app.launchUrl && (
                  <a href={app.launchUrl} target="_blank" rel="noreferrer">
                    <Button>Open</Button>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
