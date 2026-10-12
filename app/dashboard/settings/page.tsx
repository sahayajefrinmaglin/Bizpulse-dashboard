
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [notifications, setNotifications] = useState(true);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load profile from Supabase
  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setError("Please log in to view your profile.");
          return;
        }

        setEmail(user.email ?? "");

        const { data: profile, error: profileError } =
          await supabase
            .from("profiles")
            .select(
              "full_name, company_name, email_notifications"
            )
            .eq("id", user.id)
            .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        setName(
          profile?.full_name ??
            user.user_metadata?.full_name ??
            ""
        );

        setCompany(profile?.company_name ?? "");
        setNotifications(
          profile?.email_notifications ?? true
        );
      } catch (err) {
        console.error("Profile loading error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  // Save profile and notification preference
  async function handleSave() {
    setMessage("");
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Please log in again.");
      }

      const { error: saveError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            full_name: name.trim(),
            company_name: company.trim(),
            email_notifications: notifications,
          },
          { onConflict: "id" }
        );

      if (saveError) {
        throw saveError;
      }

      setMessage("Your profile has been saved successfully!");
    } catch (err) {
      console.error("Profile save error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  // Update password using Supabase Authentication
  async function handlePasswordChange(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword.length < 6) {
      setError(
        "Your new password must contain at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setUpdatingPassword(true);

    try {
      const { error: passwordError } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (passwordError) {
        throw passwordError;
      }

      setMessage("Your password has been updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Password update error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your password."
      );
    } finally {
      setUpdatingPassword(false);
    }
  }

  // Settings page UI
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-green-600">
        Settings
      </h1>

      <p className="mt-2 text-green-700">
        Manage your account settings.
      </p>

      {/* Success message */}
      {message && (
        <div
          role="status"
          className="mt-6 max-w-2xl rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          ✓ {message}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="mt-6 max-w-2xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-green-700">
          Loading your settings...
        </p>
      ) : (
        <>
          {/* Profile Information */}
          <section className="mt-8 max-w-2xl rounded-xl bg-white p-6 shadow-md">
            <h2 className="text-lg font-semibold text-green-600">
              My Profile
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="fullName"
                  className="text-sm font-medium text-green-700"
                >
                  Full Name
                </label>

                <input
                  id="fullName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-full border border-green-500 px-4 py-2 outline-none focus:ring-2 focus:ring-green-200"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label
                  htmlFor="companyName"
                  className="text-sm font-medium text-green-700"
                >
                  Company Name
                </label>

                <input
                  id="companyName"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="mt-2 w-full rounded-full border border-green-500 px-4 py-2 outline-none focus:ring-2 focus:ring-green-200"
                  placeholder="Enter your company name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-green-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  className="mt-2 w-full rounded-full border border-gray-300 bg-gray-100 px-4 py-2 text-gray-600 outline-none"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Your email is linked to your login account.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-green-900 px-5 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </section>

          {/* Notifications */}
          <section className="mt-6 max-w-2xl rounded-xl bg-white p-6 shadow-md">
            <h2 className="text-lg font-semibold text-green-600">
              Notifications
            </h2>

            <div className="mt-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-green-700">
                  Email Notifications
                </p>

                <p className="text-sm text-green-700">
                  Receive important account updates.
                </p>
              </div>

              <input
                type="checkbox"
                aria-label="Enable email notifications"
                checked={notifications}
                onChange={(e) =>
                  setNotifications(e.target.checked)
                }
                className="h-5 w-5 accent-green-700"
              />
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Click Save Changes in My Profile to save this preference.
            </p>
          </section>

          {/* Change Password */}
          <section className="mt-6 max-w-2xl rounded-xl bg-white p-6 shadow-md">
            <h2 className="text-lg font-semibold text-green-600">
              Change Password
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Update your account password securely.
            </p>

            <form
              onSubmit={handlePasswordChange}
              className="mt-5 space-y-5"
            >
              <div>
                <label
                  htmlFor="newPassword"
                  className="text-sm font-medium text-green-700"
                >
                  New Password
                </label>

                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  autoComplete="new-password"
                  minLength={6}
                  required
                  className="mt-2 w-full rounded-full border border-green-500 px-4 py-2 outline-none focus:ring-2 focus:ring-green-200"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-green-700"
                >
                  Confirm New Password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  autoComplete="new-password"
                  minLength={6}
                  required
                  className="mt-2 w-full rounded-full border border-green-500 px-4 py-2 outline-none focus:ring-2 focus:ring-green-200"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="rounded-full bg-green-900 px-5 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingPassword
                  ? "Updating..."
                  : "Update Password"}
              </button>
            </form>
          </section>
        </>
      )}
    </main>
  );
}
