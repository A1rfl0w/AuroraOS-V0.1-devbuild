import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { buildProxyUrl } from "@/lib/proxy";
import { addBookmark, toggleDesktopPin } from "@/lib/apps";

export function AuroraBrowser({ open, onOpenChange, initialUrl }: { open: boolean; onOpenChange: (v: boolean) => void; initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl ?? "https://example.com");
  const [loading, setLoading] = useState(false);
  const [html, setHtml] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!open) return;
    const u = initialUrl || localStorage.getItem("aurora_browser_initial") || url;
    if (u) {
      setUrl(u);
      localStorage.removeItem("aurora_browser_initial");
      void navigate(u);
    } else {
      void navigate(url);
    }
  }, [open, initialUrl]);

  async function navigate(u: string) {
    try {
      setLoading(true);
      setError(null);
      const proxyUrl = buildProxyUrl(u);
      const res = await fetch(proxyUrl);
      const text = await res.text();
      setHtml(text);
    } catch (e) {
      setError("Failed to load page via proxy. Try example.com or httpbin.org");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Aurora Browser</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            onKeyDown={(e) => {
              if (e.key === "Enter") void navigate(url);
            }}
          />
          <Button onClick={() => navigate(url)} disabled={loading}>
            {loading ? "Loading..." : "Go"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              const bm = addBookmark(url, url.replace(/^https?:\/\//, ""));
              toggleDesktopPin(`bm:${bm.id}`);
            }}
            title="Bookmark & add to desktop"
          >
            🔖
          </Button>
        </div>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        <div className="mt-3 flex-1 overflow-hidden rounded-lg border">
          <iframe ref={iframeRef} className="w-full h-full bg-white" srcDoc={html}></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
}
