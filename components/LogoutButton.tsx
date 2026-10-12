
"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    router.replace("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full rounded-xl bg-red-50 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-100"
    >
      Logout
    </button>
  );
}
