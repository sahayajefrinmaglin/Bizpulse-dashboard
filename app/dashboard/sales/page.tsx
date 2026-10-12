
"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: number;
  full_name: string;
  email: string | null;
};

type Sale = {
  id: number;
  user_id: string;
  customer_id: number | null;
  amount: number;
  order_date: string;
  product: string | null;
  status: "Completed" | "Pending" | "Cancelled";
  customer?: {
    full_name: string;
  } | null;
};

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [customerId, setCustomerId] = useState("");
  const [product, setProduct] = useState("");
  const [amount, setAmount] = useState("");
  const [orderDate, setOrderDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );

  const [saleStatus, setSaleStatus] = useState<
    "Completed" | "Pending" | "Cancelled"
  >("Completed");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setCustomerId("");
    setProduct("");
    setAmount("");
    setOrderDate(new Date().toLocaleDateString("en-CA"));
    setSaleStatus("Completed");
  };

  const loadSales = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        throw new Error("Please log in to manage your sales.");
      }

      const [salesResult, customersResult] = await Promise.all([
        supabase
          .from("sales")
          .select(
            "id, user_id, customer_id, amount, order_date, product, status"
          )
          .eq("user_id", user.id)
          .order("order_date", { ascending: false }),

        supabase
          .from("customers")
          .select("id, full_name, email")
          .eq("user_id", user.id)
          .order("full_name", { ascending: true }),
      ]);

      if (salesResult.error) throw salesResult.error;
      if (customersResult.error) throw customersResult.error;

      const customerList = (customersResult.data ?? []) as Customer[];
      const salesList = (salesResult.data ?? []) as Sale[];

      const customersById = new Map(
        customerList.map((customer) => [customer.id, customer])
      );

      setCustomers(customerList);

      setSales(
        salesList.map((sale) => ({
          ...sale,
          amount: Number(sale.amount),
          status: sale.status ?? "Completed",
          customer: sale.customer_id
            ? {
                full_name:
                  customersById.get(sale.customer_id)?.full_name ??
                  "Unknown customer",
              }
            : null,
        }))
      );
    } catch (err) {
      console.error("Sales loading error:", err);
      setError(
        err instanceof Error ? err.message : "Unable to load sales."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSales();
  }, [loadSales]);

  function startEditing(sale: Sale) {
    setEditingId(sale.id);
    setCustomerId(
      sale.customer_id !== null ? String(sale.customer_id) : ""
    );
    setProduct(sale.product ?? "");
    setAmount(String(sale.amount));
    setOrderDate(sale.order_date);
    setSaleStatus(sale.status);
    setShowForm(true);
    setError("");
    setMessage("");
  }

  async function handleSaveSale(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        throw new Error("Please log in before saving a sale.");
      }

      if (
        amount.trim() === "" ||
        !Number.isFinite(Number(amount)) ||
        Number(amount) < 0
      ) {
        throw new Error("Enter a valid sale amount.");
      }

      if (!orderDate) {
        throw new Error("Please select a sale date.");
      }

      const saleData = {
        customer_id: customerId ? Number(customerId) : null,
        product: product.trim() || null,
        amount: Number(amount),
        order_date: orderDate,
        status: saleStatus,
      };

      if (editingId !== null) {
        const { data, error: updateError } = await supabase
          .from("sales")
          .update(saleData)
          .eq("id", editingId)
          .eq("user_id", user.id)
          .select("id")
          .maybeSingle();

        if (updateError) throw updateError;

        if (!data) {
          throw new Error(
            "Sale not found or you do not have permission to edit it."
          );
        }

        setMessage("Sale updated successfully!");
      } else {
        const { error: insertError } = await supabase
          .from("sales")
          .insert({
            ...saleData,
            user_id: user.id,
          });

        if (insertError) throw insertError;

        setMessage("Sale added successfully!");
      }

      resetForm();
      setShowForm(false);

      await loadSales();
    } catch (err) {
      console.error("Saving sale error:", err);
      setError(
        err instanceof Error ? err.message : "Unable to save the sale."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSale(sale: Sale) {
    const confirmed = window.confirm(
      `Are you sure you want to delete invoice #INV-${String(
        sale.id
      ).padStart(4, "0")}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");
    setDeletingId(sale.id);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        throw new Error("Please log in before deleting a sale.");
      }

      const { data, error: deleteError } = await supabase
        .from("sales")
        .delete()
        .eq("id", sale.id)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();

      if (deleteError) throw deleteError;

      if (!data) {
        throw new Error(
          "Sale not found or you do not have permission to delete it."
        );
      }

      if (editingId === sale.id) {
        resetForm();
        setShowForm(false);
      }

      setMessage("Sale deleted successfully!");

      await loadSales();
    } catch (err) {
      console.error("Deleting sale error:", err);
      setError(
        err instanceof Error ? err.message : "Unable to delete the sale."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredSales = sales.filter((sale) => {
    const customerName = sale.customer?.full_name ?? "";

    const matchesSearch =
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      (sale.product ?? "").toLowerCase().includes(search.toLowerCase()) ||
      String(sale.id).includes(search);

    const matchesStatus =
      status === "All Status" || sale.status === status;

    return matchesSearch && matchesStatus;
  });

  function formatAmount(value: number) {
    return `AED ${value.toLocaleString("en-AE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return (
    <main className="min-h-screen p-4 sm:p-8">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-green-600">
            Sales
          </h1>

          <p className="mt-2 text-green-700">
            Manage and track your sales transactions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showForm) {
              resetForm();
              setShowForm(false);
            } else {
              resetForm();
              setShowForm(true);
            }

            setError("");
            setMessage("");
          }}
          className="rounded-full bg-green-900 px-6 py-3 text-sm font-medium text-white hover:bg-green-800"
        >
          {showForm ? "Cancel" : "+ Add Sale"}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {/* Success message */}
      {message && (
        <p
          role="status"
          className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          {message}
        </p>
      )}

      {/* Add / Edit Sale form */}
      {showForm && (
        <form
          onSubmit={handleSaveSale}
          className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-green-200 bg-white p-5 shadow-sm sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <h2 className="text-lg font-semibold text-green-800">
              {editingId !== null ? "Edit Sale" : "Add New Sale"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {editingId !== null
                ? `Editing invoice #INV-${String(editingId).padStart(4, "0")}`
                : "Enter the details of your sales transaction."}
            </p>
          </div>

          {/* Customer */}
          <div>
            <label
              htmlFor="customer"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Customer
            </label>

            <select
              id="customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full rounded-xl border border-green-300 px-4 py-3 text-sm"
            >
              <option value="">No customer selected</option>

              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.full_name}
                </option>
              ))}
            </select>

            {customers.length === 0 && (
              <p className="mt-2 text-xs text-gray-500">
                Add a customer on the Customers page to link one to this sale.
              </p>
            )}
          </div>

          {/* Product */}
          <div>
            <label
              htmlFor="product"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Product or Plan
            </label>

            <input
              id="product"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="e.g. Pro Plan"
              className="w-full rounded-xl border border-green-300 px-4 py-3 text-sm"
            />
          </div>

          {/* Amount */}
          <div>
            <label
              htmlFor="amount"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Amount (AED)
            </label>

            <input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 299"
              className="w-full rounded-xl border border-green-300 px-4 py-3 text-sm"
            />
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="orderDate"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Sale Date
            </label>

            <input
              id="orderDate"
              type="date"
              required
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full rounded-xl border border-green-300 px-4 py-3 text-sm"
            />
          </div>

          {/* Status */}
          <div className="sm:col-span-2">
            <label
              htmlFor="saleStatus"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Status
            </label>

            <select
              id="saleStatus"
              value={saleStatus}
              onChange={(e) =>
                setSaleStatus(
                  e.target.value as
                    | "Completed"
                    | "Pending"
                    | "Cancelled"
                )
              }
              className="w-full rounded-xl border border-green-300 px-4 py-3 text-sm"
            >
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Form buttons */}
          <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full bg-green-900 px-6 py-3 font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Update Sale"
                  : "Save Sale"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                  setError("");
                }}
                disabled={saving}
                className="w-full rounded-full border border-green-700 px-6 py-3 font-medium text-green-800 hover:bg-green-50 disabled:opacity-60"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      )}

      {/* Search and status filter */}
      <div className="mt-8 flex flex-col gap-4 rounded-2xl p-2 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Search customer, product or invoice..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full border border-green-500 px-6 py-3 text-sm outline-none focus:ring-2 focus:ring-green-200 md:max-w-md"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-full border border-green-500 px-6 py-3 text-sm"
        >
          <option>All Status</option>
          <option>Completed</option>
          <option>Pending</option>
          <option>Cancelled</option>
        </select>
      </div>

      {/* Sales table */}
      <div className="mt-5 overflow-x-auto rounded-xl border border-green-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-green-700">
              <th className="px-6 py-4 font-medium">Invoice</th>
              <th className="px-6 py-4 font-medium">Customer</th>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  Loading sales...
                </td>
              </tr>
            ) : filteredSales.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  No sales found. Click Add Sale to create your first record.
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr
                  key={sale.id}
                  className="border-b last:border-0 hover:bg-green-50"
                >
                  <td className="whitespace-nowrap px-6 py-4 font-medium">
                    #INV-{String(sale.id).padStart(4, "0")}
                  </td>

                  <td className="px-6 py-4">
                    {sale.customer?.full_name ?? "—"}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {sale.product ?? "—"}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 font-medium">
                    {formatAmount(sale.amount)}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={
                        sale.status === "Completed"
                          ? "rounded-full bg-green-100 px-3 py-1 text-xs text-green-700"
                          : sale.status === "Pending"
                            ? "rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700"
                            : "rounded-full bg-red-100 px-3 py-1 text-xs text-red-700"
                      }
                    >
                      {sale.status}
                    </span>
                  </td>

                  {/* Edit and Delete actions */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(sale)}
                        className="rounded-full border border-green-700 px-4 py-2 text-xs font-medium text-green-800 hover:bg-green-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleDeleteSale(sale)}
                        disabled={deletingId === sale.id}
                        className="rounded-full border border-red-300 px-4 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === sale.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
