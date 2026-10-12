
"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: number;
  full_name: string;
  email: string | null;
  created_at: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setFullName("");
    setEmail("");
  };

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error("Please log in to view your customers.");
      }

      const { data, error: fetchError } = await supabase
        .from("customers")
        .select("id, full_name, email, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setCustomers((data ?? []) as Customer[]);
    } catch (err) {
      console.error("Loading customers error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  function startEditing(customer: Customer) {
    setEditingId(customer.id);
    setFullName(customer.full_name);
    setEmail(customer.email ?? "");
    setShowForm(true);
    setError("");
    setMessage("");
  }

  async function handleSaveCustomer(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const name = fullName.trim();
      const customerEmail = email.trim();

      if (!name) {
        throw new Error("Please enter the customer's name.");
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      const customerData = {
        full_name: name,
        email: customerEmail || null,
      };

      if (editingId !== null) {
        const { data, error: updateError } = await supabase
          .from("customers")
          .update(customerData)
          .eq("id", editingId)
          .eq("user_id", user.id)
          .select("id")
          .maybeSingle();

        if (updateError) throw updateError;

        if (!data) {
          throw new Error(
            "Customer not found or you do not have permission to edit this customer."
          );
        }

        setMessage("Customer updated successfully!");
      } else {
        const { error: insertError } = await supabase
          .from("customers")
          .insert({
            ...customerData,
            user_id: user.id,
          });

        if (insertError) throw insertError;

        setMessage("Customer added successfully!");
      }

      resetForm();
      setShowForm(false);
      await loadCustomers();
    } catch (err) {
      console.error("Saving customer error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save customer."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCustomer(customer: Customer) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customer.full_name}?`
    );

    if (!confirmed) return;

    setDeletingId(customer.id);
    setError("");
    setMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      const { data, error: deleteError } = await supabase
        .from("customers")
        .delete()
        .eq("id", customer.id)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();

      if (deleteError) throw deleteError;

      if (!data) {
        throw new Error(
          "Customer not found or you do not have permission to delete this customer."
        );
      }

      if (editingId === customer.id) {
        resetForm();
        setShowForm(false);
      }

      setMessage("Customer deleted successfully!");
      await loadCustomers();
    } catch (err) {
      console.error("Deleting customer error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete customer."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredCustomers = customers.filter((customer) => {
    const query = search.toLowerCase();

    return (
      customer.full_name.toLowerCase().includes(query) ||
      (customer.email ?? "").toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen p-4 sm:p-8">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-green-600">
            Customers
          </h1>

          <p className="mt-2 text-green-700">
            Manage your customers and their information.
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
          className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
        >
          {showForm ? "Cancel" : "+ Add Customer"}
        </button>
      </div>

      {/* Error and success messages */}
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700"
        >
          {message}
        </p>
      )}

      {/* Add / Edit customer form */}
      {showForm && (
        <form
          onSubmit={handleSaveCustomer}
          className="mt-6 max-w-xl space-y-4 rounded-xl border border-green-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-800">
            {editingId !== null
              ? "Edit Customer"
              : "Add New Customer"}
          </h2>

          <div>
            <label
              htmlFor="fullName"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Customer Name
            </label>

            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter customer name"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email Address (optional)
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Update Customer"
                  : "Save Customer"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                  setError("");
                }}
                className="rounded-full border border-green-600 px-6 py-2.5 text-sm font-medium text-green-700 hover:bg-green-50"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Search by customer name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-6 w-full max-w-md rounded-full border border-green-500 px-6 py-2 text-sm outline-none focus:ring-2 focus:ring-green-100"
      />

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Total customers: {customers.length}
        </p>
      </div>

      {/* Customers table */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-green-700 bg-white shadow-md">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-green-600">
              <th className="px-6 py-4 font-medium">Customer</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Date Added</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  Loading customers...
                </td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  {search
                    ? "No customers match your search."
                    : "No customers yet. Click Add Customer to get started."}
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b last:border-0 hover:bg-green-50"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {customer.full_name}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {customer.email || "—"}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                    {new Date(customer.created_at).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(customer)}
                        className="rounded-full border border-green-600 px-4 py-2 text-xs font-medium text-green-700 hover:bg-green-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === customer.id}
                        onClick={() =>
                          void handleDeleteCustomer(customer)
                        }
                        className="rounded-full border border-red-300 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === customer.id
                          ? "Deleting..."
                          : "Delete"}
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
