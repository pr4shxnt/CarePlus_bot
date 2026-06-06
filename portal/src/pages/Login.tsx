import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchApi, setToken, setUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Activity, ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetchApi("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (res.success && res.data?.token && res.data?.user) {
        const loggedUser = res.data.user;

        // Ensure this is an admin
        if (loggedUser.role !== "admin") {
          setError("Access denied. Only administrators can access the portal.");
          setLoading(false);
          return;
        }

        setToken(res.data.token);
        setUser(loggedUser);
        navigate("/dashboard");
      } else {
        setError("Invalid response from server.");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background overflow-hidden font-sans">
      {/* Decorative subtle gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <Card className="w-[420px] border-border bg-card/60 backdrop-blur-xl shadow-2xl relative z-10 text-card-foreground">
        <CardHeader className="space-y-1.5 text-center pt-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary mb-2">
            <Activity className="h-6 w-6 animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
            CarePlus <span className="text-primary font-normal">Portal</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to access the system administrator dashboard.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 pt-2 pb-8">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@jarvis.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-ring pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pb-8 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-all duration-200 shadow-lg shadow-primary/10 flex items-center justify-center gap-2 h-11"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Secure Sign In</span>
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
