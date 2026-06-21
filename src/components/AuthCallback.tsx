"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

function decodeBase64(encoded: string): string {
  const binary = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export default function AuthCallback() {
  const params = useSearchParams();

  useEffect(() => {
    const guilds = params.get("guilds");
    const user = params.get("user");
    if (!guilds || !user) return;

    try {
      sessionStorage.setItem("dispot_guilds", decodeBase64(guilds));
      sessionStorage.setItem("dispot_user", decodeBase64(user));
      window.dispatchEvent(new Event("dispot-login"));

      // 쿼리파라미터 제거 (히스토리 교체)
      const url = new URL(window.location.href);
      url.searchParams.delete("guilds");
      url.searchParams.delete("user");
      window.history.replaceState(null, "", url.toString());
    } catch {}
  }, []);

  return null;
}
