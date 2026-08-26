"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!email || !password) {
      setMessage("Ingresa correo y contraseña.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const { error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        console.error(error);
        setMessage(
          "Correo o contraseña incorrectos."
        );
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage(
        "No fue posible iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main className="login-page">
        <div className="login-card">
          <div className="eyebrow">
            Administración IBRACO
          </div>

          <h1>Ingreso administrador</h1>

          <p className="intro">
            Accede con tu cuenta autorizada para
            administrar cursos y matrículas.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Correo electrónico</label>

              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="correo@ibraco.org.co"
              />
            </div>

            <div className="field">
              <label>Contraseña</label>

              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="••••••••"
              />
            </div>

            {message && (
              <div className="error-message">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Ingresando..."
                : "Ingresar"}
            </button>
          </form>

          <a
            href="/"
            className="back-link"
          >
            ← Volver al sitio
          </a>
        </div>
      </main>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .login-page {
          min-height: 100vh;
          padding: 40px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f5e9;
          font-family: Arial, sans-serif;
          color: #111;
        }

        .login-card {
          width: 100%;
          max-width: 480px;
          padding: 42px;
          border-radius: 28px;
          background: #fff;
          box-shadow: 0 24px 70px rgba(0,0,0,0.08);
        }

        .eyebrow {
          margin-bottom: 10px;
          color: #009c4b;
          font-size: 13px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        h1 {
          margin: 0 0 14px;
          font-size: 38px;
          line-height: 1;
          letter-spacing: -0.04em;
        }

        .intro {
          margin: 0 0 32px;
          color: #666;
          font-size: 16px;
          line-height: 1.5;
        }

        .field {
          margin-bottom: 20px;
        }

        .field label {
          display: block;
          margin-bottom: 7px;
          font-size: 14px;
          font-weight: 800;
        }

        .field input {
          width: 100%;
          padding: 15px 16px;
          border: 1px solid #d8d8d8;
          border-radius: 13px;
          background: #fff;
          color: #111;
          font-size: 16px;
        }

        .field input:focus {
          outline: 2px solid rgba(0,156,75,0.16);
          border-color: #009c4b;
        }

        .error-message {
          margin: 6px 0 18px;
          padding: 13px 15px;
          border-radius: 12px;
          background: #fdecec;
          color: #a2251b;
          font-size: 14px;
          font-weight: 700;
        }

        button {
          width: 100%;
          margin-top: 4px;
          padding: 16px 20px;
          border: 0;
          border-radius: 999px;
          background: #009c4b;
          color: #fff;
          font-size: 16px;
          font-weight: 900;
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        .back-link {
          display: block;
          margin-top: 24px;
          color: #555;
          text-align: center;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
        }

        @media (max-width: 600px) {
          .login-card {
            padding: 30px 22px;
          }

          h1 {
            font-size: 32px;
          }
        }
      `}</style>
    </>
  );
}