export type NodeType = "dir" | "file";
export interface FSNodeBase { name: string; type: NodeType; }
export interface DirNode extends FSNodeBase { type: "dir"; children: FSNode[] }
export interface FileNode extends FSNodeBase { type: "file"; content: string }
export type FSNode = DirNode | FileNode;

const KEY = "aurora_fs_v1";

function defaultFS(): DirNode {
  return {
    name: "/",
    type: "dir",
    children: [
      { name: "Desktop", type: "dir", children: [] },
      { name: "Documents", type: "dir", children: [] },
      { name: "Downloads", type: "dir", children: [] },
    ],
  };
}

export function getFS(): DirNode {
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as DirNode) : defaultFS();
}

export function saveFS(tree: DirNode) {
  localStorage.setItem(KEY, JSON.stringify(tree));
}

function findDir(path: string, root: DirNode = getFS()): DirNode | null {
  const parts = path.split("/").filter(Boolean);
  let node: DirNode = root;
  for (const p of parts) {
    const next = node.children.find((c) => c.type === "dir" && c.name === p) as DirNode | undefined;
    if (!next) return null;
    node = next;
  }
  return node;
}

export function list(path: string): FSNode[] {
  const dir = findDir(path);
  if (!dir) return [];
  return dir.children;
}

export function mkdir(path: string, name: string) {
  const root = getFS();
  const dir = findDir(path, root);
  if (!dir) return { ok: false, error: "Path not found" } as const;
  if (dir.children.some((c) => c.name === name)) return { ok: false, error: "Name exists" } as const;
  dir.children.push({ name, type: "dir", children: [] });
  saveFS(root);
  return { ok: true } as const;
}

export function writeFile(path: string, name: string, content: string) {
  const root = getFS();
  const dir = findDir(path, root);
  if (!dir) return { ok: false, error: "Path not found" } as const;
  dir.children = dir.children.filter((c) => c.name !== name);
  dir.children.push({ name, type: "file", content });
  saveFS(root);
  return { ok: true } as const;
}

export function remove(path: string, name: string) {
  const root = getFS();
  const dir = findDir(path, root);
  if (!dir) return { ok: false, error: "Path not found" } as const;
  dir.children = dir.children.filter((c) => c.name !== name);
  saveFS(root);
  return { ok: true } as const;
}

export function readFile(path: string, name: string): { ok: true; content: string } | { ok: false; error: string } {
  const dir = findDir(path);
  if (!dir) return { ok: false, error: "Path not found" } as const;
  const f = dir.children.find((c) => c.type === "file" && c.name === name) as FileNode | undefined;
  if (!f) return { ok: false, error: "File not found" } as const;
  return { ok: true, content: f.content } as const;
}
