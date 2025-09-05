import { TopBar } from "@/components/aurora/Chrome";

export default function Apps() {
  return (
    <div className="min-h-screen" style={{ backgroundImage: "var(--aurora-wallpaper)" }}>
      <TopBar />
      <div className="max-w-4xl mx-auto text-center pt-20 px-4">
        <h1 className="text-3xl font-bold">Apps</h1>
        <p className="text-muted-foreground mt-2">
          This is a placeholder for AuroraOS apps. Ask to generate app pages and we'll fill this in.
        </p>
      </div>
    </div>
  );
}
