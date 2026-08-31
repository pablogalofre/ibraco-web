"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [checkingSession, setCheckingSession] =
    useState(true);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    let active = true;

    async function checkSession() {
      if (isLoginPage) {
        if (active) {
          setCheckingSession(false);
        }
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      setCheckingSession(false);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (
          !session &&
          pathname !== "/admin/login"
        ) {
          router.replace("/admin/login");
        }
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [isLoginPage, pathname, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checkingSession) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f5e9",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: "#009c4b",
              fontSize: "14px",
              fontWeight: 900,
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            IBRACO
          </div>

          <strong>
            Verificando acceso...
          </strong>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}