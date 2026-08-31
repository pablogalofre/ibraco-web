"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Order = {
  id: number;
  order_number: string;
  order_status: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  course_name: string | null;
  amount: number | null;
  currency: string | null;
  payment_status: string | null;
  payment_reference: string | null;
  q10_status: string | null;
  created_at: string;
};

export default function ContabilidadPage() {
 

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          order_number,
          order_status,
          first_name,
          last_name,
          email,
          course_name,
          amount,
          currency,
          payment_status,
          payment_reference,
          q10_status,
          created_at
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargando órdenes:", error);
        setErrorMessage("No fue posible cargar los pagos.");
        setLoading(false);
        return;
      }

      setOrders((data || []) as Order[]);
      setLoading(false);
    }

    loadOrders();
  }, []);

  const stats = useMemo(() => {
    const paid = orders.filter(
      (order) =>
        order.payment_status === "paid" ||
        order.order_status === "paid"
    );

    const pending = orders.filter(
      (order) =>
        order.payment_status === "pending" &&
        order.order_status === "pending"
    );

    const failed = orders.filter(
      (order) =>
        order.payment_status === "failed" ||
        order.order_status === "payment_failed"
    );

    const revenue = paid.reduce(
      (total, order) => total + Number(order.amount || 0),
      0
    );

    return {
      revenue,
      paid: paid.length,
      pending: pending.length,
      failed: failed.length,
    };
  }, [orders]);

  function money(value: number) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function date(value: string) {
    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  function paymentLabel(status: string | null) {
    if (status === "paid") return "Pagado";
    if (status === "failed") return "Fallido";
    return "Pendiente";
  }

  function q10Label(status: string | null) {
    if (status === "completed") return "Registrado";
    if (status === "failed") return "Error";
    return "Pendiente";
  }

  return (
    <main
      style={{
        padding: "40px",
        maxWidth: "1500px",
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: "32px" }}>
        <p
          style={{
            color: "#009c4b",
            fontWeight: 800,
            marginBottom: "6px",
          }}
        >
          IBRACO
        </p>

        <h1
          style={{
            fontSize: "36px",
            margin: 0,
          }}
        >
          Contabilidad
        </h1>

        <p style={{ color: "#666", marginTop: "8px" }}>
          Control de ventas, pagos y matrículas.
        </p>
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <StatCard
          title="Recaudo aprobado"
          value={money(stats.revenue)}
        />

        <StatCard
          title="Ventas pagadas"
          value={String(stats.paid)}
        />

        <StatCard
          title="Pendientes"
          value={String(stats.pending)}
        />

        <StatCard
          title="Fallidas"
          value={String(stats.failed)}
        />
      </section>

      {loading && <p>Cargando pagos...</p>}

      {errorMessage && (
        <p style={{ color: "#b42318" }}>{errorMessage}</p>
      )}

      {!loading && !errorMessage && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: "18px",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "1100px",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f7f7f7",
                  textAlign: "left",
                }}
              >
                <Th>Fecha</Th>
                <Th>Pedido</Th>
                <Th>Alumno</Th>
                <Th>Curso</Th>
                <Th>Valor</Th>
                <Th>Pago</Th>
                <Th>Referencia MP</Th>
                <Th>Q10</Th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  style={{
                    borderTop: "1px solid #eee",
                  }}
                >
                  <Td>{date(order.created_at)}</Td>

                  <Td>
                    <strong>{order.order_number}</strong>
                  </Td>

                  <Td>
                    <strong>
                      {order.first_name} {order.last_name}
                    </strong>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#777",
                        marginTop: "3px",
                      }}
                    >
                      {order.email}
                    </div>
                  </Td>

                  <Td>{order.course_name || "—"}</Td>

                  <Td>
                    <strong>
                      {money(Number(order.amount || 0))}
                    </strong>
                  </Td>

                  <Td>
                    <StatusBadge
                      status={order.payment_status}
                      label={paymentLabel(
                        order.payment_status
                      )}
                    />
                  </Td>

                  <Td>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#555",
                      }}
                    >
                      {order.payment_reference || "—"}
                    </span>
                  </Td>

                  <Td>
                    <StatusBadge
                      status={order.q10_status}
                      label={q10Label(order.q10_status)}
                    />
                  </Td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#777",
                    }}
                  >
                    Todavía no hay ventas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: "18px",
        padding: "22px",
      }}
    >
      <div
        style={{
          color: "#666",
          fontSize: "14px",
          marginBottom: "8px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "28px",
          fontWeight: 900,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        padding: "16px",
        fontSize: "13px",
        color: "#555",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td
      style={{
        padding: "16px",
        fontSize: "14px",
        verticalAlign: "middle",
      }}
    >
      {children}
    </td>
  );
}

function StatusBadge({
  status,
  label,
}: {
  status: string | null;
  label: string;
}) {
  let background = "#fff3cd";
  let color = "#856404";

  if (status === "paid" || status === "completed") {
    background = "#e6f6ec";
    color = "#137333";
  }

  if (status === "failed") {
    background = "#fdecec";
    color = "#b42318";
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "7px 11px",
        borderRadius: "999px",
        background,
        color,
        fontSize: "12px",
        fontWeight: 800,
      }}
    >
      {label}
    </span>
  );
}