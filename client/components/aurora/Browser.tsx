import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { buildProxyUrl } from "@/lib/proxy";

export function AuroraBrowser({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [url, setUrl] = useState("https://example.com");
  const [loading, setLoading] = useState(false);
  const [html, setHtml] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!open) return;
    void navigate(url);
  }, [open]);

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
        </div>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        <div className="mt-3 flex-1 overflow-hidden rounded-lg border">
          <iframe ref={iframeRef} className="w-full h-full bg-white" srcDoc={html}></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
}
