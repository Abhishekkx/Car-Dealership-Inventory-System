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
    <div className="min-h-screen bg-[#f4f7fb]">
      <header className="border-b border-black/10 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#c45c26]">
              Inventory
            </p>
            <h1 className="font-serif text-3xl text-[#10141c]">
              Car Dealership
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

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setView("inventory")}
            className={`px-4 py-2 border ${
              view === "inventory"
                ? "bg-[#10141c] text-white border-[#10141c]"
                : "bg-white border-black/15 hover:bg-[#e8edf4]"
            }`}
          >
            Inventory
          </button>
          <button
            type="button"
            onClick={() => setView("purchases")}
            className={`px-4 py-2 border ${
              view === "purchases"
                ? "bg-[#10141c] text-white border-[#10141c]"
                : "bg-white border-black/15 hover:bg-[#e8edf4]"
            }`}
          >
            My purchases
          </button>
        </div>

        {error ? (
          <p className="text-sm text-red-700 bg-red-50 px-3 py-2">{error}</p>
        ) : null}
        {message ? (
          <p className="text-sm text-emerald-800 bg-emerald-50 px-3 py-2">
            {message}
          </p>
        ) : null}

        {view === "inventory" ? (
          <>
            <form
              onSubmit={handleSearch}
              className="grid gap-3 md:grid-cols-6 bg-white p-4 border border-black/10"
            >
              <input
                placeholder="Make"
                value={filters.make}
                onChange={(e) => setFilters({ ...filters, make: e.target.value })}
                className="border border-black/10 px-3 py-2"
              />
              <input
                placeholder="Model"
                value={filters.model}
                onChange={(e) =>
                  setFilters({ ...filters, model: e.target.value })
                }
                className="border border-black/10 px-3 py-2"
              />
              <input
                placeholder="Category"
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
                className="border border-black/10 px-3 py-2"
              />
              <input
                placeholder="Min price"
                type="number"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters({ ...filters, minPrice: e.target.value })
                }
                className="border border-black/10 px-3 py-2"
              />
              <input
                placeholder="Max price"
                type="number"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters({ ...filters, maxPrice: e.target.value })
                }
                className="border border-black/10 px-3 py-2"
              />
              <button
                type="submit"
                className="bg-[#10141c] text-white px-4 py-2 hover:bg-[#1c2433]"
              >
                Search
              </button>
            </form>

            {isAdmin ? (
              <form
                onSubmit={handleSaveVehicle}
                className="grid gap-3 md:grid-cols-6 bg-white p-4 border border-black/10"
              >
                <h2 className="md:col-span-6 font-serif text-2xl">
                  {editingId ? "Update vehicle" : "Add vehicle"}
                </h2>
                <input
                  required
                  placeholder="Make"
                  value={form.make}
                  onChange={(e) => setForm({ ...form, make: e.target.value })}
                  className="border border-black/10 px-3 py-2"
                />
                <input
                  required
                  placeholder="Model"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className="border border-black/10 px-3 py-2"
                />
                <input
                  required
                  placeholder="Category"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="border border-black/10 px-3 py-2"
                />
                <input
                  required
                  type="number"
                  min={0}
                  step="1"
                  placeholder="Price ($)"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="border border-black/10 px-3 py-2"
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
                  className="border border-black/10 px-3 py-2"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#c45c26] text-white px-4 py-2 hover:bg-[#9a4518]"
                  >
                    {editingId ? "Update" : "Add"}
                  </button>
                  {editingId ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setForm(emptyForm);
                      }}
                      className="border border-black/15 px-3"
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>
            ) : null}

            <section className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <h2 className="font-serif text-3xl">Available vehicles</h2>
                <p className="text-sm text-black/50">{vehicles.length} shown</p>
              </div>

              {loading ? (
                <p className="text-black/60">Loading inventory...</p>
              ) : vehicles.length === 0 ? (
                <p className="text-black/60">No vehicles found.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {vehicles.map((vehicle) => (
                    <article
                      key={vehicle.id}
                      className="border border-black/10 bg-white p-5 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-serif text-2xl">
                            {vehicle.make} {vehicle.model}
                          </h3>
                          <p className="text-sm text-black/50">
                            {vehicle.category}
                          </p>
                        </div>
                        <p className="text-lg font-semibold">
                          ${vehicle.price.toLocaleString()}
                        </p>
                      </div>

                      <p className="text-sm">
                        In stock:{" "}
                        <span className="font-medium">{vehicle.quantity}</span>
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <button
                          disabled={vehicle.quantity === 0}
                          onClick={() => void handlePurchase(vehicle.id)}
                          className="bg-[#10141c] text-white px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1c2433]"
                        >
                          Purchase
                        </button>

                        {isAdmin ? (
                          <>
                            <button
                              onClick={() => startEdit(vehicle)}
                              className="border border-black/15 px-4 py-2 hover:bg-[#e8edf4]"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => void handleDelete(vehicle.id)}
                              className="border border-red-300 text-red-700 px-4 py-2 hover:bg-red-50"
                            >
                              Delete
                            </button>
                            <div className="flex gap-2 items-center">
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
                                className="w-20 border border-black/10 px-2 py-2"
                              />
                              <button
                                onClick={() => void handleRestock(vehicle.id)}
                                className="border border-black/15 px-3 py-2 hover:bg-[#e8edf4]"
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
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-serif text-3xl">My purchases</h2>
              <p className="text-sm text-black/50">{purchases.length} shown</p>
            </div>

            {loading ? (
              <p className="text-black/60">Loading purchases...</p>
            ) : purchases.length === 0 ? (
              <p className="text-black/60">
                No purchases yet. Buy a vehicle from Inventory.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {purchases.map((purchase) => (
                  <article
                    key={purchase.id}
                    className="border border-black/10 bg-white p-5 space-y-2"
                  >
                    <h3 className="font-serif text-2xl">
                      {purchase.make} {purchase.model}
                    </h3>
                    <p className="text-sm text-black/50">{purchase.category}</p>
                    <p className="text-lg font-semibold">
                      ${purchase.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-black/60">
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
