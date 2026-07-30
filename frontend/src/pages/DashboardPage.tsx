import { useEffect, useState, type FormEvent } from "react";
import {
  api,
  type Purchase,
  type SearchParams,
  type Vehicle,
} from "../services/api";
import { useAuth } from "../services/auth";

interface VehicleFormState {
  make: string;
  model: string;
  category: string;
  price: string;
  quantity: string;
}

const emptyForm: VehicleFormState = {
  make: "",
  model: "",
  category: "",
  price: "",
  quantity: "",
};

type DashboardView = "inventory" | "purchases";

function stockPercent(quantity: number) {
  return Math.min(100, Math.max(8, (quantity / 20) * 100));
}

export function DashboardPage() {
  const { user, token, logout } = useAuth();
  const [view, setView] = useState<DashboardView>("inventory");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filters, setFilters] = useState<SearchParams>({
    make: "",
    model: "",
    category: "",
    minPrice: "",
    maxPrice: "",
  });
  const [form, setForm] = useState<VehicleFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState<Record<string, number>>({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "admin";

  function clearEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function loadVehicles(activeFilters: SearchParams = filters) {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const hasFilters = Object.values(activeFilters).some((value) => !!value);
      const result = hasFilters
        ? await api.searchVehicles(token, activeFilters)
        : await api.listVehicles(token);
      setVehicles(result.vehicles);
      if (
        editingId &&
        !result.vehicles.some((vehicle) => vehicle.id === editingId)
      ) {
        clearEdit();
      }    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  }

  async function loadPurchases() {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const result = await api.listMyPurchases(token);
      setPurchases(result.purchases);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load purchases");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (view === "inventory") {
      void loadVehicles();
    } else {
      void loadPurchases();
    }
  }, [token, view]);

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    await loadVehicles(filters);
  }

  async function handleSaveVehicle(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setError("");
    setMessage("");

    const price = Number(form.price);
    const quantity = Number(form.quantity);

    if (Number.isNaN(price) || price < 0) {
      setError("Enter a valid price");
      return;
    }
    if (Number.isNaN(quantity) || quantity < 0) {
      setError("Enter a valid quantity");
      return;
    }

    const payload = {
      make: form.make.trim(),
      model: form.model.trim(),
      category: form.category.trim(),
      price,
      quantity,
    };

    try {
      if (editingId) {
        await api.updateVehicle(token, editingId, payload);
        setMessage("Vehicle updated");
      } else {
        await api.createVehicle(token, payload);
        setMessage("Vehicle added");
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadVehicles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save vehicle");
    }
  }

  async function handlePurchase(id: string) {
    if (!token) return;
    setError("");
    setMessage("");
    try {
      await api.purchaseVehicle(token, id);
      setMessage("Purchase successful — view it in My purchases");
      await loadVehicles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed");
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    setError("");
    try {
      await api.deleteVehicle(token, id);
      setMessage("Vehicle deleted");
      if (editingId === id) {
        clearEdit();
      }
      await loadVehicles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function handleRestock(id: string) {
    if (!token) return;
    const quantity = restockQty[id] || 0;
    setError("");
    try {
      await api.restockVehicle(token, id, quantity);
      setMessage("Stock updated");
      await loadVehicles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Restock failed");
    }
  }

  function startEdit(vehicle: Vehicle) {
    setEditingId(vehicle.id);
    setForm({
      make: vehicle.make,
      model: vehicle.model,
      category: vehicle.category,
      price: String(vehicle.price),
      quantity: String(vehicle.quantity),
    });
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="animate-fade-in flex items-center gap-3">
            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink text-accent sm:flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 17h14l-1.4-4.2a2 2 0 0 0-1.9-1.3H8.3a2 2 0 0 0-1.9 1.3L5 17Z" />
                <path d="M7 11.5 8.2 8.2A1.5 1.5 0 0 1 9.6 7h4.8a1.5 1.5 0 0 1 1.4.8L17 11.5" />
                <circle cx="8" cy="18.5" r="1.4" />
                <circle cx="16" cy="18.5" r="1.4" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-accent">
                Inventory
              </p>
              <h1 className="font-display text-lg leading-tight font-bold text-ink sm:text-2xl">
                Car Dealership Inventory System
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm sm:gap-4">
            <div className="hidden text-right sm:block">
              <p className="font-semibold text-ink">
                {user?.name || user?.email}
              </p>
              <p className="capitalize text-slate">
                {user?.role}
                {user?.email ? ` · ${user.email}` : ""}
              </p>
            </div>
            <span className="rounded-md border border-line bg-fog px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-steel sm:hidden">
              {user?.role}
            </span>
            <button onClick={logout} className="btn-ghost">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-7 px-4 py-8 sm:px-6">
        <section className="animate-fade-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">
              {view === "inventory" ? "Showroom stock" : "Your purchases"}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate sm:text-base">
              {view === "inventory"
                ? "Search the lot, purchase available cars, and manage inventory with role-based controls."
                : "A private history of vehicles you have purchased from the lot."}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setView("inventory")}
              className={`view-tab ${
                view === "inventory" ? "view-tab-active" : "view-tab-idle"
              }`}
            >
              Inventory
            </button>
            <button
              type="button"
              onClick={() => setView("purchases")}
              className={`view-tab ${
                view === "purchases" ? "view-tab-active" : "view-tab-idle"
              }`}
            >
              My purchases
            </button>
          </div>
        </section>

        {error ? (
          <p className="animate-fade-in rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="animate-fade-in rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-success">
            {message}
          </p>
        ) : null}

        {view === "inventory" ? (
          <>
            <form
              onSubmit={handleSearch}
              className="animate-fade-up surface grid gap-3 rounded-xl p-4 sm:grid-cols-2 lg:grid-cols-6"
            >
              <input
                placeholder="Make"
                value={filters.make}
                onChange={(e) => setFilters({ ...filters, make: e.target.value })}
                className="input-field"
              />
              <input
                placeholder="Model"
                value={filters.model}
                onChange={(e) =>
                  setFilters({ ...filters, model: e.target.value })
                }
                className="input-field"
              />
              <input
                placeholder="Category"
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
                className="input-field"
              />
              <input
                placeholder="Min price"
                type="number"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters({ ...filters, minPrice: e.target.value })
                }
                className="input-field"
              />
              <input
                placeholder="Max price"
                type="number"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters({ ...filters, maxPrice: e.target.value })
                }
                className="input-field"
              />
              <button type="submit" className="btn-ink w-full">
                Search
              </button>
            </form>

            {isAdmin ? (
              <form
                onSubmit={handleSaveVehicle}
                className="animate-fade-up surface grid gap-3 rounded-xl p-5 sm:grid-cols-2 lg:grid-cols-6"
              >
                <div className="sm:col-span-2 lg:col-span-6">
                  <h3 className="font-display text-2xl font-bold text-ink">
                    {editingId ? "Update vehicle" : "Add vehicle"}
                  </h3>
                  <p className="mt-1 text-sm text-slate">
                    Admin tools for stocking and correcting inventory records.
                  </p>
                </div>
                <input
                  required
                  placeholder="Make"
                  value={form.make}
                  onChange={(e) => setForm({ ...form, make: e.target.value })}
                  className="input-field"
                />
                <input
                  required
                  placeholder="Model"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className="input-field"
                />
                <input
                  required
                  placeholder="Category"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="input-field"
                />
                <input
                  required
                  type="number"
                  min={0}
                  step="1"
                  placeholder="Price ($)"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="input-field"
                />
                <input
                  required
                  type="number"
                  min={0}
                  step="1"
                  placeholder="Quantity"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                  className="input-field"
                />
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex-1">
                    {editingId ? "Update" : "Add"}
                  </button>
                  {editingId ? (
                    <button
                      type="button"
                      onClick={clearEdit}
                      className="btn-ghost"
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>
            ) : null}

            <section className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <h3 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                  Available vehicles
                </h3>
                <p className="rounded-full bg-fog px-3 py-1 text-sm text-slate">
                  {vehicles.length} shown
                </p>
              </div>

              {loading ? (
                <p className="text-slate">Loading inventory...</p>
              ) : vehicles.length === 0 ? (
                <div className="surface rounded-xl p-10 text-center">
                  <p className="font-display text-2xl font-bold text-ink">
                    Lot is empty
                  </p>
                  <p className="mt-2 text-sm text-slate">
                    {isAdmin
                      ? "Add a vehicle above to start building inventory."
                      : "Check back soon or clear your search filters."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {vehicles.map((vehicle, index) => (
                    <article
                      key={vehicle.id}
                      className="vehicle-tile surface animate-fade-up space-y-4 p-5"
                      style={{ animationDelay: `${Math.min(index, 6) * 40}ms` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                            {vehicle.category}
                          </p>
                          <h4 className="font-display mt-1 text-2xl font-bold text-ink sm:text-3xl">
                            {vehicle.make} {vehicle.model}
                          </h4>
                        </div>
                        <p className="rounded-md bg-ink px-2.5 py-1 text-sm font-bold text-white">
                          ${vehicle.price.toLocaleString()}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <p className="text-slate">
                            In stock:{" "}
                            <span className="font-semibold text-ink">
                              {vehicle.quantity}
                            </span>
                          </p>
                          {vehicle.quantity === 0 ? (
                            <span className="text-xs font-semibold uppercase tracking-wide text-danger">
                              Out of stock
                            </span>
                          ) : null}
                        </div>
                        <div className="stock-bar">
                          <span
                            style={{
                              width:
                                vehicle.quantity === 0
                                  ? "0%"
                                  : `${stockPercent(vehicle.quantity)}%`,
                              background:
                                vehicle.quantity === 0
                                  ? "transparent"
                                  : undefined,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 border-t border-line pt-4">
                        <button
                          disabled={vehicle.quantity === 0}
                          onClick={() => void handlePurchase(vehicle.id)}
                          className="btn-ink"
                        >
                          Purchase
                        </button>

                        {isAdmin ? (
                          <>
                            <button
                              onClick={() => startEdit(vehicle)}
                              className="btn-ghost"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => void handleDelete(vehicle.id)}
                              className="rounded-md border border-red-200 px-4 py-2 text-danger hover:bg-red-50"
                            >
                              Delete
                            </button>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={1}
                                placeholder="Qty"
                                value={restockQty[vehicle.id] ?? ""}
                                onChange={(e) =>
                                  setRestockQty({
                                    ...restockQty,
                                    [vehicle.id]: Number(e.target.value),
                                  })
                                }
                                className="input-field w-20"
                              />
                              <button
                                onClick={() => void handleRestock(vehicle.id)}
                                className="btn-ghost"
                              >
                                Restock
                              </button>
                            </div>
                          </>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="animate-fade-up space-y-4">
            {loading ? (
              <p className="text-slate">Loading purchases...</p>
            ) : purchases.length === 0 ? (
              <div className="surface rounded-xl p-10 text-center">
                <p className="font-display text-2xl font-bold text-ink">
                  No purchases yet
                </p>
                <p className="mt-2 text-sm text-slate">
                  Buy a vehicle from Inventory to see it listed here.
                </p>
                <button
                  type="button"
                  onClick={() => setView("inventory")}
                  className="btn-primary mt-5"
                >
                  Browse inventory
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {purchases.map((purchase, index) => (
                  <article
                    key={purchase.id}
                    className="vehicle-tile surface animate-fade-up space-y-2 p-5"
                    style={{ animationDelay: `${Math.min(index, 6) * 40}ms` }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                      {purchase.category}
                    </p>
                    <h3 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                      {purchase.make} {purchase.model}
                    </h3>
                    <p className="text-sm text-slate">
                      Bought by {purchase.buyerName} ({purchase.buyerEmail})
                    </p>
                    <p className="text-lg font-bold text-ink">
                      ${purchase.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate">
                      Purchased on{" "}
                      {new Date(purchase.purchasedAt).toLocaleString()}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
