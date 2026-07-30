/**
 * Post-login workspace: inventory search/purchase and admin stock tools.
 */
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
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

/** Maps stock quantity to a simple progress-bar width. */
function stockPercent(quantity: number) {
  return Math.min(100, Math.max(8, (quantity / 20) * 100));
}

function Icon({
  children,
  size = 18,
}: {
  children: ReactNode;
  size?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function CarMark({ size = 22 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M5 17h14l-1.4-4.2a2 2 0 0 0-1.9-1.3H8.3a2 2 0 0 0-1.9 1.3L5 17Z" />
      <path d="M7 11.5 8.2 8.2A1.5 1.5 0 0 1 9.6 7h4.8a1.5 1.5 0 0 1 1.4.8L17 11.5" />
      <circle cx="8" cy="18.5" r="1.4" />
      <circle cx="16" cy="18.5" r="1.4" />
    </Icon>
  );
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

  /** Exits edit mode and clears the admin vehicle form. */
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
      }
    } catch (err) {
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
    setMessage("");
    const activeFilters: SearchParams = {
      make: filters.make?.trim() || "",
      model: filters.model?.trim() || "",
      category: filters.category?.trim() || "",
      minPrice: filters.minPrice?.trim() || "",
      maxPrice: filters.maxPrice?.trim() || "",
    };
    setFilters(activeFilters);
    await loadVehicles(activeFilters);
  }

  /** Clears all search fields and reloads the full inventory lot. */
  async function clearFilters() {
    const reset: SearchParams = {
      make: "",
      model: "",
      category: "",
      minPrice: "",
      maxPrice: "",
    };
    setFilters(reset);
    setMessage("");
    setError("");
    await loadVehicles(reset);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen">
      <header className="dash-header sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="animate-fade-in flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink text-accent shadow-sm">
              <CarMark size={22} />
            </div>
            <div className="min-w-0">
              <h1 className="font-display truncate text-base leading-tight font-semibold text-ink sm:text-xl">
                Car Dealership Inventory System
              </h1>
              <p className="mt-0.5 truncate text-xs text-slate sm:text-sm">
                Welcome, {user?.name || user?.email}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-semibold text-ink">
                {user?.name || "User"}
              </p>
              <p className="max-w-[140px] truncate text-[11px] text-slate sm:max-w-[220px] sm:text-xs">
                {user?.email}
              </p>
            </div>
            <span
              className={`role-badge ${
                isAdmin ? "role-badge-admin" : "role-badge-user"
              }`}
            >
              {isAdmin ? (
                <Icon size={12}>
                  <path d="M12 3 4 7v5c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V7l-8-4Z" />
                </Icon>
              ) : (
                <Icon size={12}>
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 20a7 7 0 0 1 14 0" />
                </Icon>
              )}
              {user?.role}
            </span>
            <button onClick={logout} className="btn-ghost inline-flex items-center gap-2 px-3 py-2 sm:px-4">
              <Icon size={16}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </Icon>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-7 sm:px-6 sm:py-8">
        <section className="animate-fade-up flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              {view === "inventory" ? "Showroom stock" : "Your purchases"}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate sm:text-base">
              {view === "inventory"
                ? isAdmin
                  ? "Search, add, update, restock, and remove vehicles from inventory."
                  : "Browse available vehicles and complete a purchase."
                : "Track vehicles you have purchased from the lot."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setView("inventory")}
              className={`view-tab ${
                view === "inventory" ? "view-tab-active" : "view-tab-idle"
              }`}
            >
              <Icon size={16}>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </Icon>
              Inventory
            </button>
            <button
              type="button"
              onClick={() => setView("purchases")}
              className={`view-tab ${
                view === "purchases" ? "view-tab-active" : "view-tab-idle"
              }`}
            >
              <Icon size={16}>
                <path d="M6 6h15l-1.5 9h-12z" />
                <circle cx="9" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
                <path d="M6 6 5 3H2" />
              </Icon>
              My purchases
            </button>
          </div>
        </section>

        {error ? (
          <p className="animate-fade-in rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-danger">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="animate-fade-in rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-success">
            {message}
          </p>
        ) : null}

        {view === "inventory" ? (
          <>
            <form
              onSubmit={handleSearch}
              className="animate-fade-up surface space-y-3 rounded-2xl p-4 sm:p-5"
            >
              <div className="panel-title">
                <span className="icon-chip">
                  <Icon size={16}>
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </Icon>
                </span>
                <div>
                  <h3 className="font-semibold text-ink">Search inventory</h3>
                  <p className="text-xs text-slate sm:text-sm">
                    Fill any field (or combine them), then Search. Reset shows
                    the full lot again.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
                <input
                  placeholder="Make"
                  value={filters.make}
                  onChange={(e) =>
                    setFilters({ ...filters, make: e.target.value })
                  }
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
                  placeholder="Min price (₹)"
                  type="number"
                  min={0}
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, minPrice: e.target.value })
                  }
                  className="input-field"
                />
                <input
                  placeholder="Max price (₹)"
                  type="number"
                  min={0}
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, maxPrice: e.target.value })
                  }
                  className="input-field"
                />
                <button type="submit" className="btn-ink w-full">
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => void clearFilters()}
                  className="btn-ghost w-full"
                >
                  Reset
                </button>
              </div>
            </form>

            {isAdmin ? (
              <form
                onSubmit={handleSaveVehicle}
                className="animate-fade-up surface space-y-4 rounded-2xl p-4 sm:p-5"
              >
                <div className="panel-title">
                  <span className="icon-chip">
                    <Icon size={16}>
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </Icon>
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-ink sm:text-2xl">
                      {editingId ? "Update vehicle" : "Add vehicle"}
                    </h3>
                    <p className="text-sm text-slate">
                      Admin tools for stocking and correcting inventory records.
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
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
                    onChange={(e) =>
                      setForm({ ...form, model: e.target.value })
                    }
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
                    placeholder="Price (₹)"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
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
                </div>
              </form>
            ) : null}

            <section className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div className="panel-title">
                  <span className="icon-chip icon-chip-ink">
                    <CarMark size={16} />
                  </span>
                  <h3 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                    Available vehicles
                  </h3>
                </div>
                <p className="rounded-full bg-fog px-3 py-1 text-sm text-slate">
                  {vehicles.length} shown
                </p>
              </div>

              {loading ? (
                <p className="text-slate">Loading inventory...</p>
              ) : vehicles.length === 0 ? (
                <div className="surface empty-state">
                  <span className="icon-chip mx-auto mb-3">
                    <CarMark size={18} />
                  </span>
                  <p className="font-display text-2xl font-semibold text-ink">
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
                      style={{
                        animationDelay: `${Math.min(index, 6) * 40}ms`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                            {vehicle.category}
                          </p>
                          <h4 className="font-display mt-1 text-2xl font-semibold text-ink sm:text-[1.7rem]">
                            {vehicle.make} {vehicle.model}
                          </h4>
                        </div>
                        <p className="rounded-lg bg-ink px-2.5 py-1 text-sm font-bold text-white">
                          ₹{vehicle.price.toLocaleString("en-IN")}
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
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 border-t border-line pt-4">
                        <button
                          disabled={vehicle.quantity === 0}
                          onClick={() => void handlePurchase(vehicle.id)}
                          className="btn-ink inline-flex items-center gap-2"
                        >
                          <Icon size={15}>
                            <path d="M6 6h15l-1.5 9h-12z" />
                            <circle cx="9" cy="20" r="1" />
                            <circle cx="18" cy="20" r="1" />
                          </Icon>
                          Purchase
                        </button>

                        {isAdmin ? (
                          <>
                            <button
                              onClick={() => startEdit(vehicle)}
                              className="btn-ghost inline-flex items-center gap-2"
                            >
                              <Icon size={15}>
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                              </Icon>
                              Edit
                            </button>
                            <button
                              onClick={() => void handleDelete(vehicle.id)}
                              className="btn-danger inline-flex items-center gap-2"
                            >
                              <Icon size={15}>
                                <path d="M3 6h18" />
                                <path d="M8 6V4h8v2" />
                                <path d="m19 6-1 14H6L5 6" />
                              </Icon>
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
                                className="btn-ghost inline-flex items-center gap-2"
                              >
                                <Icon size={15}>
                                  <path d="M21 12a9 9 0 1 1-3-6.7" />
                                  <polyline points="21 3 21 9 15 9" />
                                </Icon>
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
              <div className="surface empty-state">
                <span className="icon-chip mx-auto mb-3">
                  <Icon size={18}>
                    <path d="M6 6h15l-1.5 9h-12z" />
                    <circle cx="9" cy="20" r="1" />
                    <circle cx="18" cy="20" r="1" />
                  </Icon>
                </span>
                <p className="font-display text-2xl font-semibold text-ink">
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
                    className="vehicle-tile surface animate-fade-up space-y-3 p-5"
                    style={{
                      animationDelay: `${Math.min(index, 6) * 40}ms`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                          {purchase.category}
                        </p>
                        <h3 className="font-display mt-1 text-2xl font-semibold text-ink sm:text-[1.7rem]">
                          {purchase.make} {purchase.model}
                        </h3>
                      </div>
                      <p className="rounded-lg bg-ink px-2.5 py-1 text-sm font-bold text-white">
                        ₹{purchase.price.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="space-y-1.5 border-t border-line pt-3 text-sm text-slate">
                      <p className="inline-flex items-center gap-2">
                        <Icon size={14}>
                          <circle cx="12" cy="8" r="3.5" />
                          <path d="M5 20a7 7 0 0 1 14 0" />
                        </Icon>
                        {purchase.buyerName} ({purchase.buyerEmail})
                      </p>
                      <p className="inline-flex items-center gap-2">
                        <Icon size={14}>
                          <rect x="3" y="5" width="18" height="16" rx="2" />
                          <path d="M3 10h18" />
                          <path d="M8 3v4" />
                          <path d="M16 3v4" />
                        </Icon>
                        {new Date(purchase.purchasedAt).toLocaleString()}
                      </p>
                    </div>
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
