import { useAuth } from "../services/auth";

export function HomePage() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-[#f4f7fb]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#c45c26]">
              Signed in
            </p>
            <h1 className="font-serif text-3xl text-[#10141c]">
              Car Dealership Inventory
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-right">
              <p className="font-medium">{user?.email}</p>
              <p className="text-black/50 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="border border-black/15 px-4 py-2 hover:bg-[#e8edf4]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="font-serif text-3xl text-[#10141c]">Welcome</h2>
        <p className="mt-3 max-w-xl text-[#1c2433]/80">
          Authentication is working. Vehicle dashboard, search, and purchase
          will be added next.
        </p>
      </section>
    </main>
  );
}
