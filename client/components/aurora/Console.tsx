import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Entry { type: "in" | "out"; text: string }

export function AuroraConsole({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [lines, setLines] = useState<Entry[]>([{ type: "out", text: "Microsoft Windows [AuroraOS]" }, { type: "out", text: "(c) Aurora Corporation. All rights reserved." }]);
  const [cwd, setCwd] = useState<string>("C:\\Users\\Aurora>");
  const [cmd, setCmd] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines]);

  function write(text: string) { setLines((l) => [...l, { type: "out", text }]); }

  function handle(cmdline: string) {
    const [name, ...args] = cmdline.trim().split(/\s+/);
    const arg = args.join(" ");
    switch ((name || "").toLowerCase()) {
      case "help":
        write("Commands: help, echo, time, date, ver, cls, whoami, cd, dir, clear, exit");
        break;
      case "echo":
        write(arg);
        break;
      case "time":
        write(new Date().toLocaleTimeString());
        break;
      case "date":
        write(new Date().toLocaleDateString());
        break;
      case "ver":
        write("AuroraOS Command Processor v1.0");
        break;
      case "cls":
      case "clear":
        setLines([]);
        break;
      case "whoami":
        write("aurora\\user");
        break;
      case "cd":
        if (arg) setCwd(arg.replaceAll("/", "\\"));
        write(cwd);
        break;
      case "dir":
        write("<DIR> apps  <DIR> users  console.exe  browser.exe  settings.exe");
        break;
      case "exit":
        onOpenChange(false);
        break;
      default:
        if (name) write(`'${name}' is not recognized as an internal or external command.`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[70vh] p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>Command Prompt</DialogTitle>
        </DialogHeader>
        <div className="px-4 pb-4">
          <div className="h-[48vh] overflow-y-auto rounded border bg-black text-green-400 font-mono text-sm p-3">
            {lines.map((l, i) => (
              <div key={i} className="whitespace-pre-wrap">{l.type === "in" ? "> " : ""}{l.text}</div>
            ))}
            <div ref={endRef} />
          </div>
          <form
            className="mt-2 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const s = cmd.trim();
              if (!s) return;
              setLines((l) => [...l, { type: "in", text: `${cwd} ${s}` }]);
              handle(s);
              setCmd("");
            }}
          >
            <span className="font-mono text-sm text-foreground/70">{cwd}</span>
            <Input value={cmd} onChange={(e) => setCmd(e.target.value)} autoFocus placeholder="Type a command (help)" />
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
