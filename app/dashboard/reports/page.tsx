
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const reports = [
  {
    name: "Sales Report",
    description: "Detailed sales and transaction information.",
  },
  {
    name: "Revenue Report",
    description: "Monthly revenue and financial performance.",
  },
  {
    name: "Customer Report",
    description: "Customer growth and registration information.",
  },
  {
    name: "Product Report",
    description: "Product prices, stock, and performance information.",
  },
];

type Sale = {
  id: number;
  product: string | null;
  amount: number;
  order_date: string;
  status: string;
};

type Customer = {
  id: number | string;
  full_name: string | null;
  email: string | null;
  created_at: string | null;
};

type Product = {
  id: number | string;
  name: string;
  price: number;
  stock_quantity: number;
  created_at: string | null;
};

type CSVValue = string | number | null;

export default function ReportsPage() {
  const [generatedReport, setGeneratedReport] = useState("");
  const [loadingReport, setLoadingReport] = useState("");

  // Download a CSV file
  const downloadCSV = (
    fileName: string,
    headers: string[],
    rows: CSVValue[][]
  ) => {
    const escapeCSV = (value: CSVValue) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Display a readable Supabase error
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }

    if (error && typeof error === "object") {
      const err = error as Record<string, unknown>;

      const details = [
        err.message,
        err.details,
        err.hint,
        err.code ? `Code: ${err.code}` : null,
      ]
        .filter(
          (value) =>
            value !== null &&
            value !== undefined &&
            String(value).length > 0
        )
        .map(String);

      if (details.length > 0) {
        return details.join(" | ");
      }

      try {
        return JSON.stringify(error);
      } catch {
        return "An unknown database error occurred.";
      }
    }

    return String(error);
  };

  const handleGenerateReport = async (reportName: string) => {
    setGeneratedReport("");
    setLoadingReport(reportName);

    try {
      // Get the currently logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        setGeneratedReport("Please log in to generate reports.");
        return;
      }

      // SALES REPORT
      if (reportName === "Sales Report") {
        const { data, error } = await supabase
          .from("sales")
          .select("id, product, amount, order_date, status")
          .eq("user_id", user.id)
          .order("order_date", { ascending: false });

        if (error) throw error;

        const records = (data ?? []) as Sale[];

        if (records.length === 0) {
          setGeneratedReport("No sales records found to export.");
          return;
        }

        downloadCSV(
          "sales-report.csv",
          [
            "Sale ID",
            "Order Date",
            "Product",
            "Amount (AED)",
            "Status",
          ],
          records.map((sale) => [
            sale.id,
            sale.order_date,
            sale.product,
            Number(sale.amount).toFixed(2),
            sale.status,
          ])
        );

        setGeneratedReport("Sales Report downloaded successfully.");
      }

      // REVENUE REPORT
      else if (reportName === "Revenue Report") {
        const { data, error } = await supabase
          .from("sales")
          .select("id, product, amount, order_date, status")
          .eq("user_id", user.id)
          .order("order_date", { ascending: false });

        if (error) throw error;

        const records = (data ?? []) as Sale[];
        const monthlyRevenue: Record<string, number> = {};

        records
          .filter(
            (sale) =>
              sale.status?.toLowerCase() !== "cancelled"
          )
          .forEach((sale) => {
            const month = sale.order_date.slice(0, 7);

            monthlyRevenue[month] =
              (monthlyRevenue[month] ?? 0) +
              Number(sale.amount);
          });

        const rows: CSVValue[][] = Object.entries(monthlyRevenue)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([month, revenue]) => [
            month,
            revenue.toFixed(2),
          ]);

        if (rows.length === 0) {
          setGeneratedReport(
            "No revenue records found to export."
          );
          return;
        }

        downloadCSV(
          "revenue-report.csv",
          ["Month", "Revenue (AED)"],
          rows
        );

        setGeneratedReport(
          "Revenue Report downloaded successfully."
        );
      }

      // CUSTOMER REPORT
      else if (reportName === "Customer Report") {
        const { data, error } = await supabase
          .from("customers")
          .select("id, full_name, email, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const records = (data ?? []) as Customer[];

        if (records.length === 0) {
          setGeneratedReport(
            "No customer records found for your account."
          );
          return;
        }

        downloadCSV(
          "customer-report.csv",
          [
            "Customer ID",
            "Full Name",
            "Email",
            "Registration Date",
          ],
          records.map((customer) => [
            customer.id,
            customer.full_name,
            customer.email,
            customer.created_at,
          ])
        );

        setGeneratedReport(
          "Customer Report downloaded successfully."
        );
      }

      // PRODUCT REPORT
      else if (reportName === "Product Report") {
        const { data, error } = await supabase
          .from("products")
          .select(
            "id, name, price, stock_quantity, created_at"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const records = (data ?? []) as Product[];

        if (records.length === 0) {
          setGeneratedReport(
            "No product records found for your account."
          );
          return;
        }

        downloadCSV(
          "product-report.csv",
          [
            "Product ID",
            "Product Name",
            "Price (AED)",
            "Stock Quantity",
            "Created Date",
          ],
          records.map((product) => [
            product.id,
            product.name,
            Number(product.price).toFixed(2),
            product.stock_quantity,
            product.created_at,
          ])
        );

        setGeneratedReport(
          "Product Report downloaded successfully."
        );
      }
    } catch (error: unknown) {
      console.error("Report generation error:", error);

      setGeneratedReport(
        `Unable to generate ${reportName}. ${getErrorMessage(error)}`
      );
    } finally {
      setLoadingReport("");
    }
  };

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-xl font-bold text-green-600 sm:text-2xl">
        Reports
      </h1>

      <p className="mt-2 text-green-700">
        Generate and download your business reports.
      </p>

      {generatedReport && (
        <div
          role="status"
          aria-live="polite"
          className="mt-6 break-words rounded-full border border-green-200 bg-green-100 px-4 py-3 text-sm text-green-700"
        >
          {generatedReport}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {reports.map((report) => (
          <div
            key={report.name}
            className="rounded-xl bg-white p-6 shadow-md"
          >
            <h2 className="text-lg font-semibold text-green-600">
              {report.name}
            </h2>

            <p className="mt-2 text-sm text-green-700">
              {report.description}
            </p>

            <button
              type="button"
              onClick={() => handleGenerateReport(report.name)}
              disabled={loadingReport !== ""}
              className="mt-5 rounded-full bg-green-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingReport === report.name
                ? "Generating..."
                : "Download CSV"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
