import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { TopBar } from "@/components/aurora/Chrome";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen" style={{ backgroundImage: "var(--aurora-wallpaper)" }}>
      <TopBar />
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-foreground/70 mb-4">Oops! Page not found</p>
          <a href="/" className="text-primary underline">Return to Home</a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
