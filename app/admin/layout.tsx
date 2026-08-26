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
      /*
       * El login debe permanecer público.
       */
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

    /*
     * También escuchamos cambios de autenticación.
     * Si la sesión se cierra mientras estamos dentro
     * del admin, enviamos al login inmediatamente.
     */
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

  /*
   * La página de login siempre puede mostrarse.
   */
  if (isLoginPage) {
    return <>{children}</>;
  }

  /*
   * Mientras verificamos la sesión no mostramos
   * ninguna página administrativa.
   */
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