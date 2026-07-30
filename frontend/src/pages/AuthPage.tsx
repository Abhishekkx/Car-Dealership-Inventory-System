import { useState, type FormEvent } from "react";
import { useAuth } from "../services/auth";

export function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        await register(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <section className="relative hidden lg:flex flex-col justify-between bg-[#10141c] text-white p-12 overflow-hidden">
        <div
          className="absolute inset-0 opacity-45"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(196,92,38,0.5), transparent 55%), url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative z-10">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70">
            Inventory System
          </p>
          <h1 className="mt-6 font-serif text-5xl leading-none">
            Car Dealership
          </h1>
        </div>
        <p className="relative z-10 max-w-md text-lg text-white/80">
          Sign in to manage stock, search vehicles, and complete purchases.
        </p>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10 bg-[#f4f7fb]">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[#c45c26]">
              {mode === "login" ? "Welcome back" : "Create access"}
            </p>
            <h2 className="mt-2 font-serif text-4xl text-[#10141c]">
              {mode === "login" ? "Sign in" : "Register"}
            </h2>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#1c2433]">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c45c26]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#1c2433]">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#c45c26]"
            />
          </label>

          {error ? (
            <p className="text-sm text-red-700 bg-red-50 px-3 py-2">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c45c26] hover:bg-[#9a4518] text-white py-3 font-medium transition disabled:opacity-60"
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
          </button>

          <p className="text-sm text-[#1c2433]/70">
            {mode === "login" ? "Need an account?" : "Already registered?"}{" "}
            <button
              type="button"
              className="text-[#c45c26] font-medium underline-offset-4 hover:underline"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
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
