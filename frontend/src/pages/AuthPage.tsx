import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../services/auth";

const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=2000&q=80",
];

export function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % BACKGROUND_IMAGES.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, []);

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
    <div className="auth-shell relative min-h-screen overflow-hidden">
      <div className="absolute inset-0" aria-hidden="true">
        {BACKGROUND_IMAGES.map((image, index) => (
          <div
            key={image}
            className={`auth-bg-slide ${
              index === activeImage ? "auth-bg-slide-active" : ""
            }`}
            style={{ backgroundImage: `url('${image}')` }}
          />
        ))}
        <div className="auth-bg-overlay" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="animate-fade-up w-full max-w-[420px]">
          <div className="mb-7 text-center text-white">
            <h1 className="font-display text-[1.85rem] leading-tight font-semibold sm:text-[2.15rem]">
              Car Dealership Inventory System
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="auth-card space-y-5 p-6 sm:p-8">
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink sm:text-[1.75rem]">
                {mode === "login" ? "Sign in" : "Create account"}
              </h2>
              <p className="mt-1.5 text-sm text-slate">
                {mode === "login"
                  ? "Enter your credentials to continue."
                  : "Register to browse and purchase vehicles."}
              </p>
            </div>

            {mode === "register" ? (
              <label className="block space-y-1.5">
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

            <label className="block space-y-1.5">
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

            <label className="block space-y-1.5">
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

            <p className="text-center text-sm text-slate">
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

          <div className="mt-5 flex justify-center gap-2" aria-hidden="true">
            {BACKGROUND_IMAGES.map((image, index) => (
              <span
                key={image}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === activeImage
                    ? "w-5 bg-accent"
                    : "w-1.5 bg-white/45"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
