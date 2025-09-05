import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface ProcessInfo {
  id: string;
  name: string;
}

export function TaskManager({ open, onOpenChange, processes, onKill }: {
  open: boolean; onOpenChange: (v: boolean) => void; processes: ProcessInfo[]; onKill: (id: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Task Manager</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {processes.length === 0 && <p className="text-sm text-muted-foreground">No running apps.</p>}
          {processes.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded border p-2">
              <div className="text-sm font-medium">{p.name}</div>
              <Button variant="destructive" size="sm" onClick={() => onKill(p.id)}>End task</Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
