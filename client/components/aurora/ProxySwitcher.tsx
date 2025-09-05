import { PROXY_NODES, ProxyNode, getSelectedProxy, setSelectedProxy } from "@/lib/proxy";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";

export function ProxySwitcher() {
  const [node, setNode] = useState<ProxyNode>("direct");

  useEffect(() => {
    setNode(getSelectedProxy());
  }, []);

  return (
    <div className="min-w-[220px]">
      <Select
        value={node}
        onValueChange={(v) => {
          const nv = v as ProxyNode;
          setNode(nv);
          setSelectedProxy(nv);
        }}
      >
        <SelectTrigger className="bg-white/10 backdrop-blur text-sm border-white/20">
          <SelectValue placeholder="Proxy" />
        </SelectTrigger>
        <SelectContent className="backdrop-blur bg-background/90">
          {PROXY_NODES.map((n) => (
            <SelectItem key={n.id} value={n.id}>
              {n.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
