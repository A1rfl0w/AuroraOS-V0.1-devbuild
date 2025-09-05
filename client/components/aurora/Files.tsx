import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as fs from "@/lib/fs";

export function AuroraFiles({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [path, setPath] = useState<string>("/Desktop");
  const [items, setItems] = useState<fs.FSNode[]>([]);
  const [newFolder, setNewFolder] = useState("");

  function refresh() { setItems(fs.list(path)); }
  useEffect(() => { if (open) refresh(); }, [open, path]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Files — {path}</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 items-center">
          <Button size="sm" variant="secondary" onClick={() => setPath("/")}>Root</Button>
          <Button size="sm" variant="secondary" onClick={() => setPath("/Desktop")}>Desktop</Button>
          <Button size="sm" variant="secondary" onClick={() => setPath("/Documents")}>Documents</Button>
          <Button size="sm" variant="secondary" onClick={() => setPath("/Downloads")}>Downloads</Button>
        </div>
        <div className="mt-3 grid gap-2">
          {items.map((it) => (
            <div key={it.name} className="flex items-center justify-between rounded border p-2">
              <div className="flex items-center gap-2">
                <span>{it.type === "dir" ? "📁" : "📄"}</span>
                <button className="font-medium" onClick={() => it.type === "dir" && setPath(path === "/" ? `/${it.name}` : `${path}/${it.name}`)}>
                  {it.name}
                </button>
              </div>
              <Button size="sm" variant="destructive" onClick={() => { fs.remove(path, it.name); refresh(); }}>Delete</Button>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-muted-foreground">Empty folder</p>}
        </div>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => { e.preventDefault(); if (!newFolder.trim()) return; fs.mkdir(path, newFolder.trim()); setNewFolder(""); refresh(); }}
        >
          <Input value={newFolder} onChange={(e) => setNewFolder(e.target.value)} placeholder="New folder name" />
          <Button type="submit">Create folder</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
