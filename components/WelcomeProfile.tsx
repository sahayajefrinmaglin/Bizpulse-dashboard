
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function WelcomeProfile() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Profile loading error:", error.message);
        }

        const profileName =
          profile?.full_name ??
          profile?.fullname ??
          profile?.name ??
          user.user_metadata?.full_name ??
          user.email?.split("@")[0] ??
          "there";

        const companyName =
          profile?.company_name ??
          profile?.["company name"] ??
          profile?.companyName ??
          "";

        setName(profileName);
        setCompany(companyName);
      } catch (error) {
        console.error("Unable to load profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-green-600 sm:text-3xl">
        {loading ? "Welcome back" : `Welcome back, ${name}!`}
      </h1>

      <p className="mt-2 text-green-700">
        {company
          ? `${company} — here's the latest pulse of your business.`
          : "Here's the latest pulse of your business."}
      </p>
    </div>
  );
}
