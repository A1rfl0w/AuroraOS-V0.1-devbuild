import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login, registerUser } from "@/lib/auth";

const QUESTIONS = [
  "What city were you born in?",
  "What was the name of your first pet?",
  "What is your favorite teacher's last name?",
];

export function AuthModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [securityQuestion, setSecurityQuestion] = useState(QUESTIONS[0]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="bg-white/10 backdrop-blur border-white/20">Sign in</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Welcome to AuroraOS</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="space-y-3">
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                setError(null);
                const form = e.currentTarget as HTMLFormElement;
                const email = (form.elements.namedItem("email") as HTMLInputElement).value;
                const password = (form.elements.namedItem("password") as HTMLInputElement).value;
                const answer = (form.elements.namedItem("answer") as HTMLInputElement)?.value;
                const res = await login({ email, password, answer });
                setLoading(false);
                if (res.ok) {
                  setOpen(false);
                } else {
                  setError(res.error);
                  if (res.needsSecurity) setSecurityQuestion(res.question || QUESTIONS[0]);
                }
              }}
            >
              <div className="grid gap-2">
                <label className="text-sm">Email</label>
                <Input name="email" type="email" required placeholder="you@example.com" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm">Password</label>
                <Input name="password" type="password" required placeholder="••••••••" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm">Security answer</label>
                <Input name="answer" placeholder={securityQuestion} />
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button disabled={loading} className="w-full">{loading ? "Signing in..." : "Sign in"}</Button>
            </form>
          </TabsContent>
          <TabsContent value="signup" className="space-y-3">
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                setError(null);
                const form = e.currentTarget as HTMLFormElement;
                const name = (form.elements.namedItem("name") as HTMLInputElement).value;
                const email = (form.elements.namedItem("email") as HTMLInputElement).value;
                const password = (form.elements.namedItem("password") as HTMLInputElement).value;
                const question = (form.elements.namedItem("question") as HTMLSelectElement).value;
                const answer = (form.elements.namedItem("answer") as HTMLInputElement).value;

                const res = await registerUser({
                  name,
                  email,
                  password,
                  security: [{ question, answer }],
                });
                setLoading(false);
                if (res.ok) setOpen(false);
                else setError(res.error);
              }}
            >
              <div className="grid gap-2">
                <label className="text-sm">Full name</label>
                <Input name="name" required placeholder="Alex Doe" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm">Email</label>
                <Input name="email" type="email" required placeholder="you@example.com" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm">Password</label>
                <Input name="password" type="password" required placeholder="Create a strong password" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm">Security question</label>
                <select name="question" className="h-10 rounded-md border bg-background px-3">
                  {QUESTIONS.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm">Answer</label>
                <Input name="answer" required placeholder="Answer to your question" />
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button disabled={loading} className="w-full">{loading ? "Creating account..." : "Create account"}</Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
