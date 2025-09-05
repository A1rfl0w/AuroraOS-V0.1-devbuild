export interface SecurityQA {
  question: string;
  answerHash: string;
}

export interface AuroraUser {
  id: string;
  username: string;
  salt: string;
  passwordHash: string;
  security: SecurityQA[];
  createdAt: string;
}

const USERS_KEY = "aurora_users_v1";
const CURRENT_KEY = "aurora_current_user";

function getUsers(): Record<string, AuroraUser> {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as Record<string, AuroraUser>) : {};
}

function saveUsers(map: Record<string, AuroraUser>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(map));
}

export function getCurrentUser(): AuroraUser | null {
  const id = localStorage.getItem(CURRENT_KEY);
  if (!id) return null;
  const users = getUsers();
  return users[id] ?? null;
}

export function logout() {
  localStorage.removeItem(CURRENT_KEY);
}

async function sha256(text: string) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function registerUser(params: {
  username: string;
  password: string;
  security: { question: string; answer: string }[];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const users = getUsers();
  const exists = Object.values(users).some((u) => u.username === params.username);
  if (exists) return { ok: false, error: "Username already taken" };

  const salt = randomId();
  const passwordHash = await sha256(params.password + ":" + salt);
  const security = await Promise.all(
    params.security.map(async (qa) => ({
      question: qa.question,
      answerHash: await sha256(qa.answer.toLowerCase() + ":" + salt),
    })),
  );

  const id = randomId();
  users[id] = {
    id,
    username: params.username,
    salt,
    passwordHash,
    security,
    createdAt: new Date().toISOString(),
  };
  saveUsers(users);
  localStorage.setItem(CURRENT_KEY, id);
  return { ok: true };
}

export async function login(params: {
  username: string;
  password: string;
  answer?: string; // optional answer to first security question
}): Promise<{ ok: true } | { ok: false; error: string; needsSecurity?: boolean; question?: string }> {
  const users = getUsers();
  const user = Object.values(users).find((u) => u.username === params.username);
  if (!user) return { ok: false, error: "Invalid credentials" };

  const passHash = await sha256(params.password + ":" + user.salt);
  if (passHash !== user.passwordHash) return { ok: false, error: "Invalid credentials" };

  if (user.security.length > 0) {
    if (!params.answer) {
      return { ok: false, error: "Security answer required", needsSecurity: true, question: user.security[0].question };
    }
    const ansHash = await sha256(params.answer.toLowerCase() + ":" + user.salt);
    if (ansHash !== user.security[0].answerHash) return { ok: false, error: "Incorrect security answer", needsSecurity: true, question: user.security[0].question };
  }

  localStorage.setItem(CURRENT_KEY, user.id);
  return { ok: true };
}

export async function resetPassword(params: {
  username: string;
  answer: string;
  newPassword: string;
}): Promise<{ ok: true } | { ok: false; error: string; question?: string }> {
  const users = getUsers();
  const userEntry = Object.entries(users).find(([, u]) => u.username === params.username);
  if (!userEntry) return { ok: false, error: "User not found" };
  const [id, user] = userEntry;
  if (user.security.length === 0) return { ok: false, error: "No security question set" };
  const ansHash = await sha256(params.answer.toLowerCase() + ":" + user.salt);
  if (ansHash !== user.security[0].answerHash) return { ok: false, error: "Incorrect answer", question: user.security[0].question };

  const salt = randomId();
  const passwordHash = await sha256(params.newPassword + ":" + salt);
  users[id] = { ...user, salt, passwordHash };
  saveUsers(users);
  return { ok: true };
}
