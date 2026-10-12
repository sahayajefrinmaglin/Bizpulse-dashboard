"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
  created_at: string;
};

const emptyForm = {
  name: "",
  price: "",
  stockQuantity: "0",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Stock");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState(emptyForm.name);
  const [price, setPrice] = useState(emptyForm.price);
  const [stockQuantity, setStockQuantity] = useState(
    emptyForm.stockQuantity
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadProducts() {
    setLoading(true);
    setError("");

    const { data: userData, error: userError } =
      await supabase.auth.getUser();

    if (userError || !userData.user) {
      setError("Please log in to view your products.");
      setLoading(false);
      return false;
    }

    const { data, error: fetchError } = await supabase
      .from("products")
      .select("id, name, price, stock_quantity, created_at")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return false;
    }

    setProducts((data ?? []) as Product[]);
    setLoading(false);
    return true;
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  function resetForm() {
    setName("");
    setPrice("");
    setStockQuantity("0");
    setEditingId(null);
    setShowForm(false);
  }

  function startEditing(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setPrice(String(product.price));
    setStockQuantity(String(product.stock_quantity));
    setShowForm(true);
    setError("");
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSaveProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const productName = name.trim();
    const productPrice = Number(price);
    const quantity = Number(stockQuantity);

    if (!productName) {
      setError("Please enter a product name.");
      setSaving(false);
      return;
    }

    if (
      price.trim() === "" ||
      !Number.isFinite(productPrice) ||
      productPrice < 0
    ) {
      setError("Enter a valid price of zero or more.");
      setSaving(false);
      return;
    }

    if (
      stockQuantity.trim() === "" ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      setError("Stock must be a whole number of zero or more.");
      setSaving(false);
      return;
    }

    const { data: userData, error: userError } =
      await supabase.auth.getUser();

    if (userError || !userData.user) {
      setError("Please log in again before saving.");
      setSaving(false);
      return;
    }

    const userId = userData.user.id;

    if (editingId !== null) {
      // Update an existing product owned by this user.
      const { data, error: updateError } = await supabase
        .from("products")
        .update({
          name: productName,
          price: productPrice,
          stock_quantity: quantity,
        })
        .eq("id", editingId)
        .eq("user_id", userId)
        .select("id")
        .maybeSingle();

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }

      if (!data) {
        setError(
          "Product was not updated. It may have been removed or you may not have permission."
        );
        setSaving(false);
        return;
      }

      resetForm();
      const refreshed = await loadProducts();

      if (refreshed) {
        setMessage("Product updated successfully!");
      }
    } else {
      // Insert a new product under the logged-in user's account.
      const { error: insertError } = await supabase
        .from("products")
        .insert({
          user_id: userId,
          name: productName,
          price: productPrice,
          stock_quantity: quantity,
        });

      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }

      resetForm();
      const refreshed = await loadProducts();

      if (refreshed) {
        setMessage("Product added successfully!");
      }
    }

    setSaving(false);
  }

  async function handleDeleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");
    setDeletingId(product.id);

    const { data: userData, error: userError } =
      await supabase.auth.getUser();

    if (userError || !userData.user) {
      setError("Please log in again before deleting a product.");
      setDeletingId(null);
      return;
    }

    const { data, error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id)
      .eq("user_id", userData.user.id)
      .select("id")
      .maybeSingle();

    if (deleteError) {
      setError(deleteError.message);
      setDeletingId(null);
      return;
    }

    if (!data) {
      setError(
        "Product was not deleted. It may have already been removed or you may not have permission."
      );
      setDeletingId(null);
      return;
    }

    if (editingId === product.id) {
      resetForm();
    }

    const refreshed = await loadProducts();

    if (refreshed) {
      setMessage("Product deleted successfully!");
    }

    setDeletingId(null);
  }

  function getStockStatus(quantity: number) {
    if (quantity === 0) return "Out of Stock";
    if (quantity <= 5) return "Low Stock";
    return "In Stock";
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const stockStatus = getStockStatus(product.stock_quantity);
    const matchesStatus =
      status === "All Stock" || stockStatus === status;

    return matchesSearch && matchesStatus;
  });

  return (
    <main className="min-h-screen p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-green-600">
            Products
          </h1>

          <p className="mt-2 text-green-700">
            Manage your products, prices, and available stock.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showForm && editingId === null) {
              resetForm();
            } else {
              setEditingId(null);
              setName("");
              setPrice("");
              setStockQuantity("0");
              setShowForm(true);
              setError("");
              setMessage("");
            }
          }}
          className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
        >
          {showForm && editingId === null
            ? "Cancel"
            : "+ Add Product"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSaveProduct}
          className="mt-6 max-w-xl space-y-4 rounded-xl border border-green-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-800">
            {editingId !== null ? "Edit Product" : "Add New Product"}
          </h2>

          <div>
            <label
              htmlFor="productName"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Product Name
            </label>

            <input
              id="productName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pro Plan"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label
              htmlFor="productPrice"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Price (AED)
            </label>

            <input
              id="productPrice"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="299.00"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label
              htmlFor="stockQuantity"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Stock Quantity
            </label>

            <input
              id="stockQuantity"
              type="number"
              min="0"
              step="1"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Save Changes"
                  : "Save Product"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="rounded-full border border-gray-300 px-6 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {message && (
        <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-4 break-words rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-4 rounded-xl p-5 md:flex-row">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full border border-green-500 px-6 py-2 text-sm outline-none focus:ring-2 focus:ring-green-100 md:max-w-md"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-full border border-green-500 px-6 py-2 text-sm"
        >
          <option>All Stock</option>
          <option>In Stock</option>
          <option>Low Stock</option>
          <option>Out of Stock</option>
        </select>
      </div>

      <p className="mt-2 text-sm text-gray-600">
        Total products: {products.length}
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-green-700 bg-white shadow-md">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-green-600">
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Stock</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  Loading products...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  {search || status !== "All Stock"
                    ? "No products match your search or filter."
                    : "No products yet. Click Add Product to get started."}
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const stockStatus = getStockStatus(
                  product.stock_quantity
                );

                return (
                  <tr
                    key={product.id}
                    className="border-b last:border-0 hover:bg-green-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {product.name}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      AED {Number(product.price).toFixed(2)}
                    </td>

                    <td className="px-6 py-4 font-medium">
                      {product.stock_quantity}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={
                          stockStatus === "In Stock"
                            ? "rounded-full bg-green-100 px-3 py-1 text-xs text-green-700"
                            : stockStatus === "Low Stock"
                              ? "rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700"
                              : "rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                        }
                      >
                        {stockStatus}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(product)}
                          disabled={deletingId !== null || saving}
                          className="rounded-full border border-green-600 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product)}
                          disabled={deletingId !== null || saving}
                          className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId === product.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}