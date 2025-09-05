export type ProxyNode = "direct" | "node-us" | "node-eu";

export const PROXY_NODES: { id: ProxyNode; label: string }[] = [
  { id: "direct", label: "Direct" },
  { id: "node-us", label: "Aurora Node • US" },
  { id: "node-eu", label: "Aurora Node • EU" },
];

const STORAGE_KEY = "aurora_proxy_node";

export function getSelectedProxy(): ProxyNode {
  const v = localStorage.getItem(STORAGE_KEY) as ProxyNode | null;
  return v ?? "direct";
}

export function setSelectedProxy(node: ProxyNode) {
  localStorage.setItem(STORAGE_KEY, node);
}

export function buildProxyUrl(targetUrl: string, node?: ProxyNode) {
  const n = node ?? getSelectedProxy();
  const url = new URL(`/api/proxy/${n}`, window.location.origin);
  url.searchParams.set("url", targetUrl);
  return url.toString();
}
