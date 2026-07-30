import { useState, type FormEvent } from "react";
import { useAuth } from "../services/auth";

export function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative min-h-[44vh] lg:min-h-screen overflow-hidden bg-ink text-white">
        <div
          className="absolute inset-0 scale-105"
          style={{
            backgroundImage:
              "linear-gradient(155deg, rgba(11,31,51,0.5) 8%, rgba(11,31,51,0.88) 72%), url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1800&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="hero-glow absolute -left-20 top-24 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
        <div className="hero-glow absolute bottom-16 right-0 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl [animation-delay:1.5s]" />

        <div className="relative z-10 flex h-full flex-col justify-center p-8 sm:p-12 lg:p-16">
          <div className="animate-fade-up max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Dealership workspace
            </p>
            <h1 className="font-display mt-5 text-4xl leading-[1.1] font-semibold sm:text-5xl lg:text-6xl">
              Car Dealership Inventory System
            </h1>
          </div>
        </div>
      </section>

      <section className="relative flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-accent/10 to-transparent" />
        <form
          onSubmit={handleSubmit}
          className="animate-fade-up surface relative w-full max-w-md space-y-6 rounded-xl p-7 sm:p-9"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              {mode === "login" ? "Welcome back" : "Get started"}
            </p>
            <h2 className="font-display mt-2 text-3xl font-bold text-ink sm:text-4xl">
              {mode === "login" ? "Sign in" : "Create account"}
            </h2>
            <p className="mt-2 text-sm text-slate">
              Access inventory and purchase tools with your account.
            </p>
          </div>

          {mode === "register" ? (
            <label className="block space-y-2">
              <span className="text-sm font-medium text-steel">Full name</span>
              <input
                type="text"
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Your name"
              />
            </label>
          ) : null}

          <label className="block space-y-2">
            <span className="text-sm font-medium text-steel">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@email.com"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-steel">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-12"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-steel"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          {error ? (
            <p className="animate-fade-in rounded-md bg-red-50 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Login"
                : "Create account"}
          </button>

          <p className="text-sm text-slate">
            {mode === "login" ? "Need an account?" : "Already registered?"}{" "}
            <button
              type="button"
              className="font-semibold text-accent underline-offset-4 hover:underline"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
                setName("");
              }}
            >
              {mode === "login" ? "Register" : "Login"}
            </button>
          </p>
        </form>
      </section>
    </div>
  );
}
